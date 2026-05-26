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

const { cloneDeep } = require('lodash');
const { src } = require('../../../../../helper/path');

const { determineTestGroup, generateRandomString } = require('../../../../../helper/services');

jest.mock('../../../../../../../src/v5/utils/webRequests');
const WebRequests = require(`${src}/utils/webRequests`);

jest.mock('@frontegg/client');

const Config = require(`${src}/utils/config`);

const Connections = require(`${src}/services/sso/frontegg/components/connections`);

const testGetConfig = () => {
	describe('Get config', () => {
		const origConfigSSO = cloneDeep(Config.sso);
		const origEnvar = cloneDeep(process.env);
		beforeEach(() => {
			Connections.reset();
		});
		afterEach(() => {
			Config.sso = origConfigSSO;
			process.env = origEnvar;
		});
		test('Should fail if config validation failed', async () => {
			Config.sso = { frontegg: {} };
			await expect(Connections.getConfig()).rejects.not.toBeUndefined();
		});
		test('Should succeed and return the config', async () => {
			const token = generateRandomString();
			WebRequests.post.mockResolvedValue({ data: { token } });
			await expect(Connections.getConfig()).resolves.toEqual(Config.sso.frontegg);

			expect(Connections.getIdentityClient()).not.toBeUndefined();
			expect(Connections.getBasicHeader()).not.toBeUndefined();
			expect(Connections.getBearerHeader()).not.toBeUndefined();
		});

		test('Should fail if we failed to generate vendor token', async () => {
			WebRequests.post.mockRejectedValueOnce({ message: generateRandomString() });
			await expect(Connections.getConfig()).rejects.not.toBeUndefined();
		});
	});
};

const testGetBearerToken = () => {
	describe('Get bearer token', () => {
		beforeEach(() => {
			Connections.reset();
		});

		const generateHeader = (token) => ({
			Authorization: `Bearer ${token}`,
		});

		test('Should reuse the existing token if it is still active', async () => {
			const token = generateRandomString();
			WebRequests.post.mockResolvedValue({ data: { token, expiresIn: 6000000 } });

			await expect(Connections.getBearerHeader()).resolves.toEqual(generateHeader(token));

			// one time for init, 2nd time it should reuse the token
			expect(WebRequests.post).toHaveBeenCalledTimes(1);
		});

		test('Should call for another token if it has expired ', async () => {
			const token = generateRandomString();
			WebRequests.post.mockResolvedValue({ data: { token, expiresIn: 1 } });

			await expect(Connections.getBearerHeader()).resolves.toEqual(generateHeader(token));

			// one time for init, 2nd time should trigger a fetch
			expect(WebRequests.post).toHaveBeenCalledTimes(2);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testGetConfig();
	testGetBearerToken();
});
