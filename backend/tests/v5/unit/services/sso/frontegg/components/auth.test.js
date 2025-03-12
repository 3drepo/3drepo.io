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

const { src } = require('../../../../../helper/path');

const { determineTestGroup, generateRandomString } = require('../../../../../helper/services');

jest.mock('../../../../../../../src/v5/services/sso/frontegg/components/connections');
const Connections = require(`${src}/services/sso/frontegg/components/connections`);

jest.mock('../../../../../../../src/v5/utils/webRequests');
const WebRequests = require(`${src}/utils/webRequests`);

const Auth = require(`${src}/services/sso/frontegg/components/auth`);

const basicHeader = { [generateRandomString()]: generateRandomString() };
const postOptions = { headers: basicHeader };

Connections.getBasicHeader.mockResolvedValue(basicHeader);
Connections.getConfig.mockResolvedValue({});

const testGetUserInfoFromToken = () => {
	describe('Get user info from token', () => {
		test('Should retrieve data base on the token', async () => {
			const token = generateRandomString();
			const fn = jest.fn();

			const expectedInfo = {
				sub: generateRandomString(),
				email: generateRandomString(),
				tenantId: generateRandomString(),
				tenantIds: generateRandomString(),
			};

			fn.mockResolvedValueOnce(expectedInfo);

			Connections.getIdentityClient.mockResolvedValueOnce({
				validateIdentityOnToken: fn,
			});

			await expect(Auth.getUserInfoFromToken(token)).resolves.toEqual({
				userId: expectedInfo.sub,
				email: expectedInfo.email,
				authAccount: expectedInfo.tenantId,
				accounts: expectedInfo.tenantIds,
			});

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(token);
		});

		test('Should throw error if the function failed', async () => {
			const token = generateRandomString();
			const fn = jest.fn();

			fn.mockRejectedValueOnce({ message: generateRandomString() });

			Connections.getIdentityClient.mockResolvedValueOnce({
				validateIdentityOnToken: fn,
			});

			await expect(Auth.getUserInfoFromToken(token)).rejects.not.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(token);
		});
	});
};

const testValidateToken = () => {
	describe('Validate token', () => {
		test('Should validate the token against the expected userId', async () => {
			const token = generateRandomString();
			const userId = generateRandomString();
			const fn = jest.fn();

			const expectedInfo = {
				sub: userId,
			};

			fn.mockResolvedValueOnce(expectedInfo);

			Connections.getIdentityClient.mockResolvedValueOnce({
				validateToken: fn,
			});

			await Auth.validateToken({ token }, userId);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(token);
		});

		test('Should throw error if the user ID mismatched', async () => {
			const token = generateRandomString();
			const userId = generateRandomString();
			const fn = jest.fn();

			const expectedInfo = {
				sub: generateRandomString(),
			};

			fn.mockResolvedValueOnce(expectedInfo);

			Connections.getIdentityClient.mockResolvedValueOnce({
				validateToken: fn,
			});

			await expect(Auth.validateToken({ token }, userId)).rejects.not.toBeUndefined();

			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(token);
		});
	});
};

const testGenerateAuthenticationCodeUrl = () => {
	describe('Generate authentication code url', () => {
		test('Should generate a url base on the information', async () => {
			const accountId = generateRandomString();
			const state = generateRandomString();
			const redirectURL = generateRandomString();
			const codeChallenge = generateRandomString();
			const appUrl = generateRandomString();

			Connections.getConfig.mockResolvedValueOnce({
				appUrl,
			});

			const expectedUrl = `${appUrl}/oauth/authorize?response_type=code&scope=openId&state=${state}&redirect_uri=${redirectURL}&code_challenge=${codeChallenge}&tenantId=${accountId}`;

			await expect(Auth.generateAuthenticationCodeUrl({ state, redirectURL, codeChallenge }, accountId))
				.resolves.toEqual(expectedUrl);
		});

		test('Should omit fields if they are missing', async () => {
			const state = generateRandomString();
			const redirectURL = generateRandomString();
			const appUrl = generateRandomString();

			Connections.getConfig.mockResolvedValueOnce({
				appUrl,
			});

			const expectedUrl = `${appUrl}/oauth/authorize?response_type=code&scope=openId&state=${state}&redirect_uri=${redirectURL}`;

			await expect(Auth.generateAuthenticationCodeUrl({ state, redirectURL }))
				.resolves.toEqual(expectedUrl);
		});
	});
};

const testGenerateToken = () => {
	describe('Generate token', () => {
		test('Should return the generated token', async () => {
			const urlUsed = generateRandomString();
			const code = generateRandomString();
			const challenge = generateRandomString();

			const data = {
				access_token: generateRandomString(),
				refresh_token: generateRandomString(),
				expires_in: 100000,
			};

			WebRequests.post.mockResolvedValueOnce({ data });

			const expectedToken = {
				token: data.access_token,
				refreshToken: data.refresh_token,
				expiry: expect.any(Date),
			};

			const expectedExpiry = new Date(Date.now() + data.expires_in * 1000);

			const response = await Auth.generateToken(urlUsed, code, challenge);
			expect(response).toEqual(expectedToken);

			// the expected expiry might be off by a split second.
			expect(Math.abs(expectedExpiry.getTime() - response.expiry.getTime()) < 100).toBeTruthy();

			const expectedPayload = {
				grant_type: 'authorization_code',
				code,
				redirect_uri: urlUsed,
				code_challenge: challenge,
			};

			expect(WebRequests.post).toHaveBeenCalledTimes(1);
			expect(WebRequests.post).toHaveBeenCalledWith(expect.any(String), expectedPayload, postOptions);
		});
	});
};
describe(determineTestGroup(__filename), () => {
	testGetUserInfoFromToken();
	testValidateToken();
	testGenerateAuthenticationCodeUrl();
	testGenerateToken();
});
