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

const SubscriptionSchema = require(`${src}/schemas/subscriptions`);
const { SUBSCRIPTION_TYPES } = require(`${src}/models/teamspaces.constants`);

const formatData = (data) => {
	const res = { ...data };

	if (data.expiryDate) {
		res.expiryDate = new Date(data.expiryDate);
	}
	if (data.collaborators) {
		const num = parseInt(data.collaborators, 10);

		res.collaborators = Number.isNaN(num) ? data.collaborators : num;
	}
	return res;
};

const testSubscriptionSchema = () => {
	const dummyData = {
		collaborators: 1,
		data: 10,
		expiryDate: new Date(Date.now() + 1000),
	};
	describe.each([
		['correct full data', 'enterprise', dummyData, true],
		['undefined data', 'enterprise', undefined, false],
		['empty data', 'enterprise', {}, false],
		['unknown values', 'enterprise', { [generateRandomString()]: generateRandomString() }, false],
		['unrecognised sub type', generateRandomString(), dummyData, false],
		['only collaborators', 'enterprise', { collaborators: 1 }, true],
		['unlimited collaborators', 'enterprise', { collaborators: 'unlimited' }, true],
		['negative collaborators', 'enterprise', { collaborators: -1 }, false],
		['random string as collaborators', 'enterprise', { collaborators: generateRandomString() }, false],
		['numer string as collaborators', 'enterprise', { collaborators: '100' }, true],
		['only data', 'enterprise', { data: 1 }, true],
		['negative data', 'enterprise', { data: -1 }, false],
		['just expiryDate', 'enterprise', { expiryDate: new Date(Date.now() + 1000) }, true],
		['expiryDate in timestamp', 'enterprise', { expiryDate: Date.now() + 1000 }, true],
		['null date', 'enterprise', { expiryDate: null }, true],
		['expiryDate in the past', 'enterprise', { expiryDate: Date.now() - 1000 }, false],
	])('Subscription schema test', (desc, type, data, pass) => {
		test(`Subscription with ${desc} should ${pass ? 'pass' : 'fail'}`, async () => {
			if (pass) {
				await expect(SubscriptionSchema.validateSchema(type, data)).resolves.toEqual(formatData(data));
			} else {
				await expect(() => SubscriptionSchema.validateSchema(type, data)).rejects.toThrow();
			}
		});
	});
};

const testIsValidType = () => {
	describe.each([
		...Object.values(SUBSCRIPTION_TYPES).map((type) => [type, true]),
		[generateRandomString(), false],
		[undefined, false],
		[null, false],
	])('Checking if a license type is valid', (type, valid) => {
		test(`License type ${type} should return ${valid}`, () => {
			expect(SubscriptionSchema.isValidType(type)).toBe(valid);
		});
	});
};

describe('schema/subscriptions', () => {
	testSubscriptionSchema();
	testIsValidType();
});
