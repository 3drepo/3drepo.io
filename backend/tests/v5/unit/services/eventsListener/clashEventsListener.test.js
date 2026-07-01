/**
 *  Copyright (C) 2026 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const { determineTestGroup } = require('../../../helper/utils');
const {
	generateRandomObject,
	generateRandomString,
	generateUUID,
	generateUUIDString,
} = require('../../../helper/services');
const { src } = require('../../../helper/path');
const { times } = require('lodash');

const { getInfoFromCode, modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);

const { templates } = require(`${src}/utils/responseCodes`);

const { clashRunStatus, triggerOptions } = require(`${src}/models/clashes.constants`);
const { UUIDToString } = require(`${src}/utils/helper/uuids`);

jest.mock('../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/tickets.templates');
const TicketTemplatesModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/clashes');
const ClashesProcessor = require(`${src}/processors/teamspaces/projects/clashes`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.clashes');
const TicketsClashes = require(`${src}/processors/teamspaces/projects/models/commons/tickets.clashes`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets');
const TicketsProcessor = require(`${src}/processors/teamspaces/projects/models/commons/tickets`);

jest.mock('../../../../../src/v5/models/clashes.runs');
const ClashesModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);
const { templates: mailTemplates } = require(`${src}/services/mailer/mailer.constants`);

const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const ClashEventsListener = require(`${src}/services/eventsListener/components/clashEvents`);
const { logger } = require(`${src}/utils/logger`);

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const publishAndWaitForEvent = async (event, data) => {
	const waitOnEvent = eventTriggeredPromise(event);
	EventsManager.publish(event, data);
	await waitOnEvent;
};

const testClashRunUpdate = () => {
	describe(events.CLASH_RUN_UPDATE, () => {
		const data = {
			teamspace: generateRandomString(),
			project: generateUUID(),
			runId: generateUUID(),
			status: generateRandomString(),
		};

		test.each([
			[`Should call updateRunStatus if there is a ${events.CLASH_RUN_UPDATE}`, undefined],
			[`Should fail gracefully on error if there is a ${events.CLASH_RUN_UPDATE}`, templates.clashRunNotFound],
			[`Should handle rejected error objects for ${events.CLASH_RUN_UPDATE}`, new Error(generateRandomString())],
		])('%s', async (desc, rejectUpdateRunStatus) => {
			if (rejectUpdateRunStatus) {
				ClashesModel.updateRunStatus.mockRejectedValueOnce(rejectUpdateRunStatus);
			}

			await publishAndWaitForEvent(events.CLASH_RUN_UPDATE, data);

			expect(ClashesModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, data.status);
		});
	});
};

const testClashRunCompleted = () => {
	describe(events.CLASH_RUN_COMPLETED, () => {
		const data = {
			teamspace: generateRandomString(),
			project: generateUUID(),
			runId: generateUUID(),
			results: generateRandomString(),
			value: 0,
		};
		const bouncerErrorData = { ...data, value: 28 };

		test.each([
			[`Should process clash results if there is a ${events.CLASH_RUN_COMPLETED}`, false, undefined],
			[`Should set the clash run to failed on bouncer error for ${events.CLASH_RUN_COMPLETED}`, true, undefined],
			[`Should fail gracefully on error if there is a ${events.CLASH_RUN_COMPLETED}`, false, templates.clashRunNotFound],
			[`Should handle rejected error objects for ${events.CLASH_RUN_COMPLETED}`, false, new Error(generateRandomString())],
		])('%s', async (desc, bouncerErrored, processClashResultsError) => {
			if (processClashResultsError) {
				ClashesProcessor.processClashResults.mockRejectedValueOnce(processClashResultsError);
			}

			await publishAndWaitForEvent(events.CLASH_RUN_COMPLETED, bouncerErrored ? bouncerErrorData : data);

			if (!bouncerErrored) {
				expect(ClashesProcessor.processClashResults).toHaveBeenCalledTimes(1);
				expect(ClashesProcessor.processClashResults).toHaveBeenCalledWith(data.teamspace, data.project,
					data.runId, data.results);
				return;
			}

			const resInfo = getInfoFromCode(bouncerErrorData.value);
			resInfo.retVal = bouncerErrorData.value;
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledWith(bouncerErrorData.teamspace,
				bouncerErrorData.project, bouncerErrorData.runId, clashRunStatus.FAILED,
				{ error: { code: resInfo.retVal, reason: resInfo.message } });
		});
	});
};

const generateProcessedEventData = () => ({
	teamspace: generateRandomString(),
	project: generateUUID(),
	runId: generateUUID(),
	plan: {
		_id: generateUUID(),
		name: generateRandomString(),
		type: generateRandomString(),
		selectionA: [generateRandomObject()],
		selectionB: [generateRandomObject()],
		tickets: generateRandomObject(),
	},
	results: generateRandomObject(),
});

const testClashRunProcessed = () => {
	describe(events.CLASH_RUN_RESULTS_PROCESSED, () => {
		const eventData = generateProcessedEventData();
		const basePlan = {
			_id: eventData.plan._id,
			name: generateRandomString(),
			tickets: {
				federation: generateRandomString(),
				template: generateRandomString(),
			},
		};
		const planWithTicketConfiguration = {
			...basePlan,
			tickets: {
				...basePlan.tickets,
				creator: generateRandomString(),
				valuesAtCreation: generateRandomObject(),
				defaultStatuses: generateRandomObject(),
			},
		};
		const planWithoutTicketConfiguration = { ...basePlan, tickets: undefined };
		const fed = { _id: generateRandomString() };
		const template = generateRandomObject();

		test.each([
			[`Should process clash tickets if there is a ${events.CLASH_RUN_RESULTS_PROCESSED}`, planWithTicketConfiguration, undefined, undefined, undefined, undefined],
			['Should not process clash tickets if the plan cannot be found', undefined, new Error(), undefined, undefined, undefined],
			['Should not process clash tickets if the plan has no ticket configuration', planWithoutTicketConfiguration, undefined, undefined, undefined, undefined],
			['Should not process clash tickets if the federation cannot be found', basePlan, undefined, new Error(), undefined, undefined],
			['Should not process clash tickets if the template cannot be found', basePlan, undefined, undefined, new Error(), undefined],
			['Should log an error if processing clash tickets fails', basePlan, undefined, undefined, undefined, new Error(generateRandomString())],
		])('%s', async (desc, plan, getPlanError, getFederationError, getTemplateError, processClashResultsError) => {
			if (getPlanError) {
				ClashPlansModel.getPlanById.mockRejectedValueOnce(getPlanError);
			} else {
				ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			}
			if (getFederationError) {
				ModelSettingsModel.getFederationById.mockRejectedValueOnce(getFederationError);
			} else if (plan?.tickets?.federation) {
				ModelSettingsModel.getFederationById.mockResolvedValueOnce(fed);
			}
			if (getTemplateError) {
				TicketTemplatesModel.getTemplateById.mockRejectedValueOnce(getTemplateError);
			} else if (plan?.tickets?.federation && !getFederationError) {
				TicketTemplatesModel.getTemplateById.mockResolvedValueOnce(template);
			}
			if (processClashResultsError) {
				jest.spyOn(logger, 'logError').mockImplementationOnce(() => {});
				TicketsClashes.processClashResults.mockRejectedValueOnce(processClashResultsError);
			}

			await publishAndWaitForEvent(events.CLASH_RUN_RESULTS_PROCESSED, eventData);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.plan._id, { tickets: 1, name: 1 });
			if (getPlanError || !plan?.tickets?.federation) {
				expect(ModelSettingsModel.getFederationById).not.toHaveBeenCalled();
				expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
				expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
				return;
			}

			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.federation, { _id: 1 });
			if (getFederationError) {
				expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
				expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
				return;
			}

			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.template);
			if (getTemplateError) {
				expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
				return;
			}

			expect(TicketsClashes.processClashResults).toHaveBeenCalledTimes(1);
			expect(TicketsClashes.processClashResults).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, fed._id, template, eventData.results,
				{ plan: { ...eventData.plan, tickets: plan.tickets, name: plan.name }, runId: eventData.runId });
			if (processClashResultsError) {
				expect(logger.logError).toHaveBeenCalledTimes(1);
				expect(logger.logError).toHaveBeenCalledWith(
					`Error processing clash run ${UUIDToString(eventData.runId)} `
					+ `for project ${UUIDToString(eventData.project)} `
					+ `in teamspace ${eventData.teamspace}: ${processClashResultsError.message}`,
				);
			}
		});
	});
};

const testOnNewContainerRevision = () => {
	describe(events.MODEL_IMPORT_FINISHED, () => {
		beforeEach(() => {
			ClashesProcessor.setLastRevForSelections.mockResolvedValue();
		});

		test.each([
			[`fetch related plans and start runs if there is a ${events.MODEL_IMPORT_FINISHED}`, undefined, true],
			[`not start a run if there is a ${events.MODEL_IMPORT_FINISHED} but the model is not container`, { modelType: modelTypes.DRAWING }, false],
			[`not start a run if there is a ${events.MODEL_IMPORT_FINISHED} but the status is not OK`, { data: { status: processStatuses.FAILED } }, false],
			[`fail gracefully on error if there is a ${events.MODEL_IMPORT_FINISHED}`, { getPlansError: templates.clashPlanNotFound }, false],
			[`handle rejected error objects for ${events.MODEL_IMPORT_FINISHED}`, { getPlansError: new Error(generateRandomString()) }, false],
			[`not start a run if a related container has no revision for ${events.MODEL_IMPORT_FINISHED}`, undefined, false, templates.revisionNotFound],
			[`not start a run if a related container has been deleted for ${events.MODEL_IMPORT_FINISHED}`, undefined, false, templates.containerNotFound],
		])('Should %s', async (desc, overrides = {}, shouldStartRuns, setLastRevError) => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const { data: dataOverrides = {}, getPlansError, ...eventOverrides } = overrides;
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateUUIDString(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK, ...dataOverrides },
				...eventOverrides,
			};
			const shouldQueryPlans = data.modelType === modelTypes.CONTAINER
				&& data.data.status === processStatuses.OK;
			const plans = times(setLastRevError ? 1 : 5, () => ({
				_id: generateUUID(),
				selectionA: [{ container: generateRandomString() }],
				selectionB: [{ container: generateRandomString() }],
			}));
			const shouldSetLastRev = shouldQueryPlans && !getPlansError;
			let loggerSpy;

			if (getPlansError) {
				ClashPlansModel.getPlansByQuery.mockRejectedValueOnce(getPlansError);
			} else if (shouldQueryPlans) {
				ClashPlansModel.getPlansByQuery.mockResolvedValueOnce(plans);
			}
			if (setLastRevError) {
				loggerSpy = jest.spyOn(logger, 'logError').mockImplementation(() => {});
				ClashesProcessor.setLastRevForSelections.mockRejectedValueOnce(setLastRevError);
			}

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			if (shouldQueryPlans) {
				expect(ClashPlansModel.getPlansByQuery).toHaveBeenCalledTimes(1);
				expect(ClashPlansModel.getPlansByQuery).toHaveBeenCalledWith(data.teamspace, data.project, {
					trigger: triggerOptions.NEW_REVISION,
					$or: [
						{ 'selectionA.container': data.model },
						{ 'selectionB.container': data.model },
					],
				}, { project: 0 });
			} else {
				expect(ClashPlansModel.getPlansByQuery).not.toHaveBeenCalled();
			}

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(shouldSetLastRev ? plans.length : 0);
			expect(ClashesProcessor.createRun).toHaveBeenCalledTimes(shouldStartRuns ? plans.length : 0);
			if (shouldStartRuns) {
				plans.forEach((plan, index) => {
					expect(ClashesProcessor.createRun).toHaveBeenNthCalledWith(
						index + 1,
						data.teamspace,
						data.project,
						plan,
						`auto:${triggerOptions.NEW_REVISION}::${UUIDToString(data.model)}`,
					);
				});
			}
			if (setLastRevError) {
				expect(loggerSpy).not.toHaveBeenCalled();
			}
			expect(Mailer.sendSystemEmail).not.toHaveBeenCalled();
			if (loggerSpy) {
				loggerSpy.mockRestore();
			}
		});

		test.each([
			['send a clash error email if a plan cannot be triggered due to an unexpected error', true, undefined],
			['gracefully handle the error if the clash error email cannot be sent', false, new Error(generateRandomString())],
		])('Should %s', async (desc, emailSendSucceeds, emailError) => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateUUIDString(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};
			const plan = {
				_id: generateUUID(),
				selectionA: [{ container: generateRandomString() }],
				selectionB: [{ container: generateRandomString() }],
			};
			const error = new Error(generateRandomString());
			const loggerSpy = jest.spyOn(logger, 'logError').mockImplementation(() => {});

			ClashPlansModel.getPlansByQuery.mockResolvedValueOnce([plan]);
			ClashesProcessor.setLastRevForSelections.mockRejectedValueOnce(error);
			if (!emailSendSucceeds) {
				Mailer.sendSystemEmail.mockRejectedValueOnce(emailError);
			}

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(mailTemplates.CLASH_ERROR.name, {
				errorMessage: error.message,
				teamspace: data.teamspace,
				project: UUIDToString(data.project),
				planId: UUIDToString(plan._id),
				runId: 'N/A',
			});
			expect(loggerSpy).toHaveBeenCalledWith(
				`Failed to start clash run for plan ${UUIDToString(plan._id)}: ${error.message}`,
			);
			loggerSpy.mockRestore();
		});
	});
};

const testClashPlanUpdated = () => {
	describe(events.CLASH_PLAN_UPDATED, () => {
		const eventData = {
			teamspace: generateRandomString(),
			project: generateUUIDString(),
			planId: generateUUIDString(),
		};

		const defaultData = { ...generateRandomObject(), name: generateRandomString() };

		test.each([
			[`Should call onClashPlanNameUpdated if there is a ${events.CLASH_PLAN_UPDATED} and name is updated`, defaultData, undefined],
			[`Should not call onClashPlanNameUpdated if there is a ${events.CLASH_PLAN_UPDATED} but name is not updated`, generateRandomObject(), undefined],
			[`Should fail gracefully on error if there is a ${events.CLASH_PLAN_UPDATED}`, defaultData, templates.clashPlanNotFound],
			[`Should handle rejected error objects for ${events.CLASH_PLAN_UPDATED}`, defaultData, new Error(generateRandomString())],
		])('%s', async (desc, data, error) => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_PLAN_UPDATED);

			if (data?.name) {
				TicketsProcessor.onClashPlanNameUpdated
					.mockImplementationOnce(() => (error ? Promise.reject(error) : Promise.resolve()));
			}

			EventsManager.publish(events.CLASH_PLAN_UPDATED, { ...eventData, data });

			await waitOnEvent;

			if (data?.name) {
				expect(TicketsProcessor.onClashPlanNameUpdated).toHaveBeenCalledTimes(1);
				expect(TicketsProcessor.onClashPlanNameUpdated).toHaveBeenCalledWith(eventData.teamspace,
					eventData.project, eventData.planId, data.name);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	ClashEventsListener.init();

	afterAll(() => {
		EventsManager.reset();
	});

	testClashRunUpdate();
	testClashRunCompleted();
	testOnNewContainerRevision();
	testClashRunProcessed();
	testClashPlanUpdated();
});
