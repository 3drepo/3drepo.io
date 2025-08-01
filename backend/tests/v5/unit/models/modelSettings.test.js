/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { times } = require('lodash');
const { src } = require('../../helper/path');
const { generateRandomString, generateUUIDString, generateUUID } = require('../../helper/services');

const { getInfoFromCode, modelTypes, processStatuses } = require(`${src}/models/modelSettings.constants`);
jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const Model = require(`${src}/models/modelSettings`);
jest.mock('../../../../src/v5/handler/db');
const DBHandler = require(`${src}/handler/db`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);

const SETTINGS_COL = 'settings';

const testGetModelById = () => {
	describe('Get ModelById', () => {
		test('should return content of model settings if found', async () => {
			const expectedData = {
				_id: 'abc',
				name: 'model name',
			};
			DBHandler.findOne.mockResolvedValueOnce(expectedData);

			const res = await Model.getModelById('someTS', 'someModel');
			expect(res).toEqual(expectedData);
		});
		test('should return error if model does not exists', async () => {
			DBHandler.findOne.mockResolvedValueOnce(undefined);

			await expect(Model.getModelById('someTS', 'someModel'))
				.rejects.toEqual(templates.modelNotFound);
		});
	});
};

const testGetContainerById = () => {
	describe('Get ContainerById', () => {
		test('should return content of container settings if found', async () => {
			const expectedData = {
				_id: 'abc',
				name: 'container name',
			};
			DBHandler.findOne.mockResolvedValueOnce(expectedData);

			const res = await Model.getContainerById('someTS', 'someContainer');
			expect(res).toEqual(expectedData);
		});
		test('should return error if container does not exists', async () => {
			DBHandler.findOne.mockResolvedValueOnce(undefined);

			await expect(Model.getContainerById('someTS', 'someContainer'))
				.rejects.toEqual(templates.containerNotFound);
		});

		test('should return error if some unknown error occured', async () => {
			const err = '123';
			DBHandler.findOne.mockRejectedValueOnce(err);

			await expect(Model.getContainerById('someTS', 'someContainer'))
				.rejects.toEqual(err);
		});
	});
};

const testGetDrawingById = () => {
	describe('GetDrawingById', () => {
		test('should return content of drawing settings if found', async () => {
			const expectedData = generateRandomString();
			DBHandler.findOne.mockResolvedValueOnce(expectedData);

			const res = await Model.getDrawingById(generateRandomString(), generateRandomString());
			expect(res).toEqual(expectedData);
		});

		test('should return error if drawing does not exists', async () => {
			DBHandler.findOne.mockResolvedValueOnce(undefined);

			await expect(Model.getDrawingById(generateRandomString(), generateRandomString()))
				.rejects.toEqual(templates.drawingNotFound);
		});

		test('should return error if some unknown error occured', async () => {
			const err = generateRandomString();
			DBHandler.findOne.mockRejectedValueOnce(err);

			await expect(Model.getDrawingById(generateRandomString(), generateRandomString()))
				.rejects.toEqual(err);
		});
	});
};

const testGetFederationById = () => {
	describe('Get FederationById', () => {
		test('should return content of federation settings if found (v5 schema)', async () => {
			const expectedData = {
				_id: 'abc',
				name: 'federation name',
				subModels: times(4, () => ({ _id: generateUUIDString(), group: generateRandomString() })),
			};
			DBHandler.findOne.mockResolvedValueOnce(expectedData);

			const res = await Model.getFederationById('someTS', 'someFederation');
			expect(res).toEqual(expectedData);
		});
		test('should return error if federation does not exist', async () => {
			DBHandler.findOne.mockResolvedValueOnce(undefined);

			await expect(Model.getFederationById('someTS', 'someFederation'))
				.rejects.toEqual(templates.federationNotFound);
		});

		test('should return error if some unknown error occured', async () => {
			const err = '123';
			DBHandler.findOne.mockRejectedValueOnce(err);

			await expect(Model.getFederationById('someTS', 'someFederation'))
				.rejects.toEqual(err);
		});
	});
};

