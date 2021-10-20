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

const Quota = require(`${src}/utils/quota`);
const db = require(`${src}/handler/db`);
const { templates } = require(`${src}/utils/responseCodes`);

const testSufficientQuota = () => {
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
			},
		},
		[tsWithQuota]: {
			enterprise: {
				data: 6, // 6MB
				expiryDate: Date.now() + 100000,
			},
		},
		[tsWithSomeUsage]: {
			enterprise: {
				data: 1,
				expiryDate: Date.now() + 100000,
			},
		},
		[tsWithMultipleLicense]: {
			enterprise: {
				data: 2,
				expiryDate: Date.now() + 100000,
			},
			discretionary: {
				data: 2,
				expiryDate: Date.now() + 100000,
			},
			paypal: {},
		},

		[tsWithMultipleLicense2]: {
			enterprise: {
				data: 2,
				expiryDate: Date.now() + 100000,
			},
			discretionary: {
				data: 2,
				expiryDate: Date.now() - 100000,
			},
		},

	};

	jest.spyOn(db, 'findOne').mockImplementation((ts, col, { user }) => {
		const subscriptions = subsByTeamspace[user];
		return Promise.resolve({ customData: { billing: { subscriptions } } });
	});

	jest.spyOn(db, 'listCollections').mockImplementation((ts) => Promise.resolve(ts === tsWithSomeUsage ? [
		{ name: 'a.issues.ref' },
		{ name: 'a.scene.stash' },
		{ name: 'ref' },
	] : []));
	jest.spyOn(db, 'aggregate').mockImplementation(() => Promise.resolve([{ _id: null, total: 1024 * 1024 }]));

	describe.each([
		['Size bigger than upload size limit', 'teamspace', 8388609, templates.maxSizeExceeded],
		['Teamspace with expired quota', tsWithExpiredQuota, 10, templates.licenceExpired],
		['Teamspace with only basic quota', 'teamspace', 1],
		['Teamspace with sufficient quota', tsWithQuota, 1024 * 1024 * 7],
		['Teamspace without sufficient quota', tsWithQuota, 1024 * 1024 * 7 + 1, templates.quotaLimitExceeded],
		['Teamspace with sufficient quota (multiple license)', tsWithMultipleLicense, 1024 * 1024 * 5],
		['Teamspace with insufficient quota (multiple license)', tsWithMultipleLicense, 1024 * 1024 * 5 + 1, templates.quotaLimitExceeded],
		['Teamspace with sufficient quota (multiple license v2)', tsWithMultipleLicense2, 1024 * 1024 * 3],
		['Teamspace with insufficient quota (multiple license v2)', tsWithMultipleLicense2, 1024 * 1024 * 3 + 1, templates.quotaLimitExceeded],
		['Teamspace with sufficient quota (with existing usage)', tsWithSomeUsage, 1024 * 1024],
		['Teamspace with insufficient quota (with existing usage)', tsWithSomeUsage, 1024 * 1024 + 1, templates.quotaLimitExceeded],
	])('Check sufficient quota', (desc, teamspace, size, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : 'should succeed'}`, async () => {
			const sufficientQuotaProm = Quota.sufficientQuota(teamspace, size);
			if (error) {
				await expect(sufficientQuotaProm).rejects.toHaveProperty('code', error.code);
			} else {
				await expect(sufficientQuotaProm).resolves.toBe(undefined);
			}
		});
	});
};

describe('utils/quota', () => {
	testSufficientQuota();
});
