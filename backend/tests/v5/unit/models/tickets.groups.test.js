/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { generateRandomString } = require('../../helper/services');
const { src } = require('../../helper/path');

const Groups = require(`${src}/models/tickets.groups`);

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);
const { isUUID } = require(`${src}/utils/helper/typeCheck`);

const groupCol = 'tickets.groups';

const testAddGroup = () => {
	describe('Add group', () => {
		test('Should return a UUID upon adding the group', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const data = {
				[generateRandomString()]: generateRandomString(),
			};

			const _id = await Groups.addGroup(teamspace, project, model, ticket, data);

			expect(isUUID(_id)).toBeTruthy();

			expect(db.insertOne).toHaveBeenCalledTimes(1);
			expect(db.insertOne).toHaveBeenCalledWith(teamspace, groupCol,
				{ teamspace, project, model, ticket, ...data, _id });
		});

		test('Should relay the error if insertOne failed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const data = {
				[generateRandomString()]: generateRandomString(),
			};

			const err = generateRandomString();
			db.insertOne.mockRejectedValueOnce(err);
			await expect(Groups.addGroup(teamspace, project, model, ticket, data)).rejects.toEqual(err);

			expect(db.insertOne).toHaveBeenCalledTimes(1);
			expect(db.insertOne).toHaveBeenCalledWith(teamspace, groupCol,
				expect.objectContaining({ teamspace, project, model, ticket, ...data }));
		});
	});
};

describe('models/tickets.groups', () => {
	testAddGroup();
});