const testGetModelByQuery = () => {
	describe('Get model by query', () => {
		test('should return model ', async () => {
			const existingModelId = 'someModel';
			const existingModelName = 'model name';
			const expectedData = {
				_id: existingModelId,
				name: existingModelName,
			};

			DBHandler.findOne.mockResolvedValueOnce(expectedData);

			const teamspace = 'someTS';
			const query = { _id: { $in: [existingModelId] }, name: existingModelName };
			const res = await Model.getModelByQuery(teamspace, query);
			expect(res).toEqual(expectedData);
			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL, query, undefined);
		});

		test('should return model not found with non-existent name', async () => {
			DBHandler.findOne.mockResolvedValueOnce(undefined);

			const teamspace = 'someTS';
			const query = { _id: { $in: ['someModel'] }, name: 'badModelName' };
			await expect(Model.getModelByQuery(teamspace, query))
				.rejects.toEqual(templates.modelNotFound);
			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL, query, undefined);
		});
	});
};

const testGetContainers = () => {
	describe('Get containers', () => {
		test('should return the list of containers ', async () => {
			const expectedData = [
				{
					_id: 'abc',
					name: 'model name',
				},
				{
					_id: '123',
					name: 'model name 2',
				},
			];

			DBHandler.find.mockResolvedValueOnce(expectedData);

			const teamspace = 'someTS';
			const modelIds = ['someModel'];
			const res = await Model.getContainers(teamspace, modelIds);
			expect(res).toEqual(expectedData);
			expect(DBHandler.find).toHaveBeenCalledTimes(1);
			expect(DBHandler.find).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: { $in: modelIds },
					federate: { $ne: true },
					modelType: { $ne: modelTypes.DRAWING } }, undefined, undefined);
		});
	});
};

const testGetDrawings = () => {
	describe('Get drawings', () => {
		test('should return the list of drawings ', async () => {
			const expectedData = [
				{
					_id: generateRandomString(),
					name: generateRandomString(),
				},
				{
					_id: generateRandomString(),
					name: generateRandomString(),
				},
			];

			DBHandler.find.mockResolvedValueOnce(expectedData);

			const teamspace = generateRandomString();
			const modelIds = [generateRandomString()];
			const res = await Model.getDrawings(teamspace, modelIds);
			expect(res).toEqual(expectedData);
			expect(DBHandler.find).toHaveBeenCalledTimes(1);
			expect(DBHandler.find).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: { $in: modelIds }, modelType: modelTypes.DRAWING },
				undefined, undefined);
		});
	});
};

const testGetFederations = () => {
	describe('Get federations', () => {
		test('should return the list of federations ', async () => {
			const expectedData = [
				{
					_id: 'abc',
					name: 'model name',
				},
				{
					_id: '123',
					name: 'model name 2',
				},
			];

			DBHandler.find.mockResolvedValueOnce(expectedData);

			const teamspace = 'someTS';
			const modelIds = ['someModel'];
			const res = await Model.getFederations(teamspace, modelIds);
			expect(res).toEqual(expectedData);
			expect(DBHandler.find).toHaveBeenCalledTimes(1);
			expect(DBHandler.find).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: { $in: modelIds }, federate: true }, undefined, undefined);
		});
	});
};

const testAddModel = () => {
	describe('Add model', () => {
		test('should return inserted ID on success when a container is added', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const data = { properties: { code: generateRandomString(), unit: generateRandomString() },
				name: generateRandomString(),
				type: generateRandomString(),
				federate: false };
			const res = await Model.addModel(teamspace, project, data);

			expect(DBHandler.insertOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.insertOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL, expect.any(Object));
			const newId = DBHandler.insertOne.mock.calls[0][2]._id;
			expect(isUUIDString(newId));
			expect(res).toEqual(newId);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_MODEL, { teamspace,
				project,
				model: newId,
				data: { code: data.properties.code, type: data.type, unit: data.properties.unit, name: data.name },
				modelType: modelTypes.CONTAINER,
			});
		});

		test('should return inserted ID on success when a federation is added', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const data = { properties: { code: generateRandomString(), unit: generateRandomString() },
				desc: generateRandomString(),
				name: generateRandomString(),
				federate: true };
			const res = await Model.addModel(teamspace, project, data);

			expect(DBHandler.insertOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.insertOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL, expect.any(Object));

			const newId = DBHandler.insertOne.mock.calls[0][2]._id;
			expect(isUUIDString(newId));
			expect(res).toEqual(newId);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_MODEL, {
				teamspace,
				project,
				model: newId,
				data: {
					code: data.properties.code,
					desc: data.desc,
					unit: data.properties.unit,
					name: data.name,
				},
				modelType: modelTypes.FEDERATION });
		});

		test('should return inserted ID on success when a drawing is added', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const data = {
				name: generateRandomString(),
				number: generateRandomString(),
				type: generateRandomString(),
				modelType: modelTypes.DRAWING };
			const res = await Model.addModel(teamspace, project, data);

			expect(DBHandler.insertOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.insertOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL, expect.any(Object));
			const newId = DBHandler.insertOne.mock.calls[0][2]._id;
			expect(isUUIDString(newId));
			expect(res).toEqual(newId);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_MODEL, { teamspace,
				project,
				model: newId,
				data: { type: data.type, name: data.name, number: data.number },
				modelType: modelTypes.DRAWING,
			});
		});
	});
};

