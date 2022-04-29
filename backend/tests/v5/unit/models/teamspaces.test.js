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

const { generateRandomString } = require('../../helper/services');

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
				customData: {
					billing: {
						subscriptions: {
							a: 1,
							b: 2,
						},
					},
				},
			};
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue(expectedData);

			const teamspace = 'someTS';
			const res = await Teamspace.getSubscriptions(teamspace);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ user: teamspace });
			expect(res).toEqual(expectedData.customData.billing.subscriptions);
		});

		test('should return empty object if the teamspace has no subs', async () => {
			const fn = jest.spyOn(db, 'findOne').mockResolvedValue({});

			const teamspace = 'someTS';
			const res = await Teamspace.getSubscriptions(teamspace);
			expect(fn.mock.calls.length).toBe(1);
			expect(fn.mock.calls[0][2]).toEqual({ user: teamspace });
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
	describe('Get teamspace subscriptions', () => {
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
			const subsObjPath = `customData.billing.subscriptions.${type}`;

			await expect(Teamspace.editSubscriptions(teamspace, type, update)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith('admin', 'system.users', { user: teamspace }, { $set: formatToMongoAction(update, subsObjPath) });
		});

		test('should only update fields that are recognised', async () => {
			const fn = jest.spyOn(db, 'updateOne').mockResolvedValue();

			const teamspace = generateRandomString();
			const type = generateRandomString();

			const update = {
				collaborators: 10,
				[generateRandomString()]: generateRandomString(),
			};
			const subsObjPath = `customData.billing.subscriptions.${type}`;

			await expect(Teamspace.editSubscriptions(teamspace, type, update)).resolves.toBeUndefined();
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith('admin', 'system.users', { user: teamspace }, { $set: formatToMongoAction({ collaborators: update.collaborators }, subsObjPath) });
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

describe('models/teamspaces', () => {
	testTeamspaceAdmins();
	testHasAccessToTeamspace();
	testGetSubscriptions();
	testEditSubscriptions();
	testGetMembersInfo();
});
