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

jest.mock('../../../../src/v5/handler/externalServices');
const FileRefs = require(`${src}/models/fileRefs`);
const db = require(`${src}/handler/db`);

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

const testRemoveAllFilesFromModel = () => {
	describe('Remove all files from model', () => {
		test('should remove files from all collections', async () => {
			const fileCollsCount = 7;
			const teamspace = 'someTS';
			const modelId = 'someModel';

			const fnGetColl = jest.spyOn(db, 'getCollection').mockImplementation(() => [{ _id: modelId, links: 'someLink' }]);
			const fnAggregate = jest.spyOn(db, 'aggregate').mockImplementation(() => [{ _id: modelId, links: 'someLink' }]);

			const res = await FileRefs.removeAllFilesFromModel(teamspace, modelId);
			expect(res).toHaveLength(fileCollsCount);

			const query = [
				{ $match: { noDelete: { $exists: false } } },
				{ $group: { _id: '$type', links: { $addToSet: '$link' } } },
			];

			expect(fnGetColl.mock.calls.length).toBe(fileCollsCount);
			expect(fnAggregate.mock.calls.length).toBe(fileCollsCount);

			fnGetColl.mock.calls.forEach((call, i) => {
				expect(call[0]).toEqual(teamspace);
				const collection = call[1];
				expect(fnAggregate.mock.calls[i][0]).toEqual(teamspace);
				expect(fnAggregate.mock.calls[i][1]).toEqual(`${collection}`);
				expect(fnAggregate.mock.calls[i][2]).toEqual(query);
			});
		});

		test('should return empty []s without matching collection', async () => {
			const fileCollsCount = 7;
			const teamspace = 'someTS';
			const modelId = 'someModel';

			const fnGetColl = jest.spyOn(db, 'getCollection').mockImplementation(() => undefined);

			const res = await FileRefs.removeAllFilesFromModel(teamspace, modelId);
			expect(res).toHaveLength(fileCollsCount);
			res.forEach((element) => {
				expect(element).toEqual([]);
			});

			expect(fnGetColl.mock.calls.length).toBe(fileCollsCount);
		});
	});
};

describe('models/fileRefs', () => {
	testGetTotalSize();
	testRemoveAllFilesFromModel();
});
