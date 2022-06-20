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

const { templates } = require('../../../../src/v5/utils/responseCodes');
const { src } = require('../../helper/path');
const { generateRandomString, generateUUID } = require('../../helper/services');

const FileRefs = require(`${src}/models/fileRefs`);
const db = require(`${src}/handler/db`);

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

const testGetTotalSize = () => {
	describe('Get total size', () => {
		test('should get the total size within the collection', async () => {
			const fn = jest.spyOn(db, 'aggregate').mockImplementation(() => [{ _id: null, total: 15 }]);
			const teamspace = 'someTS';
			const collection = '123.ref';
			const res = await FileRefs.getTotalSize(teamspace, collection);
			expect(res).toEqual(15);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][0]).toEqual(teamspace);
			expect(fn.mock.calls[0][1]).toEqual(collection);
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

		test('should return all removable file entries from collection', async () => {
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

const testGetRefEntry = () => {
	describe('get ref entry by id', () => {
		test('should return the entry if found', async () => {
			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const id = generateRandomString();

			const output = { [generateRandomString()]: generateRandomString() };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(output);

			await expect(FileRefs.getRefEntry(teamspace, collection, id)).resolves.toEqual(output);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${collection}.ref`, { _id: id });
		});

		test('should throw error if the entry is not found', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(FileRefs.getRefEntry(generateRandomString(), generateRandomString(), generateRandomString()))
				.rejects.toEqual(templates.fileNotFound);
		});
	});
};

const testInsertRef = () => {
	describe('Insert file ref', () => {
		test('should insert file ref', async () => {
			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const refInfo = {
				_id: generateUUID(),
				name: generateRandomString(),
			};

			const fn = jest.spyOn(db, 'insertOne').mockResolvedValueOnce(undefined);
			await expect(FileRefs.insertRef(teamspace, collection, refInfo)).resolves.toEqual(undefined);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, collection, refInfo);
		});
	});
};

const testRemoveRef = () => {
	describe('Remove file ref', () => {
		test('should remove file ref', async () => {
			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const id = generateUUID();

			const fn = jest.spyOn(db, 'deleteOne').mockResolvedValueOnce(undefined);
			await expect(FileRefs.removeRef(teamspace, collection, id)).resolves.toEqual(undefined);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, collection, { _id: id });
		});
	});
};

describe('models/fileRefs', () => {
	testGetTotalSize();
	testGetAllRemovableEntriesByType();
	testGetRefEntry();
	testInsertRef();
	testRemoveRef();
});
