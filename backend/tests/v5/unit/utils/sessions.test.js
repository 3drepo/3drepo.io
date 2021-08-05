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

const { v4Path } = require(`${src}/../interop`);

const SessionUtils = require(`${src}/utils/sessions`);
const apiUrls = require(`${v4Path}/config`).apiUrls.all;

const testIsSessionValid = () => {
	describe.each([
		[{ user: { referer: 'http://abc.com' } }, 'http://abc.com', true],
		[{ user: { referer: 'http://abc.com' } }, 'http://abc.com/xyz', true],
		[{ user: { referer: 'http://abc.com' } }, 'http://xyz.com', false],
		[{ user: { referer: 'http://abc.com' } }, undefined, true],
		[{ user: { referer: 'http://abc.com' } }, apiUrls[0], true],
		[{ user: {} }, 'https://abc.com', false],
		[{ user: { isAPIKey: true } }, 'https://abc.com', true],
		[{ user: { isAPIKey: true } }, undefined, true],
		[undefined, undefined, false],
		[{}, undefined, false],
		[{ user: {} }, undefined, true],
	])('Is session valid', (session, referrer, res) => {
		test(`${JSON.stringify(session)} with ${referrer} should return ${res}`, () => {
			expect(SessionUtils.isSessionValid(session, referrer)).toBe(res);
		});
	});
};

describe('Sessions', () => {
	testIsSessionValid();
});
