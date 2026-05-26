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

const { templates } = require('../../../../src/v5/utils/responseCodes');
const { src } = require('../../helper/path');
const { generateRandomString, generateUUID } = require('../../helper/services');

const FileRefs = require(`${src}/models/fileRefs`);
const db = require(`${src}/handler/db`);

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
		const refCol = `${generateRandomString()}.ref`;

		test('should return all removable file entries from collection', async () => {
			const teamspace = generateRandomString();

			const expectedRes = [
				{ _id: generateRandomString(), links: times(19, () => generateRandomString()) },
				{ _id: generateRandomString(), links: times(11, () => generateRandomString()) },
			];

			const findRes = expectedRes.flatMap(({ _id, links }) => links.map((link) => ({ type: _id, link })));

			const findFn = jest.spyOn(db, 'find').mockResolvedValue(findRes);

			await expect(FileRefs.getAllRemovableEntriesByType(teamspace, refCol)).resolves.toEqual(expectedRes);

			const query = { noDelete: { $exists: false }, type: { $ne: 'http' } };
			const projection = { type: 1, link: 1 };

			expect(findFn).toHaveBeenCalledTimes(1);

			expect(findFn).toHaveBeenCalledWith(teamspace, refCol, query, projection);
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
			expect(fn).toHaveBeenCalledWith(teamspace, `${collection}.ref`, { _id: id }, undefined);
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
			expect(fn).toHaveBeenCalledWith(teamspace, `${collection}.ref`, refInfo);
		});
	});
};

const testInsertManyRefs = () => {
	describe('Insert many file refs', () => {
		test('should insert file refs', async () => {
			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const refInfo = times(10, () => ({
				_id: generateUUID(),
				name: generateRandomString(),
			}));

			const fn = jest.spyOn(db, 'insertMany').mockResolvedValueOnce(undefined);
			await expect(FileRefs.insertManyRefs(teamspace, collection, refInfo)).resolves.toEqual(undefined);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${collection}.ref`, refInfo);
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
			expect(fn).toHaveBeenCalledWith(teamspace, `${collection}.ref`, { _id: id });
		});
	});
};

const testGetRefsByQuery = () => {
	describe('Get file refs by query', () => {
		test('should get file refs if query is satisfied', async () => {
			const teamspace = generateRandomString();
			const collection = generateRandomString();
			const query = { [generateRandomString()]: generateRandomString() };

			const expectedRes = generateRandomString();
			const fn = jest.spyOn(db, 'find').mockResolvedValueOnce(expectedRes);
			await expect(FileRefs.getRefsByQuery(teamspace, collection, query)).resolves.toEqual(expectedRes);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, `${collection}.ref`, query, undefined);
		});
	});
};

const testRemoveRefsByQuery = () => {
	describe('Remove file refs by query', () => {
		test('should remove file refs if query is satisfied', async () => {
			const teamspace = generateRandomString();
			const collection = `${generateRandomString()}.ref`;
			const query = { [generateRandomString()]: generateRandomString() };

			const fn = jest.spyOn(db, 'deleteMany').mockResolvedValueOnce(undefined);
			await expect(FileRefs.removeRefsByQuery(teamspace, collection, query)).resolves.toEqual(undefined);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, collection, query);
		});
	});
};

const testUpdateRef = () => {
	describe('Update the ref by query', () => {
		test('should update file ref\'s', async () => {
			const teamspace = generateRandomString();
			const collection = `${generateRandomString()}.history.ref`;
			const query = { _id: generateRandomString() };
			const action = { $set: { [generateRandomString()]: generateRandomString() } };

			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce(undefined);

			await expect(FileRefs.updateRef(teamspace, collection, query, action)).resolves.toEqual(undefined);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, collection, query, action);
		});
	});
};

describe('models/fileRefs', () => {
	testGetTotalSize();
	testGetAllRemovableEntriesByType();
	testGetRefEntry();
	testInsertRef();
	testInsertManyRefs();
	testRemoveRef();
	testGetRefsByQuery();
	testRemoveRefsByQuery();
	testUpdateRef();
});
