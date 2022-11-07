/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');

const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);
const Aad = require(`${src}/services/sso/aad`);

jest.mock('../../../../../../src/v5/utils/webRequests');
const WebRequests = require(`${src}/utils/webRequests`);

jest.mock('@azure/msal-node');
const msal = require('@azure/msal-node');
const { errorCodes } = require('../../../../../../src/v5/services/sso/sso.constants');

const { msGraphUserDetailsUri } = require(`${src}/services/sso/aad/aad.constants`);

const authCodeUrl = generateRandomString();
const accessToken = generateRandomString();

msal.ConfidentialClientApplication.mockImplementation((clientAppConfig) => ({
	getAuthCodeUrl: () => {
		clientAppConfig.system?.loggerOptions?.loggerCallback();
		return authCodeUrl;
	},
	acquireTokenByCode: () => ({ accessToken }),
}));

const testGetAuthenticationCodeUrl = () => {
	describe('Get authentication code url', () => {
		test(`should fail with ${templates.ssoNotAvailable.code} if sso is not set`, () => {
			const initialConfig = config.sso;
			config.sso = undefined;
			expect(Aad.getAuthenticationCodeUrl).toThrow(templates.ssoNotAvailable);
			config.sso = initialConfig;
		});

		test(`should fail with ${templates.ssoNotAvailable.code} if sso.aad is not set`, () => {
			const initialConfig = config.sso;
			config.sso = {};
			expect(Aad.getAuthenticationCodeUrl).toThrow(templates.ssoNotAvailable);
			config.sso = initialConfig;
		});

		test(`should fail with ${templates.ssoNotAvailable.code} if sso.aad.clientId is not set`, () => {
			const initialConfig = config.sso;
			config.sso = {
				aad: {
					authority: generateRandomString(),
					clientSecret: generateRandomString(),
				},
			};
			expect(Aad.getAuthenticationCodeUrl).toThrow(templates.ssoNotAvailable);
			config.sso = initialConfig;
		});

		test(`should fail with ${templates.ssoNotAvailable.code} if sso.aad.clientSecret is not set`, () => {
			const initialConfig = config.sso;
			config.sso = {
				aad: {
					authority: generateRandomString(),
					clientId: generateRandomString(),
				},
			};
			expect(Aad.getAuthenticationCodeUrl).toThrow(templates.ssoNotAvailable);
			config.sso = initialConfig;
		});

		test(`should fail with ${templates.ssoNotAvailable.code} if sso.aad.authority is not set`, () => {
			const initialConfig = config.sso;
			config.sso = {
				aad: {
					clientSecret: generateRandomString(),
					clientId: generateRandomString(),
				},
			};
			expect(Aad.getAuthenticationCodeUrl).toThrow(templates.ssoNotAvailable);
			config.sso = initialConfig;
		});

		test('should return authentication code url if all config values are set', async () => {
			const params = { redirectUri: generateRandomString() };
			const res = await Aad.getAuthenticationCodeUrl(params);

			expect(res).toEqual(authCodeUrl);
		});
	});
};

const testGetUserDetails = () => {
	describe('Get user details', () => {
		test('should get user details', async () => {
			const initialConfig = config.sso;
			config.sso = {
				aad: {
					clientId: generateRandomString(),
					clientSecret: generateRandomString(),
				},
			};

			const userDetails = { mail: generateRandomString() };
			const fn = jest.spyOn(WebRequests, 'get').mockResolvedValueOnce(userDetails);

			const res = await Aad.getUserDetails(generateRandomString(),
				generateRandomString(), generateRandomString());
			expect(res).toEqual(userDetails);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledWith(msGraphUserDetailsUri, { Authorization: `Bearer ${accessToken}` });

			config.sso = initialConfig;
		});

		test(`should throw ${errorCodes.failedToFetchDetails} if it fails to fetch user details`, async () => {
			const initialConfig = config.sso;
			config.sso = {
				aad: {
					clientId: generateRandomString(),
					clientSecret: generateRandomString(),
				},
			};
			jest.spyOn(WebRequests, 'get').mockRejectedValueOnce(new Error());
			await expect(Aad.getUserDetails(generateRandomString(),
				generateRandomString(), generateRandomString())).rejects.toEqual(errorCodes.failedToFetchDetails);

			config.sso = initialConfig;
		});
	});
};

describe('services/sso/aad', () => {
	testGetAuthenticationCodeUrl();
	testGetUserDetails();
});
