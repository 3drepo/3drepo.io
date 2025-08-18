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

const config = require(`${src}/utils/config`);
const Quota = require(`${src}/utils/quota`);

jest.mock('../../../../src/v5/handler/db');
const DBHandler = require(`${src}/handler/db`);

jest.mock('../../../../src/v5/processors/teamspaces');
const TeamspaceProcessor = require(`${src}/processors/teamspaces`);

const { templates } = require(`${src}/utils/responseCodes`);
const { generateRandomString } = require('../../helper/services');

const testGetQuotaInfo = () => {
	const tsWithExpiredQuota = 'expiredQuota';
	const tsWithQuota = 'withQuota';
	const tsWithMultipleLicense = 'multiLicense';
	const tsWithMultipleLicense2 = 'multiLicense2';
	const tsWithSomeUsage = 'withUsage';
	const tsWithFreeQuota = 'freeQuota';
	const tsWithNoCollabs = 'tsWithNoCollabs';
	const tsWithNoData = 'tsWithNoData';

	const validExpiryDate = Date.now() + 100000;
	const subsByTeamspace = {
		[tsWithExpiredQuota]: {
			enterprise: {
				data: 10, // 10MB
				expiryDate: Date.now() - 10,
				collaborators: 1,
			},
		},

		[tsWithQuota]: {
			enterprise: {
				data: 6, // 6MB
				expiryDate: validExpiryDate,
				collaborators: 2,
			},
		},
		[tsWithSomeUsage]: {
			enterprise: {
				data: 1,
				expiryDate: validExpiryDate,
				collaborators: 3,
			},
		},
		[tsWithMultipleLicense]: {
			enterprise: {
				data: 2,
				expiryDate: validExpiryDate - 10,
				collaborators: 4,
			},
			discretionary: {
				data: 2,
				expiryDate: validExpiryDate,
				collaborators: 5,
			},
			paypal: {},
		},

		[tsWithMultipleLicense2]: {
			enterprise: {
				data: 2,
				expiryDate: validExpiryDate,
				collaborators: 'unlimited',
			},
			discretionary: {
				data: 2,
				expiryDate: Date.now() - 100000,
				collaborators: 7,
			},
		},

		[tsWithFreeQuota]: {},

		[tsWithNoCollabs]: {
			enterprise: {
				data: 1,
				expiryDate: validExpiryDate,
			},
		},

		[tsWithNoData]: {
			enterprise: {
				collaborators: 1,
				expiryDate: validExpiryDate,
			},
		},
	};

	DBHandler.findOne.mockImplementation((ts, col, { _id }) => {
		const subscriptions = subsByTeamspace[_id];
		return Promise.resolve({ subscriptions });
	});

	describe.each([
		['Teamspace with expired quota', tsWithExpiredQuota, null, null, null, false, templates.licenceExpired],
		['Teamspace with only basic quota', 'teamspace', 1024 * 1024, 0, null, true],
		['Teamspace with sufficient quota', tsWithQuota, 1024 * 1024 * 7, 2, validExpiryDate, false],
		['Teamspace with sufficient quota (multiple license)', tsWithMultipleLicense, 1024 * 1024 * 5, 9, validExpiryDate - 10, false],
		['Teamspace with sufficient quota (multiple license v2)', tsWithMultipleLicense2, 1024 * 1024 * 3, 'unlimited', validExpiryDate, false],
		['Teamspace with sufficient quota (with existing usage)', tsWithSomeUsage, 1024 * 1024 * 2, 3, validExpiryDate, false],
		['Teamspace with no collaborators (with existing usage)', tsWithNoCollabs, 1024 * 1024 * 2, config.subscriptions.basic.collaborators, validExpiryDate, false],
		['Teamspace with no data (with existing usage)', tsWithNoData, 1024 * 1024 * config.subscriptions.basic.data, config.subscriptions.basic.collaborators + 1, validExpiryDate, false],
	])('Return quota info', (desc, teamspace, size, collaborators, expiryDate, freeTier, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : 'should return quota info'}`, async () => {
			const quotaInfoProm = Quota.getQuotaInfo(teamspace);
			if (error) {
				await expect(quotaInfoProm).rejects.toHaveProperty('code', error.code);
			} else {
				await expect(quotaInfoProm).resolves.toStrictEqual({
					data: size,
					collaborators,
					expiryDate,
					freeTier,
				});
			}
		});
	});

	describe('Return quota info', () => {
		test('Teamspace with only basic quota with no config collaborators should return quota info', async () => {
			const initialCollaborators = config.subscriptions.basic.collaborators;
			delete config.subscriptions.basic.collaborators;
			const res = await Quota.getQuotaInfo(tsWithQuota);
			expect(res).toEqual({ data: 1024 * 1024 * 7,
				collaborators: 2,
				freeTier: false,
				expiryDate: validExpiryDate });
			config.subscriptions.basic.collaborators = initialCollaborators;
		});

		test('Teamspace with unlimited config collaborators should return quota info', async () => {
			const initialCollaborators = config.subscriptions.basic.collaborators;
			config.subscriptions.basic.collaborators = 'unlimited';
			const res = await Quota.getQuotaInfo(tsWithQuota);
			expect(res).toEqual({ data: 1024 * 1024 * 7, collaborators: 'unlimited', freeTier: false, expiryDate: validExpiryDate });
			config.subscriptions.basic.collaborators = initialCollaborators;
		});

		test('Teamspace with no config data should return quota info', async () => {
			const initialData = config.subscriptions.basic.data;
			delete config.subscriptions.basic.data;
			const res = await Quota.getQuotaInfo(tsWithQuota);
			expect(res).toEqual({ data: 1024 * 1024 * 6,
				collaborators: 2,
				freeTier: false,
				expiryDate: validExpiryDate });
			config.subscriptions.basic.data = initialData;
		});
	});
};

const testGetSpaceUsed = () => {
	describe('Calculate the spaced used', () => {
		test('should return spaced used in bytes', async () => {
			const teamspace = generateRandomString();
			const expectedSize = 1048576;

			DBHandler.aggregate.mockResolvedValueOnce([{ _id: null, total: expectedSize }]);
			DBHandler.listCollections.mockResolvedValueOnce([
				{ name: 'a.issues.ref' },
				{ name: 'a.scene.stash' },
				{ name: 'ref' },
			]);
			const res = await Quota.getSpaceUsed(teamspace);
			expect(res).toEqual(expectedSize);
			expect(DBHandler.listCollections).toHaveBeenCalledTimes(1);
			expect(DBHandler.listCollections).toHaveBeenCalledWith(teamspace);
			expect(DBHandler.aggregate).toHaveBeenCalledTimes(1);
		});
	});
};

const testSufficientQuota = () => {
	describe('Check sufficient quota', () => {
		test('should return error if size is greater than uploadSizeLimit', async () => {
			const { uploadSizeLimit } = config;
			config.uploadSizeLimit = 0;
			const teamspace = generateRandomString();
			await expect(Quota.sufficientQuota(teamspace, 100)).rejects.toEqual({ ...templates.maxSizeExceeded, message: 'File cannot be bigger than 0 bytes.' });
			config.uploadSizeLimit = uploadSizeLimit;
		});

		test('should return error if quota exceeds the limit', async () => {
			DBHandler.findOne.mockResolvedValueOnce({ subscriptions: { enterprise: { data: 1, collaborators: 2 } } });

			DBHandler.listCollections.mockResolvedValueOnce([
				{ name: 'a.issues.ref' },
				{ name: 'a.scene.stash' },
				{ name: 'ref' },
			]);
			DBHandler.aggregate.mockResolvedValueOnce([{ _id: null, total: 1048576 }]);

			const teamspace = generateRandomString();
			await expect(Quota.sufficientQuota(teamspace, 2000000)).rejects.toEqual(templates.quotaLimitExceeded);
		});

		test('should succeed if quota does not exceed the limit', async () => {
			DBHandler.findOne.mockResolvedValueOnce({ subscriptions: [{ data: 1, collaborators: 2 }] });

			DBHandler.listCollections.mockResolvedValueOnce([
				{ name: 'a.issues.ref' },
				{ name: 'a.scene.stash' },
				{ name: 'ref' },
			]);
			DBHandler.aggregate.mockResolvedValueOnce([{ _id: null, total: 1048576 }]);

			const teamspace = generateRandomString();
			await expect(Quota.sufficientQuota(teamspace, 1)).resolves.toBe(undefined);
		});
	});
};

const testGetCollaboratorsAssigned = () => {
	describe('Get collaborators used', () => {
		test('should get the total collaborators used by the user', async () => {
			DBHandler.find.mockResolvedValueOnce([]);

			TeamspaceProcessor.getAllMembersInTeamspace.mockResolvedValueOnce([
				generateRandomString(),
				generateRandomString(),
			]);

			const teamspace = generateRandomString();
			const res = await Quota.getCollaboratorsAssigned(teamspace);
			expect(res).toEqual(2);

			expect(DBHandler.find).toHaveBeenCalledTimes(1);
		});
	});
};

describe('utils/quota', () => {
	testGetQuotaInfo();
	testGetSpaceUsed();
	testSufficientQuota();
	testGetCollaboratorsAssigned();
});
