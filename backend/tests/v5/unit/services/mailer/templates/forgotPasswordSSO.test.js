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
const { determineTestGroup, generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const ForgotPassword = require(`${src}/services/mailer/templates/forgotPasswordSSO`);

const testHtml = () => {
	describe('get forgotPassword SSO template html', () => {
		describe.each([
			['data is undefined', undefined],
			['username is undefined', { ssoType: generateRandomString() }],
			['ssoType is undefined', { username: generateRandomString() }],
		])(
			'Error checking ', (desc, data) => {
				test(`should throw an error if ${desc}`, async () => {
					await expect(ForgotPassword.html(data)).rejects.toThrow();
				});
			},
		);

		test('should get forgotPassword template html', async () => {
			const data = {
				username: generateRandomString(),
				ssoType: generateRandomString(),
			};
			const res = await ForgotPassword.html(data);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	test('Should return a subject title', () => {
		expect(ForgotPassword.subject()).not.toBeUndefined();
	});
};

describe(determineTestGroup(__filename), () => {
	testHtml();
	testSubject();
});
