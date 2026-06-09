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
const { generateClashPlan, generateRandomString, generateUUID } = require('../../../helper/services');
const { times } = require('lodash');
const { src } = require('../../../helper/path');

const { templates } = require(`${src}/utils/responseCodes`);

const { clashRunStatus, triggerOptions } = require(`${src}/models/clashes.constants`);
const { getInfoFromCode, modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../src/v5/processors/teamspaces/projects/clashes');
const ClashesProcessor = require(`${src}/processors/teamspaces/projects/clashes`);

jest.mock('../../../../../src/v5/models/clashes.runs');
const ClashesModel = require(`${src}/models/clashes.runs`);

jest.mock('../../../../../src/v5/models/clashes.plans');
const ClashPlansModel = require(`${src}/models/clashes.plans`);

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

const testModelImportFinished = () => {
	describe(events.MODEL_IMPORT_FINISHED, () => {
		test('Should create clash runs for related plans found after new container revision', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
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

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

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
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
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

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesProcessor.setLastRevForSelections).toHaveBeenCalledTimes(2);
			expect(ClashesProcessor.createRun).toHaveBeenCalledTimes(1);
			expect(ClashesProcessor.createRun)
				.toHaveBeenCalledWith(data.teamspace, data.project, plans[1], data.user);
			expect(logger.logError).toHaveBeenCalledWith(
				`Failed to start clash run for plan ${plans[0]._id}: ${error.message}`);
		});

		test('Should fail gracefully if related clash plans cannot be found after new container revision', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
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

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
			expect(logger.logError).toHaveBeenCalledWith(
				`Failed to start clash runs after new revision for container ${data.model}: ${error.message}`);
			expect(logger.logError).toHaveBeenCalledWith(error.stack);
		});

		test('Should not start clash runs if the new revision is not for a container', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.DRAWING,
				data: { status: processStatuses.OK },
			};

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashPlansModel.getPlansByQuery).not.toHaveBeenCalled();
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});

		test('Should not start clash runs if the new container revision has failed', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.CONTAINER,
				data: { status: processStatuses.FAILED },
			};

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(ClashPlansModel.getPlansByQuery).not.toHaveBeenCalled();
			expect(ClashesProcessor.setLastRevForSelections).not.toHaveBeenCalled();
			expect(ClashesProcessor.createRun).not.toHaveBeenCalled();
		});

		test('Should fail gracefully without stack logging if related clash plan lookup rejects without a stack', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
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

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;

			expect(logger.logError).toHaveBeenCalledTimes(1);
			expect(logger.logError).toHaveBeenCalledWith(
				`Failed to start clash runs after new revision for container ${data.model}: ${error.message}`);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	ClashEventsListener.init();

	testClashRunUpdate();
	testClashRunCompleted();
	testModelImportFinished();
});
