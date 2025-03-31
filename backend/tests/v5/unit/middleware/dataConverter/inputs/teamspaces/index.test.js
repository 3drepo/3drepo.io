/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { generateRandomString } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../src/v5/models/teamspaceSettings');
const TeamspacesModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../../../src/v5/utils/permissions');
const PermissionsUtils = require(`${src}/utils/permissions`);

const Teamspaces = require(`${src}/middleware/dataConverter/inputs/teamspaces`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const adminUser = generateRandomString();
const nonAdminUser = generateRandomString();
const usernameToRemove = generateRandomString();
const nonTsMemberUser = generateRandomString();
const teamspace = generateRandomString();

TeamspacesModel.hasAccessToTeamspace.mockImplementation((ts, username) => username !== nonTsMemberUser);

PermissionsUtils.isTeamspaceAdmin.mockImplementation((ts, user) => user === adminUser);

const testCanRemoveTeamspaceMember = () => {
	describe.each([
		['User to remove is the owner of teamspace', { session: { user: { username: adminUser } },
			params: { teamspace, username: teamspace } }, false],
		['Logged in user is not a teamspace admin', { session: { user: { username: nonAdminUser } },
			params: { teamspace, username: adminUser } }, false],
		['User to be removed is not member of the teamspace', { session: { user: { username: adminUser } },
			params: { teamspace, username: nonTsMemberUser } }, false],
		['Logged in user is not a teamspace admin but remove themselves', { session: { user: { username: nonAdminUser } },
			params: { teamspace, username: nonAdminUser } }, true],
		['Logged in user is a teamspace admin', { session: { user: { username: adminUser } },
			params: { teamspace, username: usernameToRemove } }, true],
	])('Can remove team member', (desc, req, success) => {
		test(`${desc} ${success ? 'should call next()' : 'should respond with notAuthorized'}`, async () => {
			const mockCB = jest.fn();
			await Teamspaces.canRemoveTeamspaceMember(req, {}, mockCB);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).toHaveBeenCalledTimes(0);
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.notAuthorized.code);
			}
		});
	});
};

const testMemberExists = () => {
	describe('memberExists', () => {
		test('next() should be called if the provided username is member of the teamspace', async () => {
			const mockCB = jest.fn(() => {});

			await Teamspaces.memberExists(
				{ params: { teamspace, member: adminUser } },
				{},
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(TeamspacesModel.hasAccessToTeamspace).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.hasAccessToTeamspace).toHaveBeenCalledWith(teamspace, adminUser);
		});

		test('should respond with error if hasAccess throws an error', async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace, member: adminUser } };
			const err = new Error(generateRandomString());
			TeamspacesModel.hasAccessToTeamspace.mockRejectedValueOnce(err);

			await Teamspaces.memberExists(req, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(TeamspacesModel.hasAccessToTeamspace).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.hasAccessToTeamspace).toHaveBeenCalledWith(teamspace, adminUser);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, err);
		});

		test(`should respond with ${templates.notAuthorized.code} if the member has no access`, async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace, member: nonTsMemberUser } };

			await Teamspaces.memberExists(req, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(TeamspacesModel.hasAccessToTeamspace).toHaveBeenCalledTimes(1);
			expect(TeamspacesModel.hasAccessToTeamspace).toHaveBeenCalledWith(teamspace, nonTsMemberUser);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.userNotFound);
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces', () => {
	testCanRemoveTeamspaceMember();
	testMemberExists();
});
