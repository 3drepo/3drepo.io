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

const { times } = require('lodash');

const { src } = require('../../helper/path');

const { determineTestGroup, generateRandomString, generateRandomObject } = require('../../helper/services');

const Teamspace = require(`${src}/models/teamspaceSettings`);
const { USERS_DB_NAME } = require(`${src}/models/users.constants`);
const { ADD_ONS, DEFAULT_TOPIC_TYPES, DEFAULT_RISK_CATEGORIES, SECURITY, SECURITY_SETTINGS } = require(`${src}/models/teamspaces.constants`);
const { membershipStatus } = require(`${src}/services/sso/frontegg/frontegg.constants`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { TEAMSPACE_ADMIN } = require(`${src}/utils/permissions/permissions.constants`);
const { ADD_ONS_MODULES } = require(`${src}/models/teamspaces.constants`);

const TEAMSPACE_SETTINGS_COL = 'teamspace';

jest.mock('../../../../src/v5/services/sso/frontegg');
const FronteggService = require(`${src}/services/sso/frontegg`);

const generateSecurityConfig = (sso, whiteList) => {
	if (!sso && !whiteList) return {};
	return {
		[SECURITY]: deleteIfUndefined({
			[SECURITY_SETTINGS.SSO_RESTRICTED]: sso || undefined,
			[SECURITY_SETTINGS.DOMAIN_WHITELIST]: whiteList,
		}),
	};
};

const testHasAccessToTeamspace = () => {
	describe('Has access to teamspace', () => {
		const teamspace = generateRandomString();
		const user = generateRandomString();
		const domain = `${generateRandomString()}.com`;

		test('should return false if the user do not have access to teamspace', async () => {
			const findFn = jest.spyOn(db, 'findOne');
			findFn.mockResolvedValueOnce();

			const res = await Teamspace.hasAccessToTeamspace(teamspace, user);

			expect(res).toBeFalsy();
			expect(findFn).toHaveBeenCalledTimes(1);
		});

		const genUserData = ({ inDomain, sso } = {}) => ({
			_id: user,
			customData: {
				email: `${generateRandomString()}@${inDomain ? domain : `${generateRandomString()}.com`}`,
				sso: sso ? { something: 1 } : undefined,
			},
		});

		describe.each([
			['user has access to a teamspace with no restriction', genUserData(), {}, true, undefined, true],
			['user has access to the teamspace and is in whitelist domain', genUserData({ inDomain: true }), generateSecurityConfig(false, [domain]), false, membershipStatus.ACTIVE, true],
			['user has access to the teamspace but is not in whitelist domain but status check is bypassed', genUserData({ }), generateSecurityConfig(false, [domain]), true, undefined, true],
			['user has access to the teamspace but is not in whitelist domain', genUserData({ }), generateSecurityConfig(false, [domain]), false, undefined, false, templates.domainRestricted],
			['user has access to a teamspace but membershipStatus is inactive', genUserData(), {}, false, membershipStatus.INACTIVE, false, templates.membershipInactive],
			['user has access to a teamspace but membershipStatus is pending invite', genUserData(), {}, false, membershipStatus.PENDING_INVITE, false, templates.pendingInviteAcceptance],
			['user has access to a teamspace but membershipStatus is empty', genUserData(), {}, false, membershipStatus.NOT_MEMBER, false, false],
		])('', (desc, userData, teamspaceSettings, bypassStatus, memStatus, success, retVal) => {
			test(`Should ${success ? 'return true' : `throw with ${retVal?.code}`} if ${desc}`, async () => {
				const findFn = jest.spyOn(db, 'findOne');
				// first call fetches the user data
				findFn.mockResolvedValueOnce(userData);

				if (!bypassStatus) {
					// second call fetches teamspace settings
					findFn.mockResolvedValueOnce(teamspaceSettings);
				}

				const refId = generateRandomString();

				if (memStatus !== undefined) {
					// third call fetches refId
					findFn.mockResolvedValueOnce({ customData: { refId } });
					FronteggService.getUserStatusInAccount.mockResolvedValueOnce(memStatus);
				}

				const test = expect(Teamspace.hasAccessToTeamspace(teamspace, user, bypassStatus));

				if (success) {
					await test.resolves.toBeTruthy();
				} else if (retVal === false) {
					await test.resolves.toBeFalsy();
				} else {
					await test.rejects.toEqual(retVal);
				}

				let expectedCalls = 1;

				if (!bypassStatus) ++expectedCalls;
				if (memStatus !== undefined) ++expectedCalls;

				expect(findFn).toHaveBeenCalledTimes(expectedCalls);
			});
		});
	});
};

const testTeamspaceAdmins = () => {
	describe('Get teamspace admins', () => {
		test('should return list of admins if teamspace exists', async () => {
			const expectedData = {
				permissions: [
					{ user: 'personA', permissions: [TEAMSPACE_ADMIN] },
					{ user: 'personB', permissions: ['someOtherPerm'] },
					{ user: 'personC', permissions: [TEAMSPACE_ADMIN] },
				],
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

const testGrantAdminPermissionToUser = () => {
	describe('Grant teamspace admin permission to user', () => {
		test('Should grant teamspace admin permission to user', async () => {
			const teamspace = generateRandomString();
			const username = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne');
			await Teamspace.grantAdminToUser(teamspace, username);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				{ $push: { permissions: { user: username, permissions: [TEAMSPACE_ADMIN] } } });
		});
	});
};

const testGetMembersInfo = () => {
	describe('Get teamspace admins', () => {
		test('should return list of users from teamspace with their details', async () => {
			const mockData = [
				{ user: 'A', customData: { firstName: 'a', lastName: 'b', billing: { billingInfo: { company: 'companyA' } } } },
				{ user: 'B', customData: { firstName: 'a', lastName: 'b', billing: {} } },
				{ user: 'C', customData: { firstName: 'a', lastName: 'b' } },
				{ user: 'D', customData: { } },
			];

			const expectedData = [
				{ user: 'A', firstName: 'a', lastName: 'b', company: 'companyA' },
				{ user: 'B', firstName: 'a', lastName: 'b' },
				{ user: 'C', firstName: 'a', lastName: 'b' },
				{ user: 'D', firstName: undefined, lastName: undefined },
			];
			const ts = 'ts';
			const fn = jest.spyOn(db, 'find').mockResolvedValue(mockData);
			const res = await Teamspace.getMembersInfo(ts);
			expect(res).toEqual(expectedData);

			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ 'roles.db': ts });
		});
		test('should return empty array if there are no members', async () => {
			const ts = 'ts';
			const fn = jest.spyOn(db, 'find').mockResolvedValue([]);
			const res = await Teamspace.getMembersInfo(ts);
			expect(res).toEqual([]);

			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ 'roles.db': ts });
		});
	});
};

const testGetSubscriptions = () => {
	describe('Get teamspace subscriptions', () => {
		test('should succeed if teamspace exists', async () => {
			const expectedData = {
				subscriptions: {
					a: 1,
					b: 2,
				},
			};
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const res = await Teamspace.getSubscriptions(teamspace);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ _id: teamspace });
			expect(res).toEqual(expectedData.subscriptions);
		});

		test('should return empty object if the teamspace has no subs', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({});

			const teamspace = 'someTS';
			const res = await Teamspace.getSubscriptions(teamspace);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ _id: teamspace });
			expect(res).toEqual({});
		});

		test('should return error if teamspace does not exists', async () => {
			jest.spyOn(db, 'findOne').mockResolvedValue(undefined);

			await expect(Teamspace.getSubscriptions('someTS'))
				.rejects.toEqual(templates.teamspaceNotFound);
		});
	});
};

