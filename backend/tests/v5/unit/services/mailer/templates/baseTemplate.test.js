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
const isHtml = require('is-html-content');

const BaseTemplate = require(`${src}/services/mailer/templates/baseTemplate`);

const testHtml = () => {
	describe('get base template html', () => {
		describe.each([
			['data is undefined', undefined],
			['firstName is undefined', { emailContent: generateRandomString() }],
			['emailContent is undefined', { firstName: generateRandomString() }],
		])(
			'Error checking ', (desc, data) => {
				test(`should throw an error if ${desc}`, () => {
					expect(() => BaseTemplate.html(data)).toThrow();
				});
			},
		);

		test('should get base template html', () => {
			const data = {
				firstName: generateRandomString(),
				emailContent: generateRandomString(),
			};

			const res = BaseTemplate.html(data);

			expect(isHtml(res)).toBe(true);
		});
	});
};

describe('services/mailer/templates/baseTemplate', () => {
	testHtml();
});
