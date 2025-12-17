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

const { generateRandomString, determineTestGroup, generateRandomObject, generateRandomEmail } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../src/v5/models/teamspaceSettings');
const TeamspacesModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../../../src/v5/services/sso/frontegg/components/accounts');
const FrontEggAccounts = require(`${src}/services/sso/frontegg/components/accounts`);

jest.mock('../../../../../../../src/v5/processors/teamspaces');
const TeamspacesProcessor = require(`${src}/processors/teamspaces`);

jest.mock('../../../../../../../src/v5/utils/permissions');
const PermissionsUtils = require(`${src}/utils/permissions`);

jest.mock('../../../../../../../src/v5/schemas/subscriptions');
const SubscriptionsSchema = require(`${src}/schemas/subscriptions`);

const Teamspaces = require(`${src}/middleware/dataConverter/inputs/teamspaces`);
const { templates } = require(`${src}/utils/responseCodes`);

const { SUBSCRIPTION_TYPES } = require(`${src}/models/teamspaces.constants`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const adminUser = generateRandomString();
const nonAdminUser = generateRandomString();
const usernameToRemove = generateRandomString();
const nonTsMemberUser = generateRandomString();
const teamspace = generateRandomString();

TeamspacesProcessor.isTeamspaceMember.mockImplementation((ts, username) => username !== nonTsMemberUser);
TeamspacesModel.getAddOns.mockImplementation((ts) => (ts === teamspace ? {} : { usersProvisioned: true }));
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
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledWith(teamspace, adminUser, true);
		});

		test('should respond with error if hasAccess throws an error', async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace, member: adminUser } };
			const err = new Error(generateRandomString());
			TeamspacesProcessor.isTeamspaceMember.mockRejectedValueOnce(err);

			await Teamspaces.memberExists(req, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledWith(teamspace, adminUser, true);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, err);
		});

		test(`should respond with ${templates.notAuthorized.code} if the member has no access`, async () => {
			const mockCB = jest.fn(() => {});
			const req = { params: { teamspace, member: nonTsMemberUser } };

			await Teamspaces.memberExists(req, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledWith(teamspace, nonTsMemberUser, true);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {}, templates.userNotFound);
		});
	});
};

const testValidateCreateTeamspaceData = () => {
	describe.each([
		['name is valid', { body: { name: generateRandomString() } }, true],
		['name too long', { body: { name: generateRandomString(129) } }, false],
		['name includes a full stop', { body: { name: `${generateRandomString()}.${generateRandomString()}` } }, false],
		['name includes special characters', { body: { name: `${generateRandomString()}@${generateRandomString()}#${generateRandomString()}!` } }, false],
		['teamspace name already exists', { body: { name: generateRandomString() } }, false, { failTsCheck: true }],
		['email is valid', { body: { name: generateRandomString(), admin: generateRandomEmail() } }, true],
		['email is invalid', { body: { name: generateRandomString(), admin: generateRandomString() } }, false],
		['account is provided', { body: { name: generateRandomString(), accountId: generateRandomString() } }, true, { accountCheckFail: false, getTeamspaceCheckFail: false }],
		['account doesn\'t exist', { body: { name: generateRandomString(), accountId: generateRandomString() } }, false, { accountCheckFail: true }],
		['account is already in used by another teamspace', { body: { name: generateRandomString(), accountId: generateRandomString() } }, false, { accountCheckFail: false, getTeamspaceCheckFail: true }],
		['everything is provided ', { body: { name: generateRandomString(), accountId: generateRandomString(), admin: generateRandomEmail() } }, true, { accountCheckFail: false, getTeamspaceCheckFail: false }],
		['name is missing ', { body: { accountId: generateRandomString(), admin: generateRandomEmail() } }, false, { accountCheckFail: false, getTeamspaceCheckFail: false }],
	])('Validate create teamspace data', (desc, req, success, { failTsCheck = false, accountCheckFail = null, getTeamspaceCheckFail = null } = {}) => {
		test(`${success ? 'Should call next()' : 'should respond with invalidArguments'} if ${desc}`, async () => {
			if (req.body.name) {
				if (failTsCheck) {
					TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce();
				} else {
					TeamspacesModel.getTeamspaceSetting.mockRejectedValueOnce(new Error());
				}
			}

			if (accountCheckFail !== null) {
				FrontEggAccounts.doesAccountExist.mockResolvedValueOnce(!accountCheckFail);
			}

			if (getTeamspaceCheckFail !== null) {
				FrontEggAccounts.getTeamspaceByAccount
					.mockResolvedValueOnce(getTeamspaceCheckFail ? generateRandomString() : undefined);
			}

			const mockCB = jest.fn(() => {});

			await Teamspaces.validateCreateTeamspaceData(req, {}, mockCB);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
			} else {
				expect(mockCB).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			}
		});
	});
};
const testValidateUpdateQuota = () => {
	describe('validateQuota', () => {
		test('next() should be called if the provided data is valid', async () => {
			const mockCB = jest.fn(() => {});
			const data = generateRandomObject();

			await Teamspaces.validateUpdateQuota({ body: data }, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(Responder.respond).not.toHaveBeenCalled();
			expect(SubscriptionsSchema.validateSchema).toHaveBeenCalledTimes(1);
			expect(SubscriptionsSchema.validateSchema)
				.toHaveBeenCalledWith(SUBSCRIPTION_TYPES.ENTERPRISE, data, true);
		});

		test('should respond with error if validateSchema throws an error', async () => {
			const mockCB = jest.fn(() => {});
			const req = { body: generateRandomObject() };
			const err = new Error(generateRandomString());
			SubscriptionsSchema.validateSchema.mockRejectedValueOnce(err);

			await Teamspaces.validateUpdateQuota(req, {}, mockCB);
			expect(mockCB).not.toHaveBeenCalled();
			expect(SubscriptionsSchema.validateSchema).toHaveBeenCalledTimes(1);
			expect(SubscriptionsSchema.validateSchema)
				.toHaveBeenCalledWith(SUBSCRIPTION_TYPES.ENTERPRISE, req.body, true);
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, {},
				{ ...templates.invalidArguments, message: err.message });
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testCanRemoveTeamspaceMember();
	testMemberExists();
	testValidateCreateTeamspaceData();
	testValidateUpdateQuota();
});
