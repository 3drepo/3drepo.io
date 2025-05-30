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
const { src } = require('../../../../../helper/path');

const { determineTestGroup, generateRandomString } = require('../../../../../helper/services');

jest.mock('../../../../../../../src/v5/services/sso/frontegg/components/connections');
const Connections = require(`${src}/services/sso/frontegg/components/connections`);

jest.mock('../../../../../../../src/v5/utils/webRequests');
const WebRequests = require(`${src}/utils/webRequests`);

const Accounts = require(`${src}/services/sso/frontegg/components/accounts`);
const { errCodes, membershipStatus, HEADER_TENANT_ID, META_LABEL_TEAMSPACE, mfaPolicy } = require(`${src}/services/sso/frontegg/frontegg.constants`);

const bearerHeader = { [generateRandomString()]: generateRandomString() };
const postOptions = { headers: bearerHeader };

const role = generateRandomString();

Connections.getBearerHeader.mockResolvedValue(bearerHeader);
Connections.getConfig.mockResolvedValue({ userRole: role });

const testGetTeamspaceByAccount = () => {
	describe('Get teamspace by account', () => {
		test('Should return teamspace name from frontegg', async () => {
			const teamspace = generateRandomString();
			WebRequests.get.mockResolvedValueOnce({
				data: {
					metadata: JSON.stringify({ [META_LABEL_TEAMSPACE]: teamspace }),
				},
			});

			const accountId = generateRandomString();

			await expect(Accounts.getTeamspaceByAccount(accountId)).resolves.toEqual(teamspace);

			expect(Connections.getConfig).toHaveBeenCalledTimes(1);
			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			const url = WebRequests.get.mock.calls[0][0];
			expect(url.includes(accountId)).toBeTruthy();
		});

		test('Should return undefined if anything went wrong', async () => {
			WebRequests.get.mockRejectedValueOnce({ message: generateRandomString() });

			const accountId = generateRandomString();

			await expect(Accounts.getTeamspaceByAccount(accountId)).resolves.toBeUndefined();

			expect(Connections.getConfig).toHaveBeenCalledTimes(1);
			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			const url = WebRequests.get.mock.calls[0][0];
			expect(url.includes(accountId)).toBeTruthy();
		});
	});
};

const testCreateAccount = () => {
	describe('Create account', () => {
		test('Should return the tenant ID if the account has been created', async () => {
			const teamspace = generateRandomString();

			const returnedId = await Accounts.createAccount(teamspace);

			// first for this call, another one for MFA
			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(2);
			expect(Connections.getConfig).toHaveBeenCalledTimes(2);

			expect(WebRequests.post).toHaveBeenCalledTimes(3);

			// the call to create the account
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String),
				expect.objectContaining({ name: teamspace }), postOptions);

			const { tenantId } = WebRequests.post.mock.calls[0][1];

			expect(returnedId).toEqual(tenantId);

			// to add teamsapce as metadata
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String),
				expect.objectContaining({ metadata: { [META_LABEL_TEAMSPACE]: teamspace } }), postOptions);

			// to add application to the account
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String),
				{ tenantId }, postOptions);

			// call to set MFA policy
			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(WebRequests.put).toHaveBeenCalledWith(expect.any(String),
				{
					enforceMFAType: mfaPolicy.ENABLED,
					allowRememberMyDevice: false,
				}, { headers: { ...bearerHeader,
					[HEADER_TENANT_ID]: tenantId } });
		});

		test('Should throw if something went wrong', async () => {
			WebRequests.post.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Accounts.createAccount(generateRandomString)).rejects.not.toBeUndefined();
		});
	});
};

