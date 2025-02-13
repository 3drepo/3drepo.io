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

const { generateRandomString, generateRandomObject } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');
const { DEFAULT_ROLES } = require('../../../../../../../src/v5/models/roles.constants');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../src/v5/models/roles');
const RolesModel = require(`${src}/models/roles`);

jest.mock('../../../../../../../src/v5/models/teamspaceSettings');
const TeamspaceSettingsModel = require(`${src}/models/teamspaceSettings`);

const Roles = require(`${src}/middleware/dataConverter/inputs/teamspaces/roles`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testRoleExists = () => {
	describe('Check if role exists', () => {
		test('should respond with error if role does not exist', async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString(), role: generateRandomString() } };
			RolesModel.getRoleById.mockRejectedValueOnce(templates.roleNotFound);

			await Roles.roleExists(req, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(RolesModel.getRoleById).toHaveBeenCalledTimes(1);
			expect(RolesModel.getRoleById).toHaveBeenCalledWith(req.params.teamspace, req.params.role,
				{ _id: 1, name: 1 });
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.roleNotFound);
		});

		test('next() should be called if the role exists', async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString(), role: generateRandomString() } };
			const role = generateRandomObject();
			RolesModel.getRoleById.mockResolvedValueOnce(role);

			await Roles.roleExists(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.roleData).toEqual(role);
			expect(RolesModel.getRoleById).toHaveBeenCalledTimes(1);
			expect(RolesModel.getRoleById).toHaveBeenCalledWith(req.params.teamspace, req.params.role,
				{ _id: 1, name: 1 });
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
		// ['Without name', { ...data, name: undefined }],
	])('Validate new role', (desc, body, success, userWithNoAccess) => {
		test(`${desc} should ${success ? 'succeed and next() should be called' : `fail with ${templates.invalidArguments.code}`}`, async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString() }, body };

			if (body.name === takenName) {
				RolesModel.getRoleByName.mockResolvedValueOnce(takenName);
			} else if (body.name) {
				RolesModel.getRoleByName.mockRejectedValueOnce();
			}

			if (body?.users?.length) {
				TeamspaceSettingsModel.getUsersWithNoAccess
					.mockResolvedValueOnce(userWithNoAccess ? [generateRandomString()] : []);
			}

			await Roles.validateNewRole(req, {}, mockCB);
			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
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
	])('Validate update role', (desc, body, success, userWithNoAccess) => {
		test(`${desc} should ${success ? 'succeed and next() should be called' : `fail with ${templates.invalidArguments.code}`}`, async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString() }, body };

			RolesModel.getRoleById.mockResolvedValueOnce(existingRole);

			if (body.name === takenName) {
				RolesModel.getRoleByName.mockResolvedValueOnce(takenName);
			} else if (body.name !== existingRole.name) {
				RolesModel.getRoleByName.mockRejectedValueOnce();
			}

			if (body?.users?.length) {
				TeamspaceSettingsModel.getUsersWithNoAccess
					.mockResolvedValueOnce(userWithNoAccess ? [generateRandomString()] : []);
			}

			await Roles.validateUpdateRole(req, {}, mockCB);
			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/roles', () => {
	testRoleExists();
	testValidateNewRoleData();
	testValidateUpdateRoleData();
});
