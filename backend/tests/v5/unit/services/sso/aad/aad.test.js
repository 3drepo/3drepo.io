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

const { src, modelFolder, objModel } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
var url = require('url');
jest.mock('../../../../../../src/v5/handler/queue');
const Queue = require(`${src}/handler/queue`);

const config = require(`${src}/utils/config`);

const { templates } = require(`${src}/utils/responseCodes`);

const Aad = require(`${src}/services/sso/aad`);

const testGetAuthenticationCodeUrl = () => {
    describe('Get authentication code url', () => {
        //  test(`should fail with ${templates.ssoNotAvailable.code} if sso is not set`, async () => {
        //      const initialConfig = config.sso;
        //      config.sso = undefined;

        //      const params = { redirectUri: generateRandomString() };
        //      await expect(Aad.getAuthenticationCodeUrl(params))
        // 		.rejects.toEqual(templates.ssoNotAvailable);

        //      config.sso = initialConfig;
        //  }); 

        //  test(`should fail with ${templates.ssoNotAvailable.code} if sso.aad is not set`, async () => {
        //     const initialConfig = config.sso;
        //     config.sso = {};

        //     const params = { redirectUri: generateRandomString() };
        //     await expect(Aad.getAuthenticationCodeUrl(params))
        //        .rejects.toEqual(templates.ssoNotAvailable);

        //     config.sso = initialConfig;
        // }); 

        // test(`should fail with ${templates.ssoNotAvailable.code} if sso.aad.clientId is not set`, async () => {
        //     const initialConfig = config.sso;
        //     config.sso = { clientSecret: generateRandomString()};

        //     const params = { redirectUri: generateRandomString() };
        //     await expect(Aad.getAuthenticationCodeUrl(params))
        //        .rejects.toEqual(templates.ssoNotAvailable);

        //     config.sso = initialConfig;
        // }); 

        // test(`should fail with ${templates.ssoNotAvailable.code} if sso.aad.clientSecret is not set`, async () => {
        //     const initialConfig = config.sso;
        //     config.sso = { clientId: generateRandomString() };

        //     const params = { redirectUri: generateRandomString() };
        //     await expect(Aad.getAuthenticationCodeUrl(params))
        //        .rejects.toEqual(templates.ssoNotAvailable);

        //     config.sso = initialConfig;
        // }); 

        test(`should return authentication code url if all config values are set`, async () => {
            const initialConfig = config.sso;
            config.sso = {
                aad: {
                    clientId: generateRandomString(),
                    clientSecret: generateRandomString()
                }
            }

            const params = { redirectUri: generateRandomString() };
            const res = await Aad.getAuthenticationCodeUrl(params);
            const parsedUrl = url.parse(res, true);
            expect(parsedUrl.query.redirect_uri).toEqual(params.redirectUri);
            config.sso = initialConfig;
        });
    });
};

const testGetUserDetails = () => {
    describe('Get user details', () => {
        test(`should get user details`, async () => {
            const initialConfig = config.sso;
            config.sso = {
                aad: {
                    clientId: generateRandomString(),
                    clientSecret: generateRandomString()
                }
            }

            const authCode = generateRandomString();
            const redirectUri = generateRandomString();
            const codeVerifier = generateRandomString();

            const res = await Aad.getUserDetails(authCode, redirectUri, codeVerifier);
            expect(res).toEqual(1);
            config.sso = initialConfig;
        });
    });
};


describe('services/sso/aad', () => {
    testGetAuthenticationCodeUrl();
    testGetUserDetails();
});
