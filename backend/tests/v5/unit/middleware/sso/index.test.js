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

const { src } = require('../../../helper/path');
const { determineTestGroup, generateRandomString, generateRandomURL } = require('../../../helper/services');

// This prevents the session service from triggering a mongo service.
jest.mock('../../../../../src/v5/handler/db');

jest.mock('../../../../../src/v5/middleware/sessions');
const SessionsMiddleware = require(`${src}/middleware/sessions`);

const SSO = require(`${src}/middleware/sso`);

const testRedirectWithError = () => {
	describe('Redirect with error', () => {
		test('Should call redirect with the url expected', () => {
			const res = {
				redirect: jest.fn(),
			};
			const url = generateRandomURL();
			const errorCode = generateRandomString();

			SSO.redirectWithError(res, url, errorCode);
			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(`${url}?error=${errorCode}`);
		});
	});
};

const testSetSessionInfo = () => {
	describe('Set session info', () => {
		SessionsMiddleware.appendCSRFToken.mockImplementation((req, res, next) => next());
		test('Should record some information around the request in the session', async () => {
			const userAgent = generateRandomString();
			const domain = 'https://www.abc.com';
			const referer = `${domain}/${generateRandomString}/${generateRandomString}`;
			const req = {
				token: generateRandomString(),
				session: {},
				headers: {
					'user-agent': userAgent,
					referer,
				},
			};
			const res = {};
			const next = jest.fn();

			await SSO.setSessionInfo(req, res, next);

			const ssoInfo = {
				userAgent,
				referer: domain,
			};

			expect(req.session).toEqual({
				token: req.token,
				ssoInfo,
			});

			expect(SessionsMiddleware.appendCSRFToken).toHaveBeenCalledTimes(1);
		});

		test('Should omit the referrer if it doesn`t exist', async () => {
			const userAgent = generateRandomString();
			const req = {
				token: generateRandomString(),
				session: {},
				headers: {
					'user-agent': userAgent,
				},
			};
			const res = {};
			const next = jest.fn();

			await SSO.setSessionInfo(req, res, next);

			const ssoInfo = {
				userAgent,
			};

			expect(req.session).toEqual({
				token: req.token,
				ssoInfo,
			});

			expect(SessionsMiddleware.appendCSRFToken).toHaveBeenCalledTimes(1);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testRedirectWithError();
	testSetSessionInfo();
});
