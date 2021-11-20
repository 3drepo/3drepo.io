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
		test('should return inserted ID on success', async () => {
			const fn = jest.spyOn(db, 'insertOne');

			const teamspace = 'someTS';
			const res = await Model.addModel(teamspace, {});

			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(isUUIDString(fn.mock.calls[0][2]._id));

			expect(res).toEqual(fn.mock.calls[0][2]._id);
		});
	});
};

const testDeleteModel = () => {
	describe('Delete model', () => {
		test('should succeed', async () => {
			const expectedData = { deletedCount: 1 };
			const fn = jest.spyOn(db, 'deleteOne').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const modelId = 'someModel';
			const res = await Model.deleteModel(teamspace, modelId);
			expect(res).toEqual(undefined);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toEqual({ _id: modelId });
		});

		test('should return model not found with invalid model ID', async () => {
			const expectedData = { deletedCount: 0 };
			const fn = jest.spyOn(db, 'deleteOne').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const modelId = 'badModel';
			await expect(Model.deleteModel(teamspace, modelId))
				.rejects.toEqual(templates.modelNotFound);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toEqual({ _id: modelId });
		});
	});
};

const testUpdateModelStatus = () => {
	describe('Update model status', () => {
		test(`should update model status and trigger a ${events.MODEL_IMPORT_UPDATE} event`, async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue({ matchedCount: 1 });

			const teamspace = 'ts';
			const model = 'model';
			const user = 'user';
			const status = 'queued';
			const corId = '123';
			await expect(Model.updateModelStatus(teamspace, model, status, corId, user)).resolves.toBe(undefined);

			expect(fn.mock.calls.length).toBe(1);
			const action = fn.mock.calls[0][3];
			expect(action.$set.corID).toEqual(corId);
			expect(action.$set.status).toEqual(status);

			expect(publishFn.mock.calls.length).toBe(1);
			expect(publishFn.mock.calls[0][0]).toEqual(events.MODEL_IMPORT_UPDATE);
			expect(publishFn.mock.calls[0][1]).toEqual({ teamspace, model, corId, status, user });
		});

		test('should not trigger event if model no longer exists ', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue({ matchedCount: 0 });
			publishFn.mockClear();

			const status = 'queued';
			await expect(Model.updateModelStatus('teamspace', 'model', status)).resolves.toBe(undefined);

			expect(fn.mock.calls.length).toBe(1);
			const action = fn.mock.calls[0][3];
			expect(action.$set.status).toEqual(status);
			expect(action.$set.corId).toEqual(undefined);

			expect(publishFn.mock.calls.length).toBe(0);
		});
	});
};

const testNewRevisionProcessed = () => {
	describe.each([
		[0], [1], [14], [100],
	])('Update with new revision', (retVal) => {
		const teamspace = 'ts';
		const model = 'model';
		const user = 'user';
		const corId = '123';
		const { success, message, userErr } = getInfoFromCode(retVal);
		test(`revision processed with code ${retVal} should update model status and trigger a ${events.MODEL_IMPORT_FINISHED} event`,
			async () => {
				const fn = jest.spyOn(db, 'updateOne').mockResolvedValue({ matchedCount: 1 });
				publishFn.mockClear();
				await expect(Model.newRevisionProcessed(
					teamspace, model, corId, retVal, user,
				)).resolves.toBe(undefined);

				expect(fn.mock.calls.length).toBe(1);
				const action = fn.mock.calls[0][3];
				if (success) {
					expect(action.$set.status).toEqual('ok');
					expect(action.$set).toHaveProperty('timestamp');
				} else {
					expect(action.$set.status).toEqual('failed');
					expect(action.$set).not.toHaveProperty('timestamp');
					expect(action.$set).toHaveProperty('errorReason');
					expect(action.$set.errorReason.message).toEqual(message);
					expect(action.$set.errorReason.errorCode).toEqual(retVal);
					expect(action.$set.errorReason).toHaveProperty('timestamp');
				}
				expect(action.$unset).toEqual({ corID: 1 });

				expect(publishFn.mock.calls.length).toBe(1);
				expect(publishFn.mock.calls[0][0]).toEqual(events.MODEL_IMPORT_FINISHED);
				expect(publishFn.mock.calls[0][1]).toEqual({
					teamspace,
					model,
					corId,
					userErr,
					message,
					success,
					errCode: retVal,
					user,
				});
			});
	});
	describe('Update with new revision when the model is already deleted', () => {
		test('should not trigger event', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue({ matchedCount: 0 });
			publishFn.mockClear();

			const teamspace = 'ts';
			const model = 'model';
			const user = 'user';
			const retVal = 0;
			const corId = '123';
			await expect(Model.newRevisionProcessed(
				teamspace, model, corId, retVal, user,
			)).resolves.toBe(undefined);

			expect(fn.mock.calls.length).toBe(1);
			const action = fn.mock.calls[0][3];
			expect(action.$set.status).toEqual('ok');
			expect(action.$set).toHaveProperty('timestamp');
			expect(action.$unset).toEqual({ corID: 1 });

			expect(publishFn.mock.calls.length).toBe(0);
		});
	});
};
const testUpdateModelSettings = () => {
	const checkResults = (fn, model, updateObject) => {
		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][2]).toEqual({ _id: model });
		expect(fn.mock.calls[0][3]).toEqual(updateObject);
	};

	describe('UpdateModelSettings', () => {
		test('Should update the settings of a model with unset', async () => {
			const data = {
				name: 'someName',
				unit: 'm',
				code: 'someCode',
				defaultView: null,
			};

			const updateObject = {
				$set: {
					properties: {
						unit: 'm',
						code: 'someCode',
					},
					name: 'someName',
				},
				$unset: {
					defaultView: 1,
				},
			};

			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => ({ matchedCount: 1 }));
			await Model.updateModelSettings('someTS', 'someModel', data);
			checkResults(fn, 'someModel', updateObject);
		});

		test('Should update the settings of a model without unset', async () => {
			const data = {
				name: 'someName',
				unit: 'm',
				code: 'someCode',
				defaultView: '123',
			};

			const updateObject = {
				$set: {
					properties: {
						unit: 'm',
						code: 'someCode',
					},
					name: 'someName',
					defaultView: '123',
				},
			};

			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => ({ matchedCount: 1 }));
			await Model.updateModelSettings('someTS', 'someModel', data);
			checkResults(fn, 'someModel', updateObject);
		});

		test('Should update the settings of a model and ignore a null value that cant be unset', async () => {
			const data = {
				name: 'someName',
				unit: null,
				code: 'someCode',
				defaultView: '123',
			};

			const updateObject = {
				$set: {
					properties: {
						code: 'someCode',
					},
					name: 'someName',
					defaultView: '123',
				},
			};

			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => ({ matchedCount: 1 }));
			await Model.updateModelSettings('someTS', 'someModel', data);
			checkResults(fn, 'someModel', updateObject);
		});

		test('Should return error if the update fails', async () => {
			jest.spyOn(db, 'updateOne').mockImplementation(() => undefined);
			await expect(Model.updateModelSettings('someTS', 'someModel', { name: 'someName' }))
				.rejects.toEqual(templates.modelNotFound);
		});

		test('Should update nothing if the data is empty', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockImplementation(() => ({ matchedCount: 1 }));
			await Model.updateModelSettings('someTS', 'someModel', {});
			checkResults(fn, 'someModel', {});
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
});
