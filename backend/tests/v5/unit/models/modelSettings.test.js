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

const { src } = require('../../helper/path');
const { generateRandomString } = require('../../helper/services');

jest.mock('../../../../src/v5/services/eventsManager/eventsManager');
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const Model = require(`${src}/models/modelSettings`);
const { getInfoFromCode } = require(`${src}/models/modelSettings.constants`);
const db = require(`${src}/handler/db`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);

const publishFn = EventsManager.publish.mockImplementation(() => { });

const testGetModelById = () => {
	describe('Get ModelById', () => {
		test('should return content of model settings if found', async () => {
			const expectedData = {
				_id: 'abc',
				name: 'model name',
			};
			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await Model.getModelById('someTS', 'someModel');
			expect(res).toEqual(expectedData);
		});
		test('should return error if model does not exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

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
			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await Model.getContainerById('someTS', 'someContainer');
			expect(res).toEqual(expectedData);
		});
		test('should return error if container does not exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(Model.getContainerById('someTS', 'someContainer'))
				.rejects.toEqual(templates.containerNotFound);
		});

		test('should return error if some unknown error occured', async () => {
			const err = '123';
			jest.spyOn(db, 'findOne').mockRejectedValue(err);

			await expect(Model.getContainerById('someTS', 'someContainer'))
				.rejects.toEqual(err);
		});
	});
};

const testGetFederationById = () => {
	describe('Get FederationById', () => {
		test('should return content of federation settings if found', async () => {
			const expectedData = {
				_id: 'abc',
				name: 'federation name',
			};
			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await Model.getFederationById('someTS', 'someFederation');
			expect(res).toEqual(expectedData);
		});
		test('should return error if federation does not exist', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(Model.getFederationById('someTS', 'someFederation'))
				.rejects.toEqual(templates.federationNotFound);
		});

		test('should return error if some unknown error occured', async () => {
			const err = '123';
			jest.spyOn(db, 'findOne').mockRejectedValue(err);

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

			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const query = { _id: { $in: [existingModelId] }, name: existingModelName };
			const res = await Model.getModelByQuery(teamspace, query);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toEqual(query);
		});

		test('should return model not found with non-existent name', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			const teamspace = 'someTS';
			const query = { _id: { $in: ['someModel'] }, name: 'badModelName' };
			await expect(Model.getModelByQuery(teamspace, query))
				.rejects.toEqual(templates.modelNotFound);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toEqual(query);
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

			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const modelIds = ['someModel'];
			const res = await Model.getContainers(teamspace, modelIds);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toEqual({ _id: { $in: modelIds }, federate: { $ne: true } });
			expect(fn.mock.calls[0][3]).toEqual(undefined);
			expect(fn.mock.calls[0][4]).toEqual(undefined);
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

			const fn = jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const modelIds = ['someModel'];
			const res = await Model.getFederations(teamspace, modelIds);
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toEqual({ _id: { $in: modelIds }, federate: true });
			expect(fn.mock.calls[0][3]).toEqual(undefined);
			expect(fn.mock.calls[0][4]).toEqual(undefined);
		});
	});
};

const testAddModel = () => {
	describe('Add model', () => {
		test('should return inserted ID on success when a container is added', async () => {
			const fn = jest.spyOn(db, 'insertOne');

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const data = { properties: { code: generateRandomString(), unit: generateRandomString() },
				name: generateRandomString(),
				type: generateRandomString(),
				federate: false };
			const res = await Model.addModel(teamspace, project, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
			expect(res).toEqual(fn.mock.calls[0][2]._id);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_MODEL, { teamspace,
				project,
				model: fn.mock.calls[0][2]._id,
				data: { code: data.properties.code, type: data.type, unit: data.properties.unit, name: data.name },
				isFederation: false,
			});
		});

		test('should return inserted ID on success when a federation is added', async () => {
			const fn = jest.spyOn(db, 'insertOne');

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const data = { properties: { code: generateRandomString(), unit: generateRandomString() },
				desc: generateRandomString(),
				name: generateRandomString(),
				federate: true };
			const res = await Model.addModel(teamspace, project, data);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
			expect(res).toEqual(fn.mock.calls[0][2]._id);

			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.NEW_MODEL, {
				teamspace,
				project,
				model: fn.mock.calls[0][2]._id,
				data: {
					code: data.properties.code,
					desc: data.desc,
					unit: data.properties.unit,
					name: data.name,
				},
				isFederation: true });
		});
	});
};

