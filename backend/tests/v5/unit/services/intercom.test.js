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
const config = require('../../../../src/v5/utils/config');

const Intercom = require(`${src}/services/intercom`);

const testGenerateUserHash = () => {
	describe('Generate user hash', () => {
		test('Should return a hash if intercom is configured', () => {
			config.intercom = { secretKey: generateRandomString() };
			expect(Intercom.generateUserHash(generateRandomString())).not.toBeUndefined();
			delete config.intercom;
		});

		test('Should return undefined if intercom is not configured', () => {
			expect(Intercom.generateUserHash(generateRandomString())).toBeUndefined();
		});
	});
};

describe('services/filesManager', () => {
	testGenerateUserHash();
});
