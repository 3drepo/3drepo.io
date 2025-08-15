/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { generateRandomString, generateRandomObject, determineTestGroup } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');
const { DEFAULT_ROLES } = require('../../../../../../../src/v5/models/roles.constants');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../src/v5/processors/teamspaces/roles');
const RolesProcessor = require(`${src}/processors/teamspaces/roles`);

jest.mock('../../../../../../../src/v5/processors/teamspaces');
const TeamspaceProcessor = require(`${src}/processors/teamspaces`);

const Roles = require(`${src}/middleware/dataConverter/inputs/teamspaces/roles`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testRoleExists = () => {
	describe('Check if role exists', () => {
		test('should respond with error if role does not exist', async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString(), role: generateRandomString() } };
			RolesProcessor.getRoleById.mockRejectedValueOnce(templates.roleNotFound);

			await Roles.roleExists(req, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(RolesProcessor.getRoleById).toHaveBeenCalledTimes(1);
			expect(RolesProcessor.getRoleById).toHaveBeenCalledWith(req.params.teamspace, req.params.role);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.roleNotFound);
		});

		test('next() should be called if the role exists', async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString(), role: generateRandomString() } };
			const role = generateRandomObject();
			RolesProcessor.getRoleById.mockResolvedValueOnce(role);

			await Roles.roleExists(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.roleData).toEqual(role);
			expect(RolesProcessor.getRoleById).toHaveBeenCalledTimes(1);
			expect(RolesProcessor.getRoleById).toHaveBeenCalledWith(req.params.teamspace, req.params.role);
			expect(Responder.respond).not.toHaveBeenCalled();
		});
	});
};

const commonTestCases = (data, takenName, userWithAccess) => ([
	['With valid data', data, true],
	['With name that is already taken', { ...data, name: takenName }],
	['With invalid users', { ...data, users: 123 }],
	['With duplicate users', { ...data, users: [userWithAccess, userWithAccess] }, true],
	['With users that have no access to teamspace', data, false, true],
	['Without users', { ...data, users: undefined }, true],
	['With invalid color', { ...data, color: generateRandomString() }],
	['Without color', { ...data, color: undefined }, true],
]);

const runValidateRoleDataTest = (isUpdate, takenName, existingRole) => (desc, body, success, userWithNoAccess) => {
	test(`${desc} should ${success ? 'succeed and next() should be called' : `fail with ${templates.invalidArguments.code}`}`, async () => {
		const mockCB = jest.fn(() => {});
		const req = { params: { teamspace: generateRandomString() }, body };

		if (isUpdate) RolesProcessor.getRoleById.mockResolvedValueOnce(existingRole);

		if (body.name === takenName) {
			RolesProcessor.isRoleNameUsed.mockResolvedValueOnce(true);
		} else if (body.name) {
			RolesProcessor.isRoleNameUsed.mockResolvedValueOnce(false);
		}

		if (body?.users?.length) {
			const userList = userWithNoAccess ? [] : body?.users ?? [];
			TeamspaceProcessor.getAllMembersInTeamspace.mockResolvedValueOnce(userList.map((user) => ({ user })));
		}

		const fn = isUpdate ? Roles.validateUpdateRole : Roles.validateNewRole;

		await fn(req, {}, mockCB);
		if (success) {
			expect(mockCB).toHaveBeenCalledTimes(1);
		} else {
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
		}
	});
};

const testValidateNewRoleData = () => {
	const takenName = generateRandomString();
	const userWithAccess = generateRandomString();
	const data = {
		name: generateRandomString(),
		color: DEFAULT_ROLES[0].color,
		users: times(5, () => generateRandomString()),
	};

	describe.each([
		...commonTestCases(data, takenName, userWithAccess),
	])('Validate new role', runValidateRoleDataTest(false, takenName));
};

const testValidateUpdateRoleData = () => {
	const userWithAccess = generateRandomString();
	const takenName = generateRandomString();
	const existingRole = { name: generateRandomString() };
	const data = {
		name: generateRandomString(),
		color: DEFAULT_ROLES[0].color,
		users: times(5, () => generateRandomString()),
	};

	describe.each([
		...commonTestCases(data, takenName, userWithAccess),
		['Without name', { ...data, name: undefined }, true],
		['Without any values', { }],
		['With the same name', { ...data, name: existingRole.name }, true],
	])('Validate update role', runValidateRoleDataTest(true, takenName, existingRole));
};

describe(determineTestGroup(__filename), () => {
	testRoleExists();
	testValidateNewRoleData();
	testValidateUpdateRoleData();
});