const testDeleteModel = () => {
	describe('Delete model', () => {
		test('should succeed (federation)', async () => {
			const expectedData = { _id: generateRandomString(), federate: true };
			const fn = jest.spyOn(db, 'findOneAndDelete').mockResolvedValue(expectedData);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const res = await Model.deleteModel(teamspace, project, model);
			expect(res).toEqual(undefined);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'settings', { _id: model }, { federate: 1 });
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.DELETE_MODEL, {
				teamspace,
				project,
				model,
				isFederation: true,
			});
		});

		test('should succeed (container)', async () => {
			const expectedData = { _id: generateRandomString(), federate: false };
			const fn = jest.spyOn(db, 'findOneAndDelete').mockResolvedValue(expectedData);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const res = await Model.deleteModel(teamspace, project, model);
			expect(res).toEqual(undefined);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'settings', { _id: model }, { federate: 1 });
			expect(EventsManager.publish).toHaveBeenCalledTimes(1);
			expect(EventsManager.publish).toHaveBeenCalledWith(events.DELETE_MODEL, {
				teamspace,
				project,
				model,
				isFederation: false,
			});
		});

		test('should return model not found with invalid model ID', async () => {
			const fn = jest.spyOn(db, 'findOneAndDelete').mockResolvedValue(undefined);

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			await expect(Model.deleteModel(teamspace, project, model))
				.rejects.toEqual(templates.modelNotFound);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'settings', { _id: model }, { federate: 1 });
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
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValue({ federate: false });
			await expect(Model.updateModelStatus(teamspace, project, model, status, corId)).resolves.toBe(undefined);

			expect(fn).toHaveBeenCalledTimes(1);
			const action = fn.mock.calls[0][3];
			expect(action.$set.corID).toEqual(corId);
			expect(action.$set.status).toEqual(status);

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, model, project, data: { status }, isFederation: false });
		});

		test(`should update federation status and trigger a ${events.MODEL_SETTINGS_UPDATE} event`, async () => {
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValue({ federate: true });

			await expect(Model.updateModelStatus(teamspace, project, model, status, corId)).resolves.toBe(undefined);

			expect(fn).toHaveBeenCalledTimes(1);
			const action = fn.mock.calls[0][3];
			expect(action.$set.corID).toEqual(corId);
			expect(action.$set.status).toEqual(status);

			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{ teamspace, model, project, data: { status }, isFederation: true });
		});

		test('should not trigger event if model no longer exists ', async () => {
			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValue();

			await expect(Model.updateModelStatus(teamspace, project, model, status)).resolves.toBe(undefined);

			expect(fn.mock.calls.length).toBe(1);
			const action = fn.mock.calls[0][3];
			expect(action.$set.status).toEqual(status);
			expect(action.$set.corId).toEqual(undefined);

			expect(publishFn).not.toHaveBeenCalled();
		});
	});
};