const testEditSubscriptions = () => {
	describe('Edit teamspace subscriptions', () => {
		const formatToMongoAction = (obj, prefix) => {
			const res = {};

			Object.keys(obj).forEach((val) => {
				res[`${prefix}.${val}`] = obj[val];
			});

			return res;
		};

		test('should update fields provided', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();
			const type = generateRandomString();

			const update = {
				collaborators: 10,
				data: 100,
				expiryDate: new Date(),
			};
			const subsObjPath = `subscriptions.${type}`;

			await expect(Teamspace.editSubscriptions(teamspace, type, update)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $set: formatToMongoAction(update, subsObjPath) });
		});

		test('should only update fields that are recognised', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();
			const type = generateRandomString();

			const update = {
				collaborators: 10,
				[generateRandomString()]: generateRandomString(),
			};
			const subsObjPath = `subscriptions.${type}`;

			await expect(Teamspace.editSubscriptions(teamspace, type, update)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				{ $set: formatToMongoAction({ collaborators: update.collaborators }, subsObjPath) });
		});

		test('should not call update if there was no valid data to update', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();
			const type = generateRandomString();

			const update = {
				[generateRandomString()]: generateRandomString(),
			};

			await expect(Teamspace.editSubscriptions(teamspace, type, update)).resolves.toBeUndefined();
			expect(fn).not.toHaveBeenCalled();
		});
	});
};

