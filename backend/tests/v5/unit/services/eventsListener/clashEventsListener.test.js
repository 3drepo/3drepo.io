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
const { generateRandomString, generateUUID } = require('../../../helper/services');
const { src } = require('../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

const { clashRunStatus } = require(`${src}/models/clashes.constants`);
const { getInfoFromCode } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/clashes');
const ClashesProcessor = require(`${src}/processors/teamspaces/projects/clashes`);

jest.mock('../../../../../src/v5/models/clashes.runs');
const ClashesModel = require(`${src}/models/clashes.runs`);

const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const ClashEventsListener = require(`${src}/services/eventsListener/components/clashEvents`);

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
				{ code: resInfo.retVal, reason: resInfo.message });
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

describe(determineTestGroup(__filename), () => {
	ClashEventsListener.init();

	testClashRunUpdate();
	testClashRunCompleted();
});
