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
const { generateRandomString, generateUUID, generateUUIDString } = require('../../../helper/services');
const { src } = require('../../../helper/path');
const { times } = require('lodash');

const { getInfoFromCode, modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);

const { templates } = require(`${src}/utils/responseCodes`);

const { clashRunStatus, triggerOptions } = require(`${src}/models/clashes.constants`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/clashes');
const ClashesProcessor = require(`${src}/processors/teamspaces/projects/clashes`);

jest.mock('../../../../../src/v5/models/clashes.runs');
const ClashesModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../src/v5/models/clashes.plans');
const ClashesPlans = require(`${src}/models/clashes.plans`);

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

const testStartClashRunsAfterNewRev = () => {
	describe(events.MODEL_IMPORT_FINISHED, () => {
		test(`Should fetch related plans and start runs if there is a ${events.MODEL_IMPORT_FINISHED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateUUIDString(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};

			const plans = times(5, () => ({
				_id: generateUUID(),
				selectionA: generateRandomString(),
				selectionB: generateRandomString(),
			}));

			ClashesPlans.getPlansByQuery.mockResolvedValueOnce(plans);
			// make one run to fail to ensure all the rest will run successfully
			ClashesProcessor.setLastRevForSelections.mockRejectedValueOnce(new Error(generateRandomString()));

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesPlans.getPlansByQuery).toHaveBeenCalledTimes(1);
			expect(ClashesPlans.getPlansByQuery).toHaveBeenCalledWith(data.teamspace, data.project, {
				trigger: triggerOptions.NEW_REVISION,
				$or: [
					{ 'selectionA.container': data.model },
					{ 'selectionB.container': data.model },
				],
			}, { project: 0 });

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(5);
			expect(ClashesProcessor.createRun).toHaveBeenCalledTimes(4);
		});

		test(`Should not start a run if there is a ${events.MODEL_IMPORT_FINISHED} but the model is not container`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateUUIDString(),
				user: generateRandomString(),
				modelType: modelTypes.DRAWING,
				data: { status: processStatuses.OK },
			};

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesPlans.getPlansByQuery).not.toHaveBeenCalled();
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});

		test(`Should not start a run if there is a ${events.MODEL_IMPORT_FINISHED} but the status is not OK`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateUUIDString(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.FAILED },
			};

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesPlans.getPlansByQuery).not.toHaveBeenCalled();
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});

		test(`Should fail gracefully on error if there is a ${events.MODEL_IMPORT_FINISHED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateUUIDString(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};

			ClashesPlans.getPlansByQuery.mockRejectedValueOnce(templates.clashPlanNotFound);

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesPlans.getPlansByQuery).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});

		test(`Should handle rejected error objects for ${events.MODEL_IMPORT_FINISHED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateUUIDString(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.OK },
			};

			ClashesPlans.getPlansByQuery.mockRejectedValueOnce(new Error(generateRandomString()));

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesPlans.getPlansByQuery).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	ClashEventsListener.init();

	testClashRunUpdate();
	testClashRunCompleted();
	testStartClashRunsAfterNewRev();
});