const testRemoveSubscription = () => {
	describe('Remove teamspace subscriptions', () => {
		test('should get rid of the license of the given subscription type', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();
			const type = generateRandomString();

			const subsObjPath = `subscriptions.${type}`;

			await expect(Teamspace.removeSubscription(teamspace, type)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $unset: { [subsObjPath]: 1 } });
		});

		test('should get rid of all licenses if subscription type is not given', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();

			const subsObjPath = 'subscriptions';

			await expect(Teamspace.removeSubscription(teamspace)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $unset: { [subsObjPath]: 1 } });
		});
	});
};

const addOnsProjection = {};

Object.values(ADD_ONS).forEach((val) => {
	addOnsProjection[`addOns.${val}`] = 1;
});

const testRemoveAddOns = () => {
	describe('Remove teamspace addOns', () => {
		test('should get rid of all addOns', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();

			const unsetObj = addOnsProjection;

			await expect(Teamspace.removeAddOns(teamspace)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $unset: unsetObj });
		});
	});
};

const testGetAddOns = () => {
	describe('Get teamspace addOns', () => {
		test('should get all applicable addOns', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({
				addOns: {
					[ADD_ONS.VR]: true,
					[ADD_ONS.SRC]: true,
					[ADD_ONS.HERE]: true,
					[ADD_ONS.POWERBI]: true,
					[ADD_ONS.DAILY_DIGEST]: true,
					[ADD_ONS.MODULES]: [ADD_ONS_MODULES.ISSUES],
				} });

			const teamspace = generateRandomString();

			await expect(Teamspace.getAddOns(teamspace)).resolves.toEqual({
				[ADD_ONS.VR]: true,
				[ADD_ONS.SRC]: true,
				[ADD_ONS.HERE]: true,
				[ADD_ONS.POWERBI]: true,
				[ADD_ONS.DAILY_DIGEST]: true,
				[ADD_ONS.MODULES]: [ADD_ONS_MODULES.ISSUES],
			});

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				addOnsProjection, undefined);
		});

		test('should get all applicable addOns (no addOns)', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({});

			const teamspace = generateRandomString();

			await expect(Teamspace.getAddOns(teamspace)).resolves.toEqual({});
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				addOnsProjection, undefined);
		});
	});
};

const testIsAddOnModuleEnabled = () => {
	describe('Is addOn module enabled', () => {
		const teamspace = generateRandomString();

		test('should return true if module is enabled', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({ addOns: { [ADD_ONS.MODULES]: [ADD_ONS_MODULES.ISSUES] } });
			const moduleName = ADD_ONS_MODULES.ISSUES;

			await expect(Teamspace.isAddOnModuleEnabled(teamspace, moduleName)).resolves.toEqual(true);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				addOnsProjection, undefined);
		});

		test('should return false if module is not enabled', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({ addOns: { [ADD_ONS.MODULES]: [ADD_ONS_MODULES.RISKS] } });
			const moduleName = ADD_ONS_MODULES.ISSUES;

			await expect(Teamspace.isAddOnModuleEnabled(teamspace, moduleName)).resolves.toEqual(false);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				addOnsProjection, undefined);
		});

		test('should return false if no modules are enabled', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({ addOns: { } });
			const moduleName = ADD_ONS_MODULES.ISSUES;

			await expect(Teamspace.isAddOnModuleEnabled(teamspace, moduleName)).resolves.toEqual(false);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				addOnsProjection, undefined);
		});
	});
};

const testUpdateAddOns = () => {
	describe('Update teamspace addOns', () => {
		const formatToMongoAction = (obj) => {
			const set = {};
			const unset = {};

			Object.keys(obj).forEach((val) => {
				const prefix = 'addOns';
				if (obj[val]) {
					set[`${prefix}.${val}`] = true;
				} else {
					unset[`${prefix}.${val}`] = 1;
				}
			});

			return {
				...(Object.keys(set).length ? { $set: set } : {}),
				...(Object.keys(unset).length ? { $unset: unset } : {}),
			};
		};

		test('should update fields provided', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();

			const update = {
				[ADD_ONS.VR]: true,
				[ADD_ONS.POWERBI]: true,
				[ADD_ONS.SRC]: false,
			};
			await expect(Teamspace.updateAddOns(teamspace, update)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, formatToMongoAction(update));
		});

		test('should only update fields that are recognised', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();

			const update = {
				[ADD_ONS.POWERBI]: true,
				[generateRandomString()]: generateRandomString(),
			};

			await expect(Teamspace.updateAddOns(teamspace, update)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				formatToMongoAction({ [ADD_ONS.POWERBI]: true }));
		});

		test('should not call update if there was no valid data to update', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();

			const update = {
				[generateRandomString()]: generateRandomString(),
			};

			await expect(Teamspace.updateAddOns(teamspace, update)).resolves.toBeUndefined();
			expect(fn).not.toHaveBeenCalled();
		});
	});
};

