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

const ResponseCodes = require(`${src}/utils/responseCodes`);

const testCreateResponseCodes = () => {
	const msg = 'Some random message';
	describe.each([
		[ResponseCodes.template.ok, undefined, ResponseCodes.template.ok],
		[ResponseCodes.template.ok, msg, { ...ResponseCodes.template.ok, message: msg }],
		[undefined, undefined, ResponseCodes.template.unknown],
		[undefined, msg, { ...ResponseCodes.template.unknown, message: msg }],
	])('Create response codes', (errCode, message, result) => {
		test(`with ${JSON.stringify(errCode)} and ${message} should result in ${JSON.stringify(result)} `, () => {
			expect(ResponseCodes.createResponseCode(errCode, message)).toEqual(result);
		});
	});
};

const testCodeExists = () => {
	describe.each([
		['OK', true],
		['UNKNOWN', true],
		['userNotFound', true],
		['', false],
		['bnlah', false],
		[undefined, false],
	])('Check code exists', (code, exists) => {
		test(`${code} should ${exists ? '' : 'not'} exists`, () => {
			expect(ResponseCodes.codeExists(code)).toBe(exists);
		});
	});
};

describe('Response Codes', () => {
	testCreateResponseCodes();
	testCodeExists();
});
