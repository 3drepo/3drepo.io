/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup } = require('../../../../helper/utils');
const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const ClashError = require(`${src}/services/mailer/templates/clashError`);

const testHtml = () => {
	describe('get template html', () => {
		test('should get clashError template html', async () => {
			const res = await ClashError.html({
				teamspace: generateRandomString(),
				project: generateRandomString(),
				planId: generateRandomString(),
				runId: generateRandomString(),
				errorMessage: generateRandomString(),
			});
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe.each([
		['data object is empty', {}],
		['data object is not empty', { domain: generateRandomString(), title: generateRandomString(), logExcerpt: generateRandomString() }],
	])('get subject', (desc, data) => {
		test(`should succeed if ${desc}`, () => {
			expect(ClashError.subject(data).length).not.toEqual(0);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testHtml();
	testSubject();
});
