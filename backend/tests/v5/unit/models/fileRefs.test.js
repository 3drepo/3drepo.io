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

const unrecognisedType = 'qwerrtyuui';

jest.mock('../../../../src/v5/handler/externalServices', () => ({
	...jest.requireActual('../../../../src/v5/handler/externalServices'),
	getFileStream: jest.fn().mockImplementation((account, collection, type) => {
		if (type === unrecognisedType) {
			throw new Error();
		}
	}),
	removeFiles: jest.fn(),
}));

const FileRefs = require(`${src}/models/fileRefs`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testGetTotalSize = () => {
	describe('Get total size', () => {
		test('should get the total size within the collection', async () => {
			const fn = jest.spyOn(db, 'aggregate').mockImplementation(() => [{ _id: null, total: 15 }]);
			const teamspace = 'someTS';
			const collection = '123';
			const res = await FileRefs.getTotalSize(teamspace, collection);
			expect(res).toEqual(15);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(`${collection}.ref`);
		});

		test('should get the total size within the collection with .ref already added', async () => {
			const fn = jest.spyOn(db, 'aggregate').mockImplementation(() => [{ _id: null, total: 15 }]);
			const teamspace = 'someTS';
			const collection = '123.ref';
			const res = await FileRefs.getTotalSize(teamspace, collection);
			expect(res).toEqual(15);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(collection);
		});

		test('should return 0 if there is no entry', async () => {
			const fn = jest.spyOn(db, 'aggregate').mockImplementation(() => []);
			const teamspace = 'someTS';
			const collection = '123.ref';
			const res = await FileRefs.getTotalSize(teamspace, collection);
			expect(res).toEqual(0);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(collection);
		});
	});
};

const testGetAllRemovableEntriesByType = () => {
	describe('Get all removable entries by type', () => {
		const refCol = generateRandomString();

		test('should remove files from collection', async () => {
			const teamspace = generateRandomString();

			const aggRes = [{ _id: generateRandomString(), links: [generateRandomString()] }];
			const fnAggregate = jest.spyOn(db, 'aggregate').mockResolvedValue(aggRes);

			await expect(FileRefs.getAllRemovableEntriesByType(teamspace, refCol)).resolves.toEqual(aggRes);

			const query = [
				{ $match: { noDelete: { $exists: false }, type: { $ne: 'http' } } },
				{ $group: { _id: '$type', links: { $addToSet: '$link' } } },
			];

			expect(fnAggregate.mock.calls.length).toBe(1);

			fnAggregate.mock.calls.forEach((call, i) => {
				expect(call[0]).toEqual(teamspace);
				expect(fnAggregate.mock.calls[i][0]).toEqual(teamspace);
				expect(fnAggregate.mock.calls[i][1]).toEqual(refCol);
				expect(fnAggregate.mock.calls[i][2]).toEqual(query);
			});
		});
	});
};

const testFetchFileStream = () => {
	describe('Fetch file stream', () => {
		test('should throw error if the revision has no entry', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
			await expect(FileRefs.fetchFileStream('someTS', 'someModel', 'history.ref', 'filename')).rejects.toEqual(templates.fileNotFound);
		});

		test('should download the revision files using grid fs if entry has invalid type', async () => {
			const fileEntry = { size: '12345', type: unrecognisedType };
			const expectedData = { readStream: undefined, size: '12345' };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(fileEntry);
			const res = await FileRefs.fetchFileStream('someTS', 'someModel', 'history.ref', 'filename');
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('someTS');
			expect(fn.mock.calls[0][1]).toEqual('someModel.history.ref');
			expect(fn.mock.calls[0][2]).toEqual({ _id: 'filename' });
		});

		test('should download the revision files using grid fs if entry has valid type', async () => {
			const fileEntry = { size: '12345', type: 'valid type' };
			const expectedData = { readStream: undefined, size: '12345' };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(fileEntry);
			const res = await FileRefs.fetchFileStream('someTS', 'someModel', 'history.ref', 'filename');
			expect(res).toEqual(expectedData);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual('someTS');
			expect(fn.mock.calls[0][1]).toEqual('someModel.history.ref');
			expect(fn.mock.calls[0][2]).toEqual({ _id: 'filename' });
		});
	});
};

describe('models/fileRefs', () => {
	testGetTotalSize();
	testGetAllRemovableEntriesByType();
	testFetchFileStream();
});