const testDeleteModel = () => {
	describe('Delete model', () => {
		test('should succeed (federation)', async () => {
			const expectedData = { _id: generateRandomString(), federate: true };
			DBHandler.findOneAndDelete.mockResolvedValueOnce(expectedData);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const res = await Model.deleteModel(teamspace, project, model);
			expect(res).toEqual(undefined);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledWith(
				teamspace, SETTINGS_COL, { _id: model }, { federate: 1, modelType: 1 },
			);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.DELETE_MODEL, {
				teamspace,
				project,
				model,
				modelType: modelTypes.FEDERATION,
			});
		});

		test('should succeed (container)', async () => {
			const expectedData = { _id: generateRandomString(), federate: false };
			DBHandler.findOneAndDelete.mockResolvedValueOnce(expectedData);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const res = await Model.deleteModel(teamspace, project, model);
			expect(res).toEqual(undefined);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledWith(
				teamspace, SETTINGS_COL, { _id: model }, { federate: 1, modelType: 1 },
			);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.DELETE_MODEL, {
				teamspace,
				project,
				model,
				modelType: modelTypes.CONTAINER,
			});
		});

		test('should succeed (drawing)', async () => {
			const expectedData = { _id: generateRandomString(), modelType: modelTypes.DRAWING };
			DBHandler.findOneAndDelete.mockResolvedValueOnce(expectedData);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const res = await Model.deleteModel(teamspace, project, model);
			expect(res).toEqual(undefined);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledWith(
				teamspace, SETTINGS_COL, { _id: model }, { federate: 1, modelType: 1 },
			);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.DELETE_MODEL, {
				teamspace,
				project,
				model,
				modelType: modelTypes.DRAWING,
			});
		});

		test('should return model not found with invalid model ID', async () => {
			DBHandler.findOneAndDelete.mockResolvedValueOnce(undefined);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			await expect(Model.deleteModel(teamspace, project, model))
				.rejects.toEqual(templates.modelNotFound);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOneAndDelete).toHaveBeenCalledWith(
				teamspace, SETTINGS_COL, { _id: model }, { federate: 1, modelType: 1 },
			);
			expect(EventsManager.publish).toHaveBeenCalledTimes(0);
		});
	});
};

const testUpdateModelStatus = () => {
	describe('Update model status', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const status = 'queued';
		const corId = generateRandomString();

		test(`should update container status and trigger a ${events.MODEL_SETTINGS_UPDATE} event`, async () => {
			DBHandler.findOneAndUpdate.mockResolvedValueOnce({ federate: false });
			await expect(Model.updateModelStatus(teamspace, project, model, status, corId)).resolves.toBe(undefined);

			expect(DBHandler.findOneAndUpdate).toHaveBeenCalledTimes(1);
			const action = DBHandler.findOneAndUpdate.mock.calls[0][3];
			expect(action.$set.corID).toEqual(corId);
			expect(action.$set.status).toEqual(status);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, model, project, data: { status }, modelType: modelTypes.CONTAINER });
		});

		test(`should update federation status and trigger a ${events.MODEL_SETTINGS_UPDATE} event`, async () => {
			DBHandler.findOneAndUpdate.mockResolvedValueOnce({ federate: true });

			await expect(Model.updateModelStatus(teamspace, project, model, status, corId)).resolves.toBe(undefined);

			expect(DBHandler.findOneAndUpdate).toHaveBeenCalledTimes(1);
			const action = DBHandler.findOneAndUpdate.mock.calls[0][3];
			expect(action.$set.corID).toEqual(corId);
			expect(action.$set.status).toEqual(status);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, model, project, data: { status }, modelType: modelTypes.FEDERATION });
		});

		test(`should update drawing status and trigger a ${events.MODEL_SETTINGS_UPDATE} event`, async () => {
			DBHandler.findOneAndUpdate.mockResolvedValueOnce({ modelType: modelTypes.DRAWING });
			await expect(Model.updateModelStatus(teamspace, project, model, status, corId)).resolves.toBe(undefined);

			expect(DBHandler.findOneAndUpdate).toHaveBeenCalledTimes(1);
			const action = DBHandler.findOneAndUpdate.mock.calls[0][3];
			expect(action.$set.corID).toEqual(corId);
			expect(action.$set.status).toEqual(status);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, model, project, data: { status }, modelType: modelTypes.DRAWING });
		});

		test('should not trigger event if model no longer exists ', async () => {
			DBHandler.findOneAndUpdate.mockResolvedValueOnce();

			await expect(Model.updateModelStatus(teamspace, project, model, status)).resolves.toBe(undefined);

			expect(DBHandler.findOneAndUpdate.mock.calls.length).toBe(1);
			const action = DBHandler.findOneAndUpdate.mock.calls[0][3];
			expect(action.$set.status).toEqual(status);
			expect(action.$set.corId).toEqual(undefined);

			expect(EventsManager.publish).not.toHaveBeenCalled();
		});
	});
};

