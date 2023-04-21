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

const { times } = require('lodash');
const { generateRandomString } = require('../../helper/services');
const { src } = require('../../helper/path');

const Groups = require(`${src}/models/tickets.groups`);

jest.mock('../../../../src/v5/handler/db');
const db = require(`${src}/handler/db`);

const groupCol = 'tickets.groups';

const testAddGroups = () => {
	describe('Add groups', () => {
		test('Should insert all the groups', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const data = times(6, {
				[generateRandomString()]: generateRandomString(),
			});

			await Groups.addGroups(teamspace, project, model, ticket, data);

			expect(db.insertMany).toHaveBeenCalledTimes(1);
			expect(db.insertMany).toHaveBeenCalledWith(teamspace, groupCol,
				data.map((entry) => ({ teamspace, project, model, ticket, ...entry })));
		});

		test('Should relay the error if insertMany failed', async () => {
			const teamspace = generateRandomString();
			const project = generateRandomString();
			const model = generateRandomString();
			const ticket = generateRandomString();
			const data = times(6, {
				[generateRandomString()]: generateRandomString(),
			});

			const err = generateRandomString();
			db.insertMany.mockRejectedValueOnce(err);
			await expect(Groups.addGroups(teamspace, project, model, ticket, data)).rejects.toEqual(err);

			expect(db.insertMany).toHaveBeenCalledTimes(1);
			expect(db.insertMany).toHaveBeenCalledWith(teamspace, groupCol,
				data.map((entry) => ({ teamspace, project, model, ticket, ...entry })));
		});
	});
};

describe('models/tickets.groups', () => {
	testAddGroups();
});