const testCreateTeamspaceSettings = () => {
	describe('Create teamspace settings', () => {
		test('should create teamspace settings', async () => {
			const teamspace = generateRandomString();
			const teamspaceId = generateRandomString();
			const expectedSettings = {
				_id: teamspace,
				refId: teamspaceId,
				topicTypes: DEFAULT_TOPIC_TYPES,
				riskCategories: DEFAULT_RISK_CATEGORIES,
				permissions: [],
			};

			const fn = jest.spyOn(db, 'insertOne').mockImplementation(() => {});
			await Teamspace.createTeamspaceSettings(teamspace, teamspaceId);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, 'teamspace', expectedSettings);
		});
	});
};

const testRemoveUserFromAdminPrivileges = () => {
	describe('Remove user from admin privileges', () => {
		test('Should trigger a query to remove user from admin permissions array', async () => {
			const teamspace = generateRandomString();
			const user = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.removeUserFromAdminPrivilege(teamspace, user)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $pull: { permissions: { user } } });
		});
	});
};

const testGetTeamspaceActiveLicenses = () => {
	describe('Get active licenses in teamspace', () => {
		test('Should perform a query to find all active subscriptions', async () => {
			const teamspace = generateRandomString();
			const dayMS = 1000 * 60 * 60 * 24;
			const validDate = new Date(new Date().getTime() + dayMS);
			const expectedRes = { subscription: {
				discretionary: { expiryDate: validDate },
				enterprise: { expiryDate: validDate },
			} };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedRes);
			await expect(Teamspace.getTeamspaceActiveLicenses(teamspace)).resolves.toEqual(expectedRes);
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});
};

const testGetTeamspaceExpiredLicenses = () => {
	describe('Get active licenses in teamspace', () => {
		test('Should perform a query to find all active subscriptions', async () => {
			const teamspace = generateRandomString();
			const dayMS = 1000 * 60 * 60 * 24;
			const validDate = new Date(new Date().getTime() + dayMS);
			const expectedRes = { subscription: {
				discretionary: { expiryDate: validDate },
				enterprise: { expiryDate: validDate },
			} };
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(expectedRes);
			await expect(Teamspace.getTeamspaceExpiredLicenses(teamspace)).resolves.toEqual(expectedRes);
			expect(fn).toHaveBeenCalledTimes(1);
		});
	});
};
const testGetRiskCategories = () => {
	describe('Get risk categories', () => {
		test('should return a list of risk categories', async () => {
			const teamspace = generateRandomString();
			const expectedRes = [generateRandomString(), generateRandomString()];
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ riskCategories: expectedRes });
			await expect(Teamspace.getRiskCategories(teamspace)).resolves.toEqual(expectedRes);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { riskCategories: 1 }, undefined);
		});
	});
};

const testGetSecurityRestrictions = () => {
	describe('Get Security Restrictions', () => {
		test('Should return empty object if there is no restriction', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({});
			await expect(Teamspace.getSecurityRestrictions(teamspace)).resolves.toEqual({});

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { [SECURITY]: 1 }, undefined);
		});

		test('Should return restrictions should it exist', async () => {
			const teamspace = generateRandomString();
			const domains = [generateRandomString()];
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(generateSecurityConfig(true, domains));
			await expect(Teamspace.getSecurityRestrictions(teamspace))
				.resolves.toEqual(generateSecurityConfig(true, domains)[SECURITY]);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { [SECURITY]: 1 }, undefined);
		});
	});
};

