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
const { generateRandomObject, generateRandomString, generateUUID } = require('../../../helper/services');
const { src } = require('../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

const { clashRunStatus } = require(`${src}/models/clashes.constants`);
const { getInfoFromCode } = require(`${src}/models/modelSettings.constants`);
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

const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const ClashEventsListener = require(`${src}/services/eventsListener/components/clashEvents`);
const { logger } = require(`${src}/utils/logger`);

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const testClashRunUpdate = () => {
	describe(events.CLASH_RUN_UPDATE, () => {
		test(`Should call updateRunStatus if there is a ${events.CLASH_RUN_UPDATE}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				runId: generateUUID(),
				status: generateRandomString(),
			};

			EventsManager.publish(events.CLASH_RUN_UPDATE, data);

			await waitOnEvent;

			expect(ClashesModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, data.status);
		});

		test(`Should fail gracefully on error if there is a ${events.CLASH_RUN_UPDATE}`, async () => {
			ClashesModel.updateRunStatus.mockRejectedValueOnce(templates.clashRunNotFound);
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				runId: generateUUID(),
				status: generateRandomString(),
			};

			EventsManager.publish(events.CLASH_RUN_UPDATE, data);

			await waitOnEvent;

			expect(ClashesModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, data.status);
		});

		test(`Should handle rejected error objects for ${events.CLASH_RUN_UPDATE}`, async () => {
			ClashesModel.updateRunStatus.mockRejectedValueOnce(new Error(generateRandomString()));
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				runId: generateUUID(),
				status: generateRandomString(),
			};

			EventsManager.publish(events.CLASH_RUN_UPDATE, data);

			await waitOnEvent;

			expect(ClashesModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, data.status);
		});
	});
};

const testClashRunCompleted = () => {
	describe(events.CLASH_RUN_COMPLETED, () => {
		test(`Should process clash results if there is a ${events.CLASH_RUN_COMPLETED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				runId: generateUUID(),
				results: generateRandomString(),
				value: 0,
			};

			EventsManager.publish(events.CLASH_RUN_COMPLETED, data);

			await waitOnEvent;

			expect(ClashesProcessor.processClashResults).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.processClashResults).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, data.results);
		});

		test(`Should set the clash run to failed on bouncer error for ${events.CLASH_RUN_COMPLETED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				runId: generateUUID(),
				results: generateRandomString(),
				value: 28,
			};

			EventsManager.publish(events.CLASH_RUN_COMPLETED, data);

			await waitOnEvent;

			const resInfo = getInfoFromCode(data.value);
			resInfo.retVal = data.value;
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledTimes(1);
			expect(ClashesModel.updateRunStatus).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, clashRunStatus.FAILED,
				{ error: { code: resInfo.retVal, reason: resInfo.message } });
		});

		test(`Should fail gracefully on error if there is a ${events.CLASH_RUN_COMPLETED}`, async () => {
			ClashesProcessor.processClashResults.mockRejectedValueOnce(templates.clashRunNotFound);
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				runId: generateUUID(),
				results: generateRandomString(),
				value: 0,
			};

			EventsManager.publish(events.CLASH_RUN_COMPLETED, data);

			await waitOnEvent;

			expect(ClashesProcessor.processClashResults).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.processClashResults).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, data.results);
		});

		test(`Should handle rejected error objects for ${events.CLASH_RUN_COMPLETED}`, async () => {
			ClashesProcessor.processClashResults.mockRejectedValueOnce(new Error(generateRandomString()));
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				runId: generateUUID(),
				results: generateRandomString(),
				value: 0,
			};

			EventsManager.publish(events.CLASH_RUN_COMPLETED, data);

			await waitOnEvent;

			expect(ClashesProcessor.processClashResults).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.processClashResults).toHaveBeenCalledWith(data.teamspace, data.project,
				data.runId, data.results);
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
		selectionA: generateRandomObject(),
		selectionB: generateRandomObject(),
		tickets: generateRandomObject(),
	},
	results: generateRandomObject(),
});

const testClashRunProcessed = () => {
	describe(events.CLASH_RUN_PROCESSED, () => {
		test(`Should process clash tickets if there is a ${events.CLASH_RUN_PROCESSED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_PROCESSED);
			const eventData = generateProcessedEventData();
			const planData = {
				_id: eventData.plan._id,
				tickets: {
					federation: generateRandomString(),
					template: generateRandomString(),
					creator: generateRandomString(),
					valuesAtCreation: generateRandomObject(),
					defaultStatuses: generateRandomObject(),
				},
			};
			const fed = { _id: generateRandomString() };
			const template = generateRandomObject();

			ClashPlansModel.getPlanById.mockResolvedValueOnce(planData);
			ModelSettingsModel.getFederationById.mockResolvedValueOnce(fed);
			TicketTemplatesModel.getTemplateById.mockResolvedValueOnce(template);

			EventsManager.publish(events.CLASH_RUN_PROCESSED, eventData);

			await waitOnEvent;

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.plan._id, { tickets: 1 });
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledWith(eventData.teamspace,
				planData.tickets.federation, { _id: 1 });
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledWith(eventData.teamspace,
				planData.tickets.template);
			expect(TicketsClashes.processClashResults).toHaveBeenCalledTimes(1);
			expect(TicketsClashes.processClashResults).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, fed._id, template, eventData.results,
				{ plan: { ...eventData.plan, tickets: planData.tickets }, runId: eventData.runId });
		});

		test('Should not process clash tickets if the plan cannot be found', async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_PROCESSED);
			const eventData = generateProcessedEventData();

			ClashPlansModel.getPlanById.mockRejectedValueOnce(new Error());

			EventsManager.publish(events.CLASH_RUN_PROCESSED, eventData);

			await waitOnEvent;

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.plan._id, { tickets: 1 });
			expect(ModelSettingsModel.getFederationById).not.toHaveBeenCalled();
			expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should not process clash tickets if the plan has no ticket configuration', async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_PROCESSED);
			const eventData = generateProcessedEventData();
			const plan = {
				type: generateRandomString(),
			};

			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);

			EventsManager.publish(events.CLASH_RUN_PROCESSED, eventData);

			await waitOnEvent;

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.plan._id, { tickets: 1 });
			expect(ModelSettingsModel.getFederationById).not.toHaveBeenCalled();
			expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should not process clash tickets if the federation cannot be found', async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_PROCESSED);
			const eventData = generateProcessedEventData();
			const plan = {
				type: generateRandomString(),
				tickets: {
					federation: generateRandomString(),
					template: generateRandomString(),
				},
			};

			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ModelSettingsModel.getFederationById.mockRejectedValueOnce(new Error());

			EventsManager.publish(events.CLASH_RUN_PROCESSED, eventData);

			await waitOnEvent;

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.plan._id, { tickets: 1 });
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.federation, { _id: 1 });
			expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should not process clash tickets if the template cannot be found', async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_PROCESSED);
			const eventData = generateProcessedEventData();
			const plan = {
				type: generateRandomString(),
				tickets: {
					federation: generateRandomString(),
					template: generateRandomString(),
				},
			};
			const fed = { _id: generateRandomString() };

			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ModelSettingsModel.getFederationById.mockResolvedValueOnce(fed);
			TicketTemplatesModel.getTemplateById.mockRejectedValueOnce(new Error());

			EventsManager.publish(events.CLASH_RUN_PROCESSED, eventData);

			await waitOnEvent;

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.plan._id, { tickets: 1 });
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.federation, { _id: 1 });
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.template);
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should log an error if processing clash tickets fails', async () => {
			const waitOnEvent = eventTriggeredPromise(events.CLASH_RUN_PROCESSED);
			const eventData = generateProcessedEventData();
			const plan = {
				_id: eventData.plan._id,
				name: generateRandomString(),
				type: generateRandomString(),
				tickets: {
					federation: generateRandomString(),
					template: generateRandomString(),
				},
			};
			const fed = { _id: generateRandomString() };
			const template = generateRandomObject();
			const error = new Error(generateRandomString());

			jest.spyOn(logger, 'logError').mockImplementationOnce(() => {});
			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ModelSettingsModel.getFederationById.mockResolvedValueOnce(fed);
			TicketTemplatesModel.getTemplateById.mockResolvedValueOnce(template);
			TicketsClashes.processClashResults.mockRejectedValueOnce(error);

			EventsManager.publish(events.CLASH_RUN_PROCESSED, eventData);

			await waitOnEvent;

			expect(TicketsClashes.processClashResults).toHaveBeenCalledTimes(1);
			expect(logger.logError).toHaveBeenCalledTimes(1);
			expect(logger.logError).toHaveBeenCalledWith(
				`Error processing clash run ${UUIDToString(eventData.runId)} `
				+ `for project ${UUIDToString(eventData.project)} in teamspace ${eventData.teamspace}: ${error.message}`,
			);
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
	testClashRunProcessed();
});