const testNewRevisionProcessed = () => {
	describe.each([
		[0], [1], [14], [100],
	])('Update with new revision', (retVal) => {
		const teamspace = generateRandomString();
		const project = generateUUID();
		const model = generateRandomString();
		const user = generateRandomString();
		const corId = generateUUID();

		test(`revision processed with code ${retVal} should update model status and trigger a ${events.MODEL_IMPORT_FINISHED}
			and a ${events.MODEL_SETTINGS_UPDATE} event`,
		async () => {
			DBHandler.updateOne.mockResolvedValueOnce({ matchedCount: 1 });
			EventsManager.publish.mockClear();

			const resInfo = { ...getInfoFromCode(retVal), retVal };
			const { success, userErr, message } = resInfo;
			await expect(Model.newRevisionProcessed(
				teamspace, project, model, corId, resInfo, user,
			)).resolves.toBe(undefined);

			expect(DBHandler.updateOne.mock.calls.length).toBe(1);
			const action = DBHandler.updateOne.mock.calls[0][3];
			if (success) {
				expect(action.$set.status).toBe(undefined);
				expect(action.$set).toHaveProperty('timestamp');
			} else {
				expect(action.$set.status).toEqual('failed');
				expect(action.$set).not.toHaveProperty('timestamp');
				expect(action.$set).toHaveProperty('errorReason');
				expect(action.$set.errorReason.message).toEqual(message);
				expect(action.$set.errorReason.errorCode).toEqual(retVal);
				expect(action.$set.errorReason).toHaveProperty('timestamp');
			}
			expect(action.$unset).toEqual({ corID: 1, ...(success ? { status: 1 } : {}) });

			const expectedData = { ...action.$set, status: action.$set.status || processStatuses.OK };
			if (expectedData.errorReason) {
				expectedData.errorReason.userErr = userErr;
			}

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_IMPORT_FINISHED,
				{
					teamspace,
					project,
					model,
					revId: corId,
					user,
					modelType: modelTypes.CONTAINER,
					data: expectedData,
				});
		});
	});

	describe('Update with new submodels (Federation)', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const user = generateRandomString();
		const revId = generateUUID();
		const containers = [
			{ _id: generateUUID(), group: generateRandomString() },
			{ _id: generateUUID(), group: generateRandomString() },
			{ _id: generateUUID(), },
			{ _id: generateUUID(), },
		];
		const modelType = modelTypes.FEDERATION;
		test(`Updating the submodels of a federation should trigger a ${events.MODEL_IMPORT_FINISHED} event and a ${events.MODEL_SETTINGS_UPDATE} event`,
			async () => {
				DBHandler.updateOne.mockResolvedValueOnce({ matchedCount: 1 });
				EventsManager.publish.mockClear();
				await expect(Model.updateModelSubModels(
					teamspace, project, model, user, revId, containers,
				)).resolves.toBe(undefined);

				expect(DBHandler.updateOne.mock.calls.length).toBe(1);
				const action = DBHandler.updateOne.mock.calls[0][3];
				expect(action.$set.status).toBe(undefined);
				expect(action.$set).toHaveProperty('timestamp');
				expect(action.$set.subModels).toEqual(containers);

				const expectedData = {
					status: processStatuses.OK,
					containers,
					timestamp: action.$set.timestamp
				};

				expect(EventsManager.publish).toHaveBeenCalledTimes(2);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_IMPORT_FINISHED,
					{
						teamspace,
						project,
						model,
						revId,
						user,
						modelType,
						data: expectedData,
					}
				);
				expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
					{
						teamspace,
						project,
						model,
						modelType,
						data: expectedData,
					}
				);
			}
		);
	});

	describe('Update with new revision when the model is already deleted', () => {
		test('should not trigger event', async () => {
			DBHandler.updateOne.mockResolvedValueOnce(false);
			EventsManager.publish.mockClear();

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const user = generateRandomString();
			const retVal = 0;
			const corId = generateRandomString();
			const resInfo = { ...getInfoFromCode(retVal), retVal };
			await expect(Model.newRevisionProcessed(
				teamspace, project, model, corId, resInfo, user,
			)).resolves.toBe(undefined);

			expect(DBHandler.updateOne.mock.calls.length).toBe(1);
			const action = DBHandler.updateOne.mock.calls[0][3];
			expect(action.$unset.status).toEqual(1);
			expect(action.$set).toHaveProperty('timestamp');
			expect(action.$unset).toEqual({ corID: 1, status: 1 });

			expect(EventsManager.publish.mock.calls.length).toBe(0);
		});
	});
};
const testUpdateModelSettings = () => {
	const checkResults = (fn, model, updateObject) => {
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn.mock.calls[0][2]).toEqual({ _id: model });
		expect(fn.mock.calls[0][3]).toEqual(updateObject);
	};

	describe('UpdateModelSettings', () => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		test('Should update the settings of a model with unset', async () => {
			const data = {
				name: generateRandomString(),
				unit: 'm',
				code: null,
				defaultView: null,
				description: undefined,
			};

			const updateObject = {
				$set: {
					properties: {
						unit: data.unit,
					},
					name: data.name,
				},
				$unset: {
					defaultView: 1,
					'properties.code': 1,
				},
			};

			DBHandler.findOneAndUpdate.mockResolvedValueOnce({});
			await Model.updateModelSettings(teamspace, project, model, data);
			checkResults(DBHandler.findOneAndUpdate, model, updateObject);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{
					teamspace,
					project,
					model,
					data,
					modelType: modelTypes.CONTAINER,
				});
		});

		test('Should update the settings of a model without unset', async () => {
			const data = {
				name: generateRandomString(),
				unit: 'm',
				code: generateRandomString(5),
				defaultView: generateRandomString(),
			};

			const updateObject = {
				$set: {
					properties: {
						unit: data.unit,
						code: data.code,
					},
					name: data.name,
					defaultView: data.defaultView,
				},
			};

			DBHandler.findOneAndUpdate.mockResolvedValueOnce({ federate: true });
			await Model.updateModelSettings(teamspace, project, model, data);
			checkResults(DBHandler.findOneAndUpdate, model, updateObject);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{
					teamspace,
					project,
					model,
					data,
					modelType: modelTypes.FEDERATION,
				});
		});

		test('Should update the settings of a model value of 0', async () => {
			const data = {
				angleFromNorth: 0,
			};

			const updateObject = {
				$set: {
					angleFromNorth: 0,
				},
			};

			DBHandler.findOneAndUpdate.mockResolvedValueOnce({});
			await Model.updateModelSettings(teamspace, project, model, data);
			checkResults(DBHandler.findOneAndUpdate, model, updateObject);
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);

			expect(EventsManager.publish).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{
					teamspace,
					project,
					model,
					data,
					modelType: modelTypes.CONTAINER,
				});
		});

		test('Should return error if the update fails', async () => {
			DBHandler.findOneAndUpdate.mockResolvedValueOnce();
			await expect(Model.updateModelSettings(teamspace, project, model, { name: 'someName' }))
				.rejects.toEqual(templates.modelNotFound);

			expect(EventsManager.publish).not.toHaveBeenCalled();
		});

		test('Should update nothing if the data is empty', async () => {
			await Model.updateModelSettings(teamspace, project, model, {});
			expect(DBHandler.findOneAndUpdate).not.toHaveBeenCalled();
			expect(EventsManager.publish).not.toHaveBeenCalled();
		});
	});
};

