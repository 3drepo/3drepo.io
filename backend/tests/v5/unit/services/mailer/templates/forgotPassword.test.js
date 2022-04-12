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

const ForgotPassword = require(`${src}/services/mailer/templates/forgotPassword`);

const testHtml = () => {
	describe('get forgotPassword template html', () => {
		test('should get forgotPassword template html', async () => {
			const data = {
				username: generateRandomString(),
				token: generateRandomString(),
			};
			const res = await ForgotPassword.html(data);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

describe('services/mailer/templates/forgotPassword', () => {
	testHtml();
});
