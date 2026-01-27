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

const { src } = require('../../helper/path');
const { generateRandomString, determineTestGroup, generateRandomEmail } = require('../../helper/services');

jest.mock('../../../../src/v5/models/teamspaceSettings');
const TeamspacesModel = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../src/v5/services/sso/frontegg');
const FronteggMock = require(`${src}/services/sso/frontegg`);

const TeamspaceSchema = require(`${src}/schemas/teamspaces`);

const testValidateNewTeamspaceSchema = () => {
	describe.each([
		['name is valid', { name: generateRandomString() }, true],
		['name too long', { name: generateRandomString(129) }, false],
		['name includes a full stop', { name: `${generateRandomString()}.${generateRandomString()}` }, false],
		['name includes special characters', { name: `${generateRandomString()}@${generateRandomString()}#${generateRandomString()}!` }, false],
		['teamspace name already exists', { name: generateRandomString() }, false, { failTsCheck: true }],
		['email is valid', { name: generateRandomString(), admin: generateRandomEmail() }, true],
		['email is invalid', { name: generateRandomString(), admin: generateRandomString() }, false],
		['account is provided', { name: generateRandomString(), accountId: generateRandomString() }, true, { accountCheckFail: false, getTeamspaceCheckFail: false }],
		['account doesn\'t exist', { name: generateRandomString(), accountId: generateRandomString() }, false, { accountCheckFail: true }],
		['account is already in used by another teamspace', { name: generateRandomString(), accountId: generateRandomString() }, false, { accountCheckFail: false, getTeamspaceCheckFail: true }],
		['everything is provided ', { name: generateRandomString(), accountId: generateRandomString(), admin: generateRandomEmail() }, true, { accountCheckFail: false, getTeamspaceCheckFail: false }],
		['name is missing ', { accountId: generateRandomString(), admin: generateRandomEmail() }, false, { accountCheckFail: false, getTeamspaceCheckFail: false }],
	])('Validate create teamspace schema', (desc, data, success, { failTsCheck = false, accountCheckFail = null, getTeamspaceCheckFail = null } = {}) => {
		test(`${success ? 'Should call next()' : 'should respond with invalidArguments'} if ${desc}`, async () => {
			if (data.name) {
				if (failTsCheck) {
					TeamspacesModel.getTeamspaceSetting.mockResolvedValueOnce();
				} else {
					TeamspacesModel.getTeamspaceSetting.mockRejectedValueOnce(new Error());
				}
			}

			if (accountCheckFail !== null) {
				FronteggMock.doesAccountExist.mockResolvedValueOnce(!accountCheckFail);
			}

			if (getTeamspaceCheckFail !== null) {
				FronteggMock.getTeamspaceByAccount
					.mockResolvedValueOnce(getTeamspaceCheckFail ? generateRandomString() : undefined);
			}

			const fnProm = TeamspaceSchema.validateNewTeamspaceSchema(data);

			if (success) {
				await expect(fnProm).resolves.not.toBeUndefined();
			} else {
				await expect(fnProm).rejects.not.toBeUndefined();
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateNewTeamspaceSchema();
});