const testRemoveUserFromAllModels = () => {
	describe('Remove user from all models', () => {
		test('Should trigger a query to remove user from all models', async () => {
			const teamspace = generateRandomString();
			const user = generateRandomString();
			DBHandler.updateMany.mockResolvedValueOnce();
			await expect(Model.removeUserFromAllModels(teamspace, user)).resolves.toBeUndefined();

			expect(DBHandler.updateMany).toHaveBeenCalledTimes(1);
			expect(DBHandler.updateMany).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ 'permissions.user': user },
				{ $pull: { permissions: { user } } });
		});
	});
};

const testIsFederation = () => {
	describe('Return if a model is a federation', () => {
		test('Should return true if model is federation', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			DBHandler.findOne.mockResolvedValueOnce({ federate: true });
			await expect(Model.isFederation(teamspace, model)).resolves.toEqual(true);

			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: model },
				{ _id: 0, federate: 1 });
		});

		test('Should return false if model is container', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			DBHandler.findOne.mockResolvedValueOnce({ federate: false });
			await expect(Model.isFederation(teamspace, model)).resolves.toEqual(false);

			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: model },
				{ _id: 0, federate: 1 });
		});

		test('Should fail if model does not exist', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			DBHandler.findOne.mockResolvedValueOnce(undefined);
			await expect(Model.isFederation(teamspace, model))
				.rejects.toEqual(templates.modelNotFound);
		});
	});
};