const testGetAllUsersInAccount = () => {
	describe('Get all users in account', () => {
		const generateResponse = (nItems, hasNext) => ({
			data: {
				items: times(nItems, () => ({ id: generateRandomString(), email: generateRandomString() })),
				_links: { next: hasNext ? generateRandomString() : undefined },
			},
		});

		test('Should return empty array if there are no users', async () => {
			const accountId = generateRandomString();

			const expectedHeader = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,

			};
			WebRequests.get.mockResolvedValueOnce(generateResponse(0, false));

			const users = await Accounts.getAllUsersInAccount(accountId);

			expect(users).toEqual([]);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), expectedHeader);
		});

		test('Should return list of users (no pagination)', async () => {
			const accountId = generateRandomString();

			const expectedHeader = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,

			};
			const webRes = generateResponse(10, false);
			WebRequests.get.mockResolvedValueOnce(webRes);

			const users = await Accounts.getAllUsersInAccount(accountId);

			expect(users).toEqual(webRes.data.items);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), expectedHeader);
		});

		test('Should return list of users (3 pages)', async () => {
			const accountId = generateRandomString();

			const expectedHeader = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,

			};
			const webRes1 = generateResponse(10, true);
			const webRes2 = generateResponse(10, true);
			const webRes3 = generateResponse(2, false);
			WebRequests.get.mockResolvedValueOnce(webRes1);
			WebRequests.get.mockResolvedValueOnce(webRes2);
			WebRequests.get.mockResolvedValueOnce(webRes3);

			const users = await Accounts.getAllUsersInAccount(accountId);

			const expectedUsers = [...webRes1.data.items, ...webRes2.data.items, ...webRes3.data.items];

			expect(users).toEqual(expectedUsers);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.get).toHaveBeenCalledTimes(3);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), expectedHeader);

			/* eslint-disable no-underscore-dangle */
			expect(WebRequests.get.mock.calls[1][0].includes(webRes1.data._links.next)).toBeTruthy();
			expect(WebRequests.get.mock.calls[2][0].includes(webRes2.data._links.next)).toBeTruthy();
			/* eslint-enable no-underscore-dangle */
		});

		test('Should reject with error if something failed', async () => {
			const accountId = generateRandomString();
			WebRequests.get.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Accounts.getAllUsersInAccount(accountId)).rejects.not.toBeUndefined();
		});
	});
};

const testAddUserToAccount = () => {
	describe('Add user to account', () => {
		[true, false].forEach((sendEmail) => {
			test(`Should send request to add user to the account (Send invite: ${sendEmail})`, async () => {
				const email = generateRandomString();
				const name = generateRandomString();
				const accountId = generateRandomString();
				const teamspace = generateRandomString();
				const sender = generateRandomString();
				const userId = generateRandomString();

				WebRequests.post.mockResolvedValueOnce({ data: { id: userId } });

				await expect(Accounts.addUserToAccount(accountId, email, name,
					sendEmail ? { teamspace, sender } : undefined)).resolves.toEqual(userId);
				const expectedHeader = {
					...bearerHeader,
					[HEADER_TENANT_ID]: accountId,
				};

				const emailMetadata = sendEmail ? {
					sender,
					teamspace,
				} : {};

				const expectedPayload = {
					email,
					name,
					skipInviteEmail: !sendEmail,
					roleIds: [role],
					emailMetadata,
				};

				expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
				expect(Connections.getConfig).toHaveBeenCalledTimes(1);

				expect(WebRequests.post).toHaveBeenCalledTimes(1);
				expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String), expectedPayload,
					{ headers: expectedHeader });
			});
		});

		test('Should not fail if the user is already in the tenant', async () => {
			const email = generateRandomString();
			const name = generateRandomString();
			const accountId = generateRandomString();

			WebRequests.post.mockRejectedValueOnce({ message: generateRandomString(),
				response: { data: { errorCode: errCodes.USER_ALREADY_EXIST } } });

			await expect(Accounts.addUserToAccount(accountId, email, name)).resolves.toBeUndefined();

			const expectedHeader = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,
			};

			const expectedPayload = {
				email,
				name,
				skipInviteEmail: true,
				roleIds: [role],
				emailMetadata: {},
			};

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.post).toHaveBeenCalledTimes(1);
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String), expectedPayload,
				{ headers: expectedHeader });
		});

		test('Should throw error if post request failed', async () => {
			const email = generateRandomString();
			const accountId = generateRandomString();
			const teamspace = generateRandomString();
			const sender = generateRandomString();

			WebRequests.post.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Accounts.addUserToAccount(accountId, email, undefined, { teamspace, sender }))
				.rejects.not.toBeUndefined();
			const expectedHeader = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,
			};

			const emailMetadata = {
				sender,
				teamspace,
			};

			const expectedPayload = {
				email,
				name: undefined,
				skipInviteEmail: false,
				roleIds: [role],
				emailMetadata,
			};

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.post).toHaveBeenCalledTimes(1);
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String), expectedPayload,
				{ headers: expectedHeader });
		});
	});
};

