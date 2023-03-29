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

const ErrorNotification = require(`${src}/services/mailer/templates/errorNotification`);

const testHtml = () => {
	describe('get template html', () => {
		test('should get errorNotification template html', async () => {
			const res = await ErrorNotification.html({ err: new Error(generateRandomString()) });
			expect(isHtml(res)).toEqual(true);
		});

		test('should get errorNotification template html if error object is just a string', async () => {
			const res = await ErrorNotification.html({ err: generateRandomString() });
			expect(isHtml(res)).toEqual(true);
		});

		test('should get errorNotification template html if error object is null', async () => {
			const res = await ErrorNotification.html({ err: null });
			expect(isHtml(res)).toEqual(true);
		});

		test('should get errorNotification template html if error object is undefined', async () => {
			const res = await ErrorNotification.html({ });
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe.each([
		['data object is empty', {}],
		['data object is not empty', { domain: generateRandomString(), scope: generateRandomString(), title: generateRandomString() }],
	])('get subject', (desc, data) => {
		test(`should succeed if ${desc}`, () => {
			expect(ErrorNotification.subject(data).length).not.toEqual(0);
		});
	});
};

describe('services/mailer/templates/errorNotification', () => {
	testHtml();
	testSubject();
});
