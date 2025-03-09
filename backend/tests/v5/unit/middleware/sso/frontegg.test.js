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
const { determineTestGroup, generateRandomString } = require('../../../helper/services');

// This prevents the session service from trigger a mongo service.
jest.mock('../../../../../src/v5/handler/db');
jest.mock('../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
const { templates } = require(`${src}/utils/responseCodes`);

const Frontegg = require(`${src}/middleware/sso/frontegg`);

const testRedirectToStateURL = () => {
	describe('Redirect to state URL', () => {
		test('should call redirect on the response to the url within the state', async () => {
			const redirectUri = generateRandomString();

			const req = { state: { redirectUri } };
			const res = { redirect: jest.fn() };

			await Frontegg.redirectToStateURL(req, res);

			expect(res.redirect).toHaveBeenCalledTimes(1);
			expect(res.redirect).toHaveBeenCalledWith(redirectUri);

			expect(Responder.respond).not.toHaveBeenCalled();
		});
		test('should respond with unknown error if unexpected error has occured', async () => {
			const res = { redirect: jest.fn() };

			await Frontegg.redirectToStateURL(undefined, res);

			expect(res.redirect).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(undefined, res, templates.unknown);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testRedirectToStateURL();
});