const testRemoveUserFromAccount = () => {
	describe('Remove user from account', () => {
		test('Should send request to remove user from the account', async () => {
			const userId = generateRandomString();
			const accountId = generateRandomString();

			const header = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,
			};

			await Accounts.removeUserFromAccount(accountId, userId);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), header);

			expect(WebRequests.delete.mock.calls[0][0].includes(userId)).toBeTruthy();
		});

		test('Should throw error if delete request failed', async () => {
			const userId = generateRandomString();
			const accountId = generateRandomString();

			const header = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,
			};

			WebRequests.delete.mockRejectedValueOnce({ message: generateRandomString() });

			await expect(Accounts.removeUserFromAccount(accountId, userId)).rejects.not.toBeUndefined();

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), header);

			expect(WebRequests.delete.mock.calls[0][0].includes(userId)).toBeTruthy();
		});

		test('Should not throw error if delete request failed with user not found', async () => {
			const userId = generateRandomString();
			const accountId = generateRandomString();

			const header = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,
			};

			WebRequests.delete.mockRejectedValueOnce({ message: generateRandomString(),
				response: { data: { errorCode: errCodes.USER_NOT_FOUND } } });

			await Accounts.removeUserFromAccount(accountId, userId);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), header);

			expect(WebRequests.delete.mock.calls[0][0].includes(userId)).toBeTruthy();
		});
	});
};

const testRemoveAccount = () => {
	describe('Remove account', () => {
		test('Should send request to remove account', async () => {
			const accountId = generateRandomString();

			await Accounts.removeAccount(accountId);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.delete.mock.calls[0][0].includes(accountId)).toBeTruthy();
		});

		test('Should throw error if delete request failed', async () => {
			const accountId = generateRandomString();

			WebRequests.delete.mockRejectedValueOnce({ message: generateRandomString(), response: { status: 403 } });

			await expect(Accounts.removeAccount(accountId)).rejects.not.toBeUndefined();

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.delete.mock.calls[0][0].includes(accountId)).toBeTruthy();
		});

		test('Should not throw error if delete request failed with a 404', async () => {
			const accountId = generateRandomString();

			WebRequests.delete.mockRejectedValueOnce({ message: generateRandomString(), response: { status: 404 } });

			await Accounts.removeAccount(accountId);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.delete).toHaveBeenCalledTimes(1);
			expect(WebRequests.delete).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.delete.mock.calls[0][0].includes(accountId)).toBeTruthy();
		});
	});
};

const testGetUserStatusInAccount = () => {
	describe('Get user status in account', () => {
		const accountId = generateRandomString();
		const userId = generateRandomString();
		test(`should return membership enum ${membershipStatus.NOT_MEMBER} if the user is not found`, async () => {
			WebRequests.get.mockRejectedValueOnce({ message: generateRandomString(),
				response: { status: 404, data: { errorCode: errCodes.USER_NOT_FOUND } } });

			await expect(Accounts.getUserStatusInAccount(accountId, userId))
				.resolves.toEqual(membershipStatus.NOT_MEMBER);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.get.mock.calls[0][0].includes(userId)).toBeTruthy();
		});

		test('should throw if get request failed for any other reaons', async () => {
			WebRequests.get.mockRejectedValueOnce({ message: generateRandomString(),
				response: { status: 404, data: { errorCode: 123 } } });

			await expect(Accounts.getUserStatusInAccount(accountId, userId))
				.rejects.not.toBeUndefined();

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

			expect(WebRequests.get.mock.calls[0][0].includes(userId)).toBeTruthy();
		});

		describe.each([
			['data is empty', [], membershipStatus.NOT_MEMBER],
			['user is not associated with any tenants', [{ userId, tenantsStatuses: [] }], membershipStatus.NOT_MEMBER],
			['user is not associated with the tenant', [{ userId, tenantsStatuses: [{ tenantId: generateRandomString(), status: 'activated' }] }], membershipStatus.NOT_MEMBER],
			['user membership is not active', [{ userId, tenantsStatuses: [{ tenantId: accountId, status: 'NotActivated' }] }], membershipStatus.INACTIVE],
			['user membership is active', [{ userId, tenantsStatuses: [{ tenantId: accountId, status: 'Activated' }] }], membershipStatus.ACTIVE],
			['user membership is pending login', [{ userId, tenantsStatuses: [{ tenantId: accountId, status: 'PendingLogin' }] }], membershipStatus.PENDING_LOGIN],
			['user membership is pending invite acceptance', [{ userId, tenantsStatuses: [{ tenantId: accountId, status: 'PendingInvitation' }] }], membershipStatus.PENDING_INVITE],
			['user membership is in an unknown state', [{ userId, tenantsStatuses: [{ tenantId: accountId, status: generateRandomString() }] }], membershipStatus.NOT_MEMBER],
		])('', (desc, data, memStatus) => {
			test(`should return membership enum ${memStatus} if ${desc}`, async () => {
				WebRequests.get.mockResolvedValueOnce({ data });

				await expect(Accounts.getUserStatusInAccount(accountId, userId))
					.resolves.toEqual(memStatus);

				expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
				expect(Connections.getConfig).toHaveBeenCalledTimes(1);

				expect(WebRequests.get).toHaveBeenCalledTimes(1);
				expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), bearerHeader);

				expect(WebRequests.get.mock.calls[0][0].includes(userId)).toBeTruthy();
			});
		});
	});
};

