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

describe('models/modelSettings', () => {
	testGetModelById();
	testGetContainerById();
	testGetFederationById();
	testGetContainers();
	testGetFederations();
	testUpdateModelStatus();
	testNewRevisionProcessed();
});
