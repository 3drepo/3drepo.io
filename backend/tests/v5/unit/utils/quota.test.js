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

const config = require('../../../../src/v5/utils/config');
const { src } = require('../../helper/path');

const Quota = require(`${src}/utils/quota`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);
const { generateRandomString } = require('../../helper/services');

const testGetQuotaInfo = () => {
	const tsWithExpiredQuota = 'expiredQuota';
	const tsWithQuota = 'withQuota';
	const tsWithMultipleLicense = 'multiLicense';
	const tsWithMultipleLicense2 = 'multiLicense2';
	const tsWithSomeUsage = 'withUsage';

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
				expiryDate: Date.now() + 100000,
				collaborators: 2,
			},
		},
		[tsWithSomeUsage]: {
			enterprise: {
				data: 1,
				expiryDate: Date.now() + 100000,
				collaborators: 3,
			},
		},
		[tsWithMultipleLicense]: {
			enterprise: {
				data: 2,
				expiryDate: Date.now() + 100000,
				collaborators: 4,
			},
			discretionary: {
				data: 2,
				expiryDate: Date.now() + 100000,
				collaborators: 5,
			},
			paypal: {},
		},

		[tsWithMultipleLicense2]: {
			enterprise: {
				data: 2,
				expiryDate: Date.now() + 100000,
				collaborators: 'unlimited',
			},
			discretionary: {
				data: 2,
				expiryDate: Date.now() - 100000,
				collaborators: 7,
			},
		},

	};

	jest.spyOn(db, 'findOne').mockImplementation((ts, col, { user }) => {
		const subscriptions = subsByTeamspace[user];
		return Promise.resolve({ customData: { billing: { subscriptions } } });
	});

	describe.each([
		['Teamspace with expired quota', tsWithExpiredQuota, null, null, false, templates.licenceExpired],
		['Teamspace with only basic quota', 'teamspace', 1024 * 1024, 0, false],
		['Teamspace with only basic quota in megabytes', 'teamspace', 1, 0, true],
		['Teamspace with sufficient quota', tsWithQuota, 1024 * 1024 * 7, 2, false],
		['Teamspace with sufficient quota (multiple license)', tsWithMultipleLicense, 1024 * 1024 * 5, 9, false],
		['Teamspace with sufficient quota (multiple license v2)', tsWithMultipleLicense2, 1024 * 1024 * 3, 'unlimited', false],
		['Teamspace with sufficient quota (with existing usage)', tsWithSomeUsage, 1024 * 1024 * 2, 3, false],
	])('Return quota info', (desc, teamspace, size, collaboratorLimit, inMegabytes, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : 'should return quota info'}`, async () => {
			const quotaInfoProm = Quota.getQuotaInfo(teamspace, inMegabytes);
			if (error) {
				await expect(quotaInfoProm).rejects.toHaveProperty('code', error.code);
			} else {
				await expect(quotaInfoProm).resolves.toStrictEqual({ quota: size, collaboratorLimit });
			}
		});
	});

	describe('Return quota info', () => {
		test('Teamspace with only basic quota with no config collaborators should return quota info', async () => {
			const initialCollaborators = config.subscriptions.basic.collaborators;
			delete config.subscriptions.basic.collaborators;
			const res = await Quota.getQuotaInfo(tsWithQuota);
			expect(res).toEqual({ quota: 1024 * 1024 * 7, collaboratorLimit: 2 });
			config.subscriptions.basic.collaborators = initialCollaborators;
		});

		test('Teamspace with unlimited config collaborators should return quota info', async () => {
			const initialCollaborators = config.subscriptions.basic.collaborators;
			config.subscriptions.basic.collaborators = 'unlimited';
			const res = await Quota.getQuotaInfo(tsWithQuota);
			expect(res).toEqual({ quota: 1024 * 1024 * 7, collaboratorLimit: 'unlimited' });
			config.subscriptions.basic.collaborators = initialCollaborators;
		});
	});
};

const testCalculateSpaceUsed = () => {
	describe('Calculate the spaced used', () => {
		const teamspace = generateRandomString();
		const expectedSize = 1048576;

		const fn1 = jest.spyOn(db, 'listCollections').mockImplementation((ts) => Promise.resolve(ts === teamspace ? [
			{ name: 'a.issues.ref' },
			{ name: 'a.scene.stash' },
			{ name: 'ref' },
		] : []));
		const fn2 = jest.spyOn(db, 'aggregate').mockImplementation(() => Promise.resolve([{ _id: null, total: expectedSize }]));

		test('should return spaced used in bytes', async () => {
			const res = await Quota.calculateSpaceUsed(teamspace);
			expect(res).toEqual(expectedSize);
			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(1);
		});

		test('should return spaced used in megabytes', async () => {
			const res = await Quota.calculateSpaceUsed(teamspace, true);
			expect(res).toEqual(1);
			expect(fn1).toHaveBeenCalledTimes(1);
			expect(fn2).toHaveBeenCalledTimes(1);
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
			jest.spyOn(db, 'findOne').mockImplementationOnce(() => ({
				customData: { billing: { subscriptions: [{ data: 1, collaborators: 2 }] } },
			}));

			jest.spyOn(db, 'listCollections').mockImplementationOnce(() => Promise.resolve([
				{ name: 'a.issues.ref' },
				{ name: 'a.scene.stash' },
				{ name: 'ref' },
			]));
			jest.spyOn(db, 'aggregate').mockImplementationOnce(() => Promise.resolve([{ _id: null, total: 1048576 }]));

			const teamspace = generateRandomString();
			await expect(Quota.sufficientQuota(teamspace, 2000000)).rejects.toEqual(templates.quotaLimitExceeded);
		});

		test('should succeed if quota does not exceed the limit', async () => {
			jest.spyOn(db, 'findOne').mockImplementationOnce(() => ({
				customData: { billing: { subscriptions: [{ data: 1, collaborators: 2 }] } },
			}));

			jest.spyOn(db, 'listCollections').mockImplementationOnce(() => Promise.resolve([
				{ name: 'a.issues.ref' },
				{ name: 'a.scene.stash' },
				{ name: 'ref' },
			]));
			jest.spyOn(db, 'aggregate').mockImplementationOnce(() => Promise.resolve([{ _id: null, total: 1048576 }]));

			const teamspace = generateRandomString();
			await expect(Quota.sufficientQuota(teamspace, 1)).resolves.toBe(undefined);
		});
	});
};

describe('utils/quota', () => {
	testGetQuotaInfo();
	testCalculateSpaceUsed();
	testSufficientQuota();
});