const testSetMFAPolicy = () => {
	describe('Set MFA policy', () => {
		test('Should succeed if policy setting is valid', async () => {
			const accountId = generateRandomString();

			const expectedHeader = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,

			};

			const enforceMFAType = mfaPolicy.ENABLED;
			await Accounts.setMFAPolicy(accountId, enforceMFAType);

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);

			const expectedPayload = {
				enforceMFAType,
				allowRememberMyDevice: false,
			};

			expect(WebRequests.put).toHaveBeenCalledTimes(1);
			expect(WebRequests.put).toHaveBeenCalledWith(expect.any(String),
				expectedPayload, { headers: expectedHeader });
		});

		test('Should error if policy setting is invalid', async () => {
			const accountId = generateRandomString();

			const enforceMFAType = generateRandomString();
			await expect(Accounts.setMFAPolicy(accountId, enforceMFAType)).rejects.toEqual(expect.objectContaining({
				message: `Failed to create account on Accounts: Unrecognised policy setting: ${enforceMFAType}`,
			}));

			expect(WebRequests.put).not.toHaveBeenCalled();
		});
	});
};

const testGetClaimedDomains = () => {
	const activeConfig1Domains = times(2, () => generateRandomString());
	const activeConfig1 = {
		enabled: true,
		domains: activeConfig1Domains.map((domain) => ({ domain })),
	};

	const activeConfig2Domains = times(2, () => generateRandomString());
	const activeConfig2 = {
		enabled: true,
		domains: activeConfig2Domains.map((domain) => ({ domain })),
	};

	const inActiveConfig = {
		enabled: false,
		domains: times(2, () => ({ domain: generateRandomString() })),
	};

	describe.each([
		['the tenant contains an active SSO configuration', [activeConfig1], activeConfig1Domains],
		['the tenant contains multiple active configurations', [activeConfig1, activeConfig2], [...activeConfig1Domains, ...activeConfig2Domains]],
		['the tenant contains an inactive configuration', [inActiveConfig], []],
		['the tenant contains both an active and inactive configuration', [activeConfig1, inActiveConfig], activeConfig1Domains],
		['the tenant contains no configuration', [], []],
		['the function returned with failures'],
	])('Get Claimed domains', (desc, getRes, domains) => {
		test(`Should ${domains !== undefined ? 'return expected domains' : 'fail with error'} if ${desc}`, async () => {
			const accountId = generateRandomString();

			const expectedHeader = {
				...bearerHeader,
				[HEADER_TENANT_ID]: accountId,

			};

			WebRequests.get.mockResolvedValueOnce({ data: getRes });

			if (domains) await expect(Accounts.getClaimedDomains(accountId)).resolves.toEqual(domains);
			else await expect(Accounts.getClaimedDomains(accountId)).rejects.not.toBeUndefined();

			expect(Connections.getBearerHeader).toHaveBeenCalledTimes(1);
			expect(Connections.getConfig).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledTimes(1);
			expect(WebRequests.get).toHaveBeenCalledWith(expect.any(String), expectedHeader);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetTeamspaceByAccount();
	testCreateAccount();
	testGetAllUsersInAccount();
	testAddUserToAccount();
	testRemoveUserFromAccount();
	testRemoveAccount();
	testGetUserStatusInAccount();
	testSetMFAPolicy();
	testGetClaimedDomains();
});
