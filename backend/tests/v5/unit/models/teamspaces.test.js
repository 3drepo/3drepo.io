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

const Teamspace = require(`${src}/models/teamspaces`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);
const { TEAMSPACE_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);

const testHasAccessToTeamspace = () => {
	test('should return true if the user has access to teamspace', async () => {
		jest.spyOn(db, 'findOne').mockResolvedValue({ _id: 'admin.userName' });
		const res = await Teamspace.hasAccessToTeamspace('teamspace', 'user');
		expect(res).toBeTruthy();
	});

	test('should return false if the user do not have access to teamspace', async () => {
		jest.spyOn(db, 'findOne').mockResolvedValue(undefined);
		const res = await Teamspace.hasAccessToTeamspace('teamspace', 'user');
		expect(res).toBeFalsy();
	});
};

const testTeamspaceAdmins = () => {
	describe('Get teamspace admins', () => {
		test('should return list of admins if teamspace exists', async () => {
			const expectedData = {
				customData: {
					permissions: [
						{ user: 'personA', permissions: [TEAMSPACE_ADMIN] },
						{ user: 'personB', permissions: ['someOtherPerm'] },
						{ user: 'personC', permissions: [TEAMSPACE_ADMIN] },
					],
				},
			};
			jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const res = await Teamspace.getTeamspaceAdmins('someTS');
			expect(res).toEqual(['personA', 'personC']);
		});
		test('should return error if teamspace does not exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(Teamspace.getTeamspaceAdmins('someTS'))
				.rejects.toEqual(templates.teamspaceNotFound);
		});
	});
};

describe('models/teamspaces', () => {
	testTeamspaceAdmins();
	testHasAccessToTeamspace();
});
