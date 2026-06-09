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
	generateClashPlan,
	generateRandomObject,
	generateRandomString,
	generateUUID,
} = require('../../../helper/services');
const { times } = require('lodash');
const { src } = require('../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

const { clashRunStatus, triggerOptions } = require(`${src}/models/clashes.constants`);
const { getInfoFromCode, modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);
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

jest.mock('../../../../../src/v5/models/clashes.runs');
const ClashesModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../src/v5/utils/logger', () => {
	const logError = jest.fn();
	return {
		labels: { event: 'EVENT' },
		logger: { logError },
		logWithLabel: () => ({ logDebug: jest.fn(), logError }),
	};
});
const { logger } = require(`${src}/utils/logger`);

const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const ClashEventsListener = require(`${src}/services/eventsListener/components/clashEvents`);

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
	describe(events.CLASH_RUN_PROCESSED, () => {
		const eventData = generateProcessedEventData();
		const basePlan = {
			_id: eventData.plan._id,
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
			[`Should process clash tickets if there is a ${events.CLASH_RUN_PROCESSED}`, planWithTicketConfiguration, undefined, undefined, undefined, undefined],
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

			await publishAndWaitForEvent(events.CLASH_RUN_PROCESSED, eventData);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.plan._id, { tickets: 1 });
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
				{ plan: { ...eventData.plan, tickets: plan.tickets }, runId: eventData.runId });
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

const testModelImportFinished = () => {
	describe(events.MODEL_IMPORT_FINISHED, () => {
		test('Should create clash runs for related plans found after new container revision', async () => {
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};

			const plans = times(5, () => generateClashPlan(data.model, generateRandomString()));
			plans[0].selectionA = [{ container: generateRandomString() }, { container: data.model }];
			plans[1].selectionB = [{ container: generateRandomString() }, { container: data.model }];
			ClashPlansModel.getPlansByQuery.mockResolvedValueOnce(plans);

			for (let i = 0; i < plans.length; i++) {
				ClashesProcessor.setLastRevForSelections.mockResolvedValueOnce();
				ClashesProcessor.createRun.mockResolvedValueOnce();
			}

			await publishAndWaitForEvent(events.MODEL_IMPORT_FINISHED, data);

			expect(ClashPlansModel.getPlansByQuery).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlansByQuery).toHaveBeenCalledWith(data.teamspace, data.project, {
				trigger: triggerOptions.NEW_REVISION,
				$or: [
					{ 'selectionA.container': data.model },
					{ 'selectionB.container': data.model },
				],
			}, { project: 0 });

			for (let i = 0; i < plans.length; i++) {
				expect(ClashesProcessor.setLastRevForSelections)
					.toHaveBeenCalledWith(data.teamspace, plans[i].selectionA, plans[i].selectionB);
				expect(ClashesProcessor.createRun)
					.toHaveBeenCalledWith(data.teamspace, data.project, plans[i], data.user);
			}
		});

		test('Should continue if a related clash plan fails to start after new container revision', async () => {
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};
			const error = new Error(generateRandomString());
			const plans = times(2, () => generateClashPlan(data.model, generateRandomString()));

			ClashPlansModel.getPlansByQuery.mockResolvedValueOnce(plans);
			ClashesProcessor.setLastRevForSelections.mockRejectedValueOnce(error);
			ClashesProcessor.setLastRevForSelections.mockResolvedValueOnce();
			ClashesProcessor.createRun.mockResolvedValueOnce();

			await publishAndWaitForEvent(events.MODEL_IMPORT_FINISHED, data);

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(2);
			expect(ClashesProcessor.createRun).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.createRun)
				.toHaveBeenCalledWith(data.teamspace, data.project, plans[1], data.user);
			expect(logger.logError).toHaveBeenCalledWith(
				`Failed to start clash run for plan ${plans[0]._id}: ${error.message}`);
		});

		test('Should fail gracefully if related clash plans cannot be found after new container revision', async () => {
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};
			const error = new Error(generateRandomString());
			ClashPlansModel.getPlansByQuery.mockRejectedValueOnce(error);

			await publishAndWaitForEvent(events.MODEL_IMPORT_FINISHED, data);

			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
			expect(logger.logError).toHaveBeenCalledWith(
				`Failed to start clash runs after new revision for container ${data.model}: ${error.message}`);
			expect(logger.logError).toHaveBeenCalledWith(error.stack);
		});

		test('Should not start clash runs if the new revision is not for a container', async () => {
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.DRAWING,
				data: { status: processStatuses.OK },
			};

			await publishAndWaitForEvent(events.MODEL_IMPORT_FINISHED, data);

			expect(ClashPlansModel.getPlansByQuery).not.toHaveBeenCalled();
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});

		test('Should not start clash runs if the new container revision has failed', async () => {
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.FAILED },
			};

			await publishAndWaitForEvent(events.MODEL_IMPORT_FINISHED, data);

			expect(ClashPlansModel.getPlansByQuery).not.toHaveBeenCalled();
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});

		test('Should fail gracefully without stack logging if related clash plan lookup rejects without a stack', async () => {
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};
			const error = { message: generateRandomString() };
			ClashPlansModel.getPlansByQuery.mockRejectedValueOnce(error);

			await publishAndWaitForEvent(events.MODEL_IMPORT_FINISHED, data);

			expect(logger.logError).toHaveBeenCalledTimes(1);
			expect(logger.logError).toHaveBeenCalledWith(
				`Failed to start clash runs after new revision for container ${data.model}: ${error.message}`);
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
	testModelImportFinished();
	testClashRunProcessed();
});
