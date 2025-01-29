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

const commonTestCases = (data, takenName, usersWithTsAccess) => ([
	['With valid data', data, true],
	['With name that is already taken', { ...data, name: takenName }],
	['With invalid users', { ...data, users: 123 }],
	['With duplicate users', { ...data, users: [usersWithTsAccess[0], usersWithTsAccess[0]] }],
	['With users that have no access to teamspace', { ...data, users: [generateRandomString()] }],
	['Without users', { ...data, users: undefined }, true],
	['With invalid color', { ...data, color: generateRandomString() }],
	['Without color', { ...data, color: undefined }, true],
]);

const testValidateNewRoleData = () => {
	const usersWithTsAccess = times(5, () => generateRandomString());
	const takenName = generateRandomString();
	const data = {
		name: generateRandomString(),
		color: DEFAULT_ROLES[0].color,
		users: usersWithTsAccess,
	};

	describe.each([
		...commonTestCases(data, takenName, usersWithTsAccess),
		['Without name', { ...data, name: undefined }],
	])('Validate new role', (desc, body, success) => {
		test(`${desc} should ${success ? 'succeed and next() should be called' : `fail with ${templates.invalidArguments.code}`}`, async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString() }, body };

			if (body.name === takenName) {
				RolesModel.getRoleByName.mockResolvedValueOnce(takenName);
			} else if (body.name) {
				RolesModel.getRoleByName.mockRejectedValueOnce();
			}

			if (body.users?.length) {
				TeamspaceSettingsModel.getAllUsersInTeamspace.mockResolvedValueOnce(usersWithTsAccess);
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
	const usersWithTsAccess = times(5, () => generateRandomString());
	const takenName = generateRandomString();
	const existingRole = { name: generateRandomString() };
	const data = {
		name: generateRandomString(),
		color: DEFAULT_ROLES[0].color,
		users: usersWithTsAccess,
	};

	describe.each([
		...commonTestCases(data, takenName, usersWithTsAccess),
		['Without name', { ...data, name: undefined }, true],
		['Without any values', { }, false],
		['With the same name', { ...data, name: existingRole.name }, true],
	])('Validate update role', (desc, body, success) => {
		test(`${desc} should ${success ? 'succeed and next() should be called' : `fail with ${templates.invalidArguments.code}`}`, async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace: generateRandomString() }, body };

			RolesModel.getRoleById.mockResolvedValueOnce(existingRole);

			if (body.name === takenName) {
				RolesModel.getRoleByName.mockResolvedValueOnce(takenName);
			} else if (body.name !== existingRole.name) {
				RolesModel.getRoleByName.mockRejectedValueOnce();
			}

			if (body.users?.length) {
				TeamspaceSettingsModel.getAllUsersInTeamspace.mockResolvedValueOnce(usersWithTsAccess);
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
