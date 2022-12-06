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

const config = require('../../../../../src/v5/utils/config');
const { src } = require('../../../helper/path');

const Sso = require(`${src}/middleware/sso/pkce`);

const testAddPkceProtection = () => {
	describe('Add pkce protection', () => {
		test('should generate pkce codes and assign them to req', async () => {
			const mockCB = jest.fn();
			const req = { session: { cookie: {} } };
			await Sso.addPkceProtection(req, {}, mockCB);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(req.session.pkceCodes.challengeMethod).toEqual('S256');
			expect(req.session.pkceCodes).toHaveProperty('verifier');
			expect(req.session.pkceCodes).toHaveProperty('challenge');
			expect(req.session.cookie.domain).toEqual(config.cookie_domain);
		});
	});
};

describe('middleware/dataConverter/inputs/sso/pkce', () => {
	testAddPkceProtection();
});