const testGetModelType = () => {
	describe.each([
		['federate is set to true', { federate: true }, modelTypes.FEDERATION],
		['modelType is set (drawing)', { modelType: modelTypes.DRAWING }, modelTypes.DRAWING],
		['modelType is set (container)', { modelType: modelTypes.CONTAINER }, modelTypes.CONTAINER],
		['modelType is set (federation)', { modelType: modelTypes.FEDERATION }, modelTypes.FEDERATION],
		['unspecified', { modelType: modelTypes.CONTAINER }, modelTypes.CONTAINER],
	])(
		'Get model type', (desc, expectedData, expectedRes) => {
			test(`Should return ${expectedRes} when ${desc}`, async () => {
				DBHandler.findOne.mockResolvedValueOnce(expectedData);
				const ts = generateRandomString();
				const model = generateRandomString();
				await expect(Model.getModelType(ts, model)).resolves.toEqual(expectedRes);

				expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
				expect(DBHandler.findOne).toHaveBeenCalledWith(ts, SETTINGS_COL,
					{ _id: model }, { _id: 0, federate: 1, modelType: 1 });
			});
		},
	);
};

const testGetUsersWithPermissions = () => {
	describe('Get users with permissions', () => {
		const teamspace = generateRandomString();
		const modelId = generateRandomString();

		const model = {
			permissions: [
				{ user: generateRandomString(), permission: 'viewer' },
				{ user: generateRandomString(), permission: 'commenter' },
				{ user: generateRandomString(), permission: 'collaborator' },
			],
		};

		test('should return the users who have access to the model', async () => {
			DBHandler.findOne.mockResolvedValueOnce(model);

			await expect(Model.getUsersWithPermissions(teamspace, modelId))
				.resolves.toEqual(model.permissions.map((u) => u.user));

			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: modelId }, { permissions: 1 });
		});

		test('should return the users who have access to the model excuding viewers', async () => {
			DBHandler.findOne.mockResolvedValueOnce(model);

			await expect(Model.getUsersWithPermissions(teamspace, modelId, true))
				.resolves.toEqual(model.permissions.slice(1).map((u) => u.user));

			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: modelId }, { permissions: 1 });
		});

		test('should return empty array if the model has no specific permissions', async () => {
			DBHandler.findOne.mockResolvedValueOnce({});

			await expect(Model.getUsersWithPermissions(teamspace, modelId, true))
				.resolves.toEqual([]);

			expect(DBHandler.findOne).toHaveBeenCalledTimes(1);
			expect(DBHandler.findOne).toHaveBeenCalledWith(teamspace, SETTINGS_COL,
				{ _id: modelId }, { permissions: 1 });
		});
	});
};

describe('models/modelSettings', () => {
	testGetModelById();
	testGetContainerById();
	testGetDrawingById();
	testGetFederationById();
	testGetModelByQuery();
	testGetContainers();
	testGetDrawings();
	testGetFederations();
	testAddModel();
	testDeleteModel();
	testUpdateModelStatus();
	testNewRevisionProcessed();
	testUpdateModelSettings();
	testRemoveUserFromAllModels();
	testIsFederation();
	testGetModelType();
	testGetUsersWithPermissions();
});
