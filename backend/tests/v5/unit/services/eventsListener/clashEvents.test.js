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
const { src } = require('../../../helper/path');

const { generateRandomObject, generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettingsModel = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/tickets.templates');
const TicketTemplatesModel = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/models/commons/tickets.clashes');
const TicketsClashes = require(`${src}/processors/teamspaces/projects/models/commons/tickets.clashes`);

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const ClashEventsListener = require(`${src}/services/eventsListener/clashEvents`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const { logger } = require(`${src}/utils/logger`);

const generateEventData = () => ({
	teamspace: generateRandomString(),
	project: generateRandomString(),
	runId: generateRandomString(),
	planId: generateRandomString(),
	results: generateRandomObject(),
});

const testInit = () => {
	describe('Init', () => {
		test(`Should subscribe to ${events.CLASH_RUN_PROCESSED}`, () => {
			ClashEventsListener.init();

			expect(EventsManager.subscribe).toHaveBeenCalledTimes(1);
			expect(EventsManager.subscribe).toHaveBeenCalledWith(events.CLASH_RUN_PROCESSED, expect.any(Function));
		});
	});
};

const testClashRunProcessed = () => {
	describe('Clash Run Processed Event', () => {
		afterEach(() => {
			jest.restoreAllMocks();
		});

		test(`Should process clash results if there is a ${events.CLASH_RUN_PROCESSED}`, async () => {
			ClashEventsListener.init();

			const eventData = generateEventData();
			const plan = {
				_id: eventData.planId,
				name: generateRandomString(),
				type: generateRandomString(),
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

			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ModelSettingsModel.getFederationById.mockResolvedValueOnce(fed);
			TicketTemplatesModel.getTemplateById.mockResolvedValueOnce(template);

			await EventsManager.subscribe.mock.calls[0][1](eventData);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.planId);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.federation, { _id: 1 });
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.template);
			expect(TicketsClashes.processClashResults).toHaveBeenCalledTimes(1);
			expect(TicketsClashes.processClashResults).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, fed._id, template, eventData.results, { plan, runId: eventData.runId });
		});

		test('Should not process clash results if the plan cannot be found', async () => {
			ClashEventsListener.init();

			const eventData = generateEventData();

			ClashPlansModel.getPlanById.mockRejectedValueOnce(new Error());

			await EventsManager.subscribe.mock.calls[0][1](eventData);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.planId);
			expect(ModelSettingsModel.getFederationById).not.toHaveBeenCalled();
			expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should not process clash results if the plan has no ticket configuration', async () => {
			ClashEventsListener.init();

			const eventData = generateEventData();
			const plan = {
				type: generateRandomString(),
			};

			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);

			await EventsManager.subscribe.mock.calls[0][1](eventData);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.planId);
			expect(ModelSettingsModel.getFederationById).not.toHaveBeenCalled();
			expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should not process clash results if the federation cannot be found', async () => {
			ClashEventsListener.init();

			const eventData = generateEventData();
			const plan = {
				type: generateRandomString(),
				tickets: {
					federation: generateRandomString(),
					template: generateRandomString(),
				},
			};

			ClashPlansModel.getPlanById.mockResolvedValueOnce(plan);
			ModelSettingsModel.getFederationById.mockRejectedValueOnce(new Error());

			await EventsManager.subscribe.mock.calls[0][1](eventData);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.planId);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.federation, { _id: 1 });
			expect(TicketTemplatesModel.getTemplateById).not.toHaveBeenCalled();
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should not process clash results if the template cannot be found', async () => {
			ClashEventsListener.init();

			const eventData = generateEventData();
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

			await EventsManager.subscribe.mock.calls[0][1](eventData);

			expect(ClashPlansModel.getPlanById).toHaveBeenCalledTimes(1);
			expect(ClashPlansModel.getPlanById).toHaveBeenCalledWith(eventData.teamspace,
				eventData.project, eventData.planId);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledTimes(1);
			expect(ModelSettingsModel.getFederationById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.federation, { _id: 1 });
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledTimes(1);
			expect(TicketTemplatesModel.getTemplateById).toHaveBeenCalledWith(eventData.teamspace,
				plan.tickets.template);
			expect(TicketsClashes.processClashResults).not.toHaveBeenCalled();
		});

		test('Should log an error if processing clash results fails', async () => {
			ClashEventsListener.init();

			const eventData = generateEventData();
			const plan = {
				_id: eventData.planId,
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

			await EventsManager.subscribe.mock.calls[0][1](eventData);

			expect(TicketsClashes.processClashResults).toHaveBeenCalledTimes(1);
			expect(logger.logError).toHaveBeenCalledTimes(1);
			expect(logger.logError).toHaveBeenCalledWith(
				`Error processing clash run ${eventData.runId} for project ${eventData.project} in teamspace ${eventData.teamspace}: ${error.message}`,
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testInit();
	testClashRunProcessed();
});
