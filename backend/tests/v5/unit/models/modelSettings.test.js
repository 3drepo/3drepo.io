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

const Model = require(`${src}/models/modelSettings`);
const db = require(`${src}/handler/db`);
const { isUUIDString } = require(`${src}/utils/helper/typeCheck`);
const { templates } = require(`${src}/utils/responseCodes`);

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

const testGetModelByName = () => {
	describe('Get model by name', () => {
		test('should return model ', async () => {
			const expectedData = {
				_id: 'abc',
				name: 'model name',
			};

			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await Model.getModelByName('someTS', ['someModel'], 'abc');
			expect(res).toEqual(expectedData);
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
			const newContainerId = 'newContainerId';
			const expectedData = { insertedId: newContainerId };

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const res = await Model.addModel(teamspace, {});
			expect(res).toEqual(newContainerId);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual('settings');
			expect(fn.mock.calls[0][2]).toHaveProperty('_id');
			expect(isUUIDString(fn.mock.calls[0][2]._id));
		});
	});
};

const testDeleteModel = () => {
	describe('Delete model', () => {
		test('should return deleted count on success', async () => {
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

describe('models/modelSettings', () => {
	testGetModelById();
	testGetContainerById();
	testGetFederationById();
	testGetModelByName();
	testGetContainers();
	testGetFederations();
	testAddModel();
	testDeleteModel();
});