const testUpdateSecurityRestrictions = () => {
	describe('Update Security Resrictions', () => {
		test('Should do nothing if both parameters are set to undefined', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace)).resolves.toBeUndefined();

			expect(fn).not.toHaveBeenCalled();
		});

		test('Should unset the SSO property if it\'s disabled', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace, false)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $unset: { [`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: 1 } });
		});

		test('Should unset the whitelist property if it\'s disabled', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace, undefined, null)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $unset: { [`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`]: 1 } });
		});

		test('Should unset both properties if they are disabled', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace, false, null)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $unset: { [`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`]: 1, [`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: 1 } });
		});

		test('Should update the SSO property to true', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace, true)).resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $set: { [`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: true } });
		});

		test('Should update the whitelist domain property to the provided array', async () => {
			const teamspace = generateRandomString();
			const whiteList = times(10, generateRandomString());
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace, undefined, whiteList))
				.resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $set: { [`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`]: whiteList } });
		});

		test('Should be able to update both properties', async () => {
			const teamspace = generateRandomString();
			const whiteList = times(10, generateRandomString());
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace, true, whiteList))
				.resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, { $set: {
					[`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: true,
					[`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`]: whiteList },
				});
		});

		test('Should be able to update sso property whilst unset the whitelist', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			await expect(Teamspace.updateSecurityRestrictions(teamspace, true, null))
				.resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, {
					$set: { [`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: true },
					$unset: { [`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`]: 1 },
				},
			);
		});

		test('Should be able to update whitelist whilst unset sso restriction', async () => {
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			const whiteList = times(10, generateRandomString());
			await expect(Teamspace.updateSecurityRestrictions(teamspace, false, whiteList))
				.resolves.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL,
				{ _id: teamspace }, {
					$set: { [`${SECURITY}.${SECURITY_SETTINGS.DOMAIN_WHITELIST}`]: whiteList },
					$unset: { [`${SECURITY}.${SECURITY_SETTINGS.SSO_RESTRICTED}`]: 1 },
				},
			);
		});
	});
};

const testSetTeamspaceRefId = () => {
	describe('Set teamspace ref Id', () => {
		test('Should update the reference ID as instructed', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValueOnce();
			const refId = generateRandomString();
			const teamspace = generateRandomString();
			await Teamspace.setTeamspaceRefId(teamspace, refId);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace }, { $set: { refId } });
		});
	});
};

const testGetTeamspaceRefId = () => {
	describe('Get teamspace ref Id', () => {
		test('Should get the reference ID as instructed', async () => {
			const refId = generateRandomString();
			const teamspace = generateRandomString();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce({ refId });
			await expect(Teamspace.getTeamspaceRefId(teamspace)).resolves.toEqual(refId);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				{ refId: 1 }, undefined);
		});
	});
};

const testGetTeamspaceSetting = () => {
	describe('Get teamspace setting', () => {
		test('should return settings if found', async () => {
			const teamspace = generateRandomString();
			const res = generateRandomObject();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(res);
			await expect(Teamspace.getTeamspaceSetting(teamspace)).resolves.toEqual(res);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				{ refId: 0 }, undefined);
		});

		test('should return settings if found (with projection)', async () => {
			const teamspace = generateRandomString();
			const res = generateRandomObject();
			const projection = generateRandomObject();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(res);
			await expect(Teamspace.getTeamspaceSetting(teamspace, projection)).resolves.toEqual(res);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				projection, undefined);
		});

		test(`should throw with ${templates.teamspaceNotFound.code} if teamspace was not found`, async () => {
			const teamspace = generateRandomString();
			const projection = generateRandomObject();
			const fn = jest.spyOn(db, 'findOne').mockResolvedValueOnce(undefined);
			await expect(Teamspace.getTeamspaceSetting(teamspace, projection))
				.rejects.toEqual(templates.teamspaceNotFound);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(teamspace, TEAMSPACE_SETTINGS_COL, { _id: teamspace },
				projection, undefined);
		});
	});
};

const testGetTeamspaceInvites = () => {
	describe('Get a list of teamspace invitations', () => {
		test('Should return a list of emails', async () => {
			const ts = generateRandomString();
			const fn = jest.spyOn(db, 'find');
			await Teamspace.getTeamspaceInvites(ts);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(
				USERS_DB_NAME, 'invitations',
				{ 'teamSpaces.teamspace': ts },
				{ _id: 1 },
				undefined,
			);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testTeamspaceAdmins();
	testHasAccessToTeamspace();
	testGetSubscriptions();
	testEditSubscriptions();
	testRemoveSubscription();
	testRemoveAddOns();
	testGetAddOns();
	testIsAddOnModuleEnabled();
	testUpdateAddOns();
	testGetMembersInfo();
	testCreateTeamspaceSettings();
	testRemoveUserFromAdminPrivileges();
	testGetTeamspaceActiveLicenses();
	testGetTeamspaceExpiredLicenses();
	testGetRiskCategories();
	testGrantAdminPermissionToUser();
	testGetSecurityRestrictions();
	testUpdateSecurityRestrictions();
	testSetTeamspaceRefId();
	testGetTeamspaceRefId();
	testGetTeamspaceSetting();
	testGetTeamspaceInvites();
});
