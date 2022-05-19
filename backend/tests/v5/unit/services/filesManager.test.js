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

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);
jest.mock('../../../../src/v5/models/fileRefs');
const fileRefs = require(`${src}/models/fileRefs`);

const FilesManager = require(`${src}/services/filesManager`);

const testRemoveAllFilesFromModel = () => {
	describe('Remove all files from model', () => {
		test('Should do the relevant calls to remove files', async () => {
			const model = generateRandomString();
			const refCol1 = `${model}.${generateRandomString()}.ref`;
			const refCol2 = `${model}.${generateRandomString()}.ref`;
			db.listCollections.mockResolvedValueOnce([
				`${model}.${generateRandomString()}`,
				`${model}.${generateRandomString()}`,
				refCol1,
				`${model}.${generateRandomString()}.refasdf`,
				`${model}.${generateRandomString()}.aaref`,
				generateRandomString(),
				refCol2,
			]);
			const teamspace = generateRandomString();

			await FilesManager.removeAllFilesFromModel(teamspace, model);
		});
	});
};

describe('services/filesManager', () => {
	testRemoveAllFilesFromModel();
});