const testNewRevisionProcessed = () => {
	describe.each([
		[0], [1], [14], [100],
	])('Update with new revision', (retVal) => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const user = generateRandomString();
		const corId = generateRandomString();
		const { success, message, userErr } = getInfoFromCode(retVal);
		test(`revision processed with code ${retVal} should update model status and trigger a ${events.MODEL_IMPORT_FINISHED},
			a ${events.MODEL_SETTINGS_UPDATE} and a ${events.NEW_REVISION} event`,
		async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue({ matchedCount: 1 });
			publishFn.mockClear();
			await expect(Model.newRevisionProcessed(
				teamspace, project, model, corId, retVal, user,
			)).resolves.toBe(undefined);

			expect(fn.mock.calls.length).toBe(1);
			const action = fn.mock.calls[0][3];
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

			expect(publishFn).toHaveBeenCalledTimes(3);
			expect(publishFn).toHaveBeenCalledWith(events.MODEL_IMPORT_FINISHED,
				{
					teamspace,
					model,
					corId,
					userErr,
					message,
					success,
					errCode: retVal,
					user,
				});

			expect(publishFn).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{
					teamspace,
					project,
					model,
					data: { ...action.$set, status: action.$set.status || 'ok' },
					isFederation: false,
				});

			expect(publishFn).toHaveBeenCalledWith(events.NEW_REVISION,
				{
					teamspace,
					project,
					model,
					revision: corId,
					isFederation: false,
				});
		});
	});

	describe('Update with new revision (Federation)', () => {
		const retVal = 0;
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const user = generateRandomString();
		const corId = generateRandomString();
		const containers = [generateRandomString(), generateRandomString(), generateRandomString()];
		const { success, message, userErr } = getInfoFromCode(retVal);
		test(`revision processed with code ${retVal} should update model status and trigger a ${events.MODEL_IMPORT_FINISHED} event and a ${events.MODEL_SETTINGS_UPDATE} event`,
			async () => {
				const fn = jest.spyOn(db, 'updateOne').mockResolvedValue({ matchedCount: 1 });
				publishFn.mockClear();
				await expect(Model.newRevisionProcessed(
					teamspace, project, model, corId, retVal, user,
					containers.map((containerId) => ({ project: containerId })),
				)).resolves.toBe(undefined);

				expect(fn.mock.calls.length).toBe(1);
				const action = fn.mock.calls[0][3];
				expect(action.$set.status).toBe(undefined);
				expect(action.$set).toHaveProperty('timestamp');
				expect(action.$set.subModels).toEqual(containers);

				expect(action.$unset).toEqual({ corID: 1, ...(success ? { status: 1 } : {}) });

				expect(publishFn).toHaveBeenCalledTimes(3);
				expect(publishFn).toHaveBeenCalledWith(events.MODEL_IMPORT_FINISHED,
					{
						teamspace,
						model,
						corId,
						userErr,
						message,
						success,
						errCode: retVal,
						user,
					});

				const expectedData = { ...action.$set };
				if (expectedData.subModels) {
					expectedData.containers = expectedData.subModels;
					delete expectedData.subModels;
				}

				expect(publishFn).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
					{
						teamspace,
						project,
						model,
						data: { ...expectedData, status: expectedData.status || 'ok' },
						isFederation: true,
					});

				expect(publishFn).toHaveBeenCalledWith(events.NEW_REVISION,
					{
						teamspace,
						project,
						model,
						revision: corId,
						isFederation: true,
					});
			});
	});

	describe('Update with new revision when the model is already deleted', () => {
		test('should not trigger event', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue(false);
			publishFn.mockClear();

			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const user = generateRandomString();
			const retVal = 0;
			const corId = generateRandomString();
			await expect(Model.newRevisionProcessed(
				teamspace, project, model, corId, retVal, user,
			)).resolves.toBe(undefined);

			expect(fn.mock.calls.length).toBe(1);
			const action = fn.mock.calls[0][3];
			expect(action.$unset.status).toEqual(1);
			expect(action.$set).toHaveProperty('timestamp');
			expect(action.$unset).toEqual({ corID: 1, status: 1 });

			expect(publishFn.mock.calls.length).toBe(0);
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
				code: generateRandomString(5),
				defaultView: null,
			};

			const updateObject = {
				$set: {
					properties: {
						unit: data.unit,
						code: data.code,
					},
					name: data.name,
				},
				$unset: {
					defaultView: 1,
				},
			};

			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({});
			await Model.updateModelSettings(teamspace, project, model, data);
			checkResults(fn, model, updateObject);
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{
					teamspace,
					project,
					model,
					data,
					isFederation: false,
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

			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({ federate: true });
			await Model.updateModelSettings(teamspace, project, model, data);
			checkResults(fn, model, updateObject);
			expect(publishFn).toHaveBeenCalledTimes(1);
			expect(publishFn).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{
					teamspace,
					project,
					model,
					data,
					isFederation: true,
				});
		});

		test('Should update the settings of a model and ignore a null value that cant be unset', async () => {
			const data = {
				name: generateRandomString(),
				unit: null,
				code: generateRandomString(5),
				defaultView: generateRandomString(),
			};

			const updateObject = {
				$set: {
					properties: {
						code: data.code,
					},
					name: data.name,
					defaultView: data.defaultView,
				},
			};

			const fn = jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce({});
			await Model.updateModelSettings(teamspace, project, model, data);
			checkResults(fn, model, updateObject);
			expect(publishFn).toHaveBeenCalledTimes(1);

			expect(publishFn).toHaveBeenCalledWith(events.MODEL_SETTINGS_UPDATE,
				{
					teamspace,
					project,
					model,
					data,
					isFederation: false,
				});
		});

		test('Should return error if the update fails', async () => {
			jest.spyOn(db, 'findOneAndUpdate').mockResolvedValueOnce();
			await expect(Model.updateModelSettings(teamspace, project, model, { name: 'someName' }))
				.rejects.toEqual(templates.modelNotFound);

			expect(publishFn).not.toHaveBeenCalled();
		});

		test('Should update nothing if the data is empty', async () => {
			const fn = jest.spyOn(db, 'findOneAndUpdate');
			await Model.updateModelSettings(teamspace, project, model, {});
			expect(fn).not.toHaveBeenCalled();
			expect(publishFn).not.toHaveBeenCalled();
		});
	});
};

const testRemoveUserFromAllModels = () => {
	describe('Remove user from all models', () => {
		test('Should trigger a query to remove user from all models', async () => {
			const teamspace = generateRandomString();
			const user = generateRandomString();
			const fn = jest.spyOn(db, 'updateMany').mockResolvedValueOnce();
			await expect(Model.removeUserFromAllModels(teamspace, user)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'settings',
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
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ federate: true });
			await expect(Model.isFederation(teamspace, model)).resolves.toEqual(true);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'settings',
				{ _id: model },
				{ _id: 0, federate: 1 });
		});

		test('Should return false if model is container', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ federate: false });
			await expect(Model.isFederation(teamspace, model)).resolves.toEqual(false);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'settings',
				{ _id: model },
				{ _id: 0, federate: 1 });
		});

		test('Should fail if model does not exist', async () => {
			const teamspace = generateRandomString();
			const model = generateRandomString();
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Model.isFederation(teamspace, model))
				.rejects.toEqual(templates.modelNotFound);
		});
	});
};

describe('models/modelSettings', () => {
	testGetModelById();
	testGetContainerById();
	testGetFederationById();
	testGetModelByQuery();
	testGetContainers();
	testGetFederations();
	testAddModel();
	testDeleteModel();
	testUpdateModelStatus();
	testNewRevisionProcessed();
	testUpdateModelSettings();
	testRemoveUserFromAllModels();
	testIsFederation();
});
