/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const Audit = require(`${src}/services/mailer/templates/audit`);

const testHtml = () => {
	describe('get audit template html', () => {
		describe.each([
			['data is undefined', undefined],
			['password is undefined', { }],
		])(
			'Error checking ', (desc, data) => {
				test(`should throw an error if ${desc}`, async () => {
					await expect(Audit.html(data)).rejects.toThrow();
				});
			},
		);

		test('should get audit template html', async () => {
			const data = {
				password: generateRandomString(),
				firstName: generateRandomString(),
			};
			const res = await Audit.html(data);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe('get subject', () => {
		test('should get the subject of the template', () => {
			const res = Audit.subject();
			expect(res).toEqual('Audit logs file password');
		});
	});
};

describe('services/mailer/templates/audit', () => {
	testHtml();
	testSubject();
});
