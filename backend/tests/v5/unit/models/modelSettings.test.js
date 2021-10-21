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

			jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const res = await Model.getContainers('someTS', ['someModel']);
			expect(res).toEqual(expectedData);
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

			jest.spyOn(db, 'find').mockResolvedValue(expectedData);

			const res = await Model.getFederations('someTS', ['someModel']);
			expect(res).toEqual(expectedData);
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
			await expect(Model.updateModelSettings('someTS', 'someModel', {name: 'someName'}))
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
	testGetContainers();
	testGetFederations();
	testUpdateModelSettings();
});
