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

const DailyDigest = require(`${src}/services/mailer/templates/dailyDigest`);

const testHtml = () => {
	describe('get dailyDigest template html', () => {
		const standardData = {
			username: generateRandomString(),
			teamspace: generateRandomString(),
			notifications: [{
				project: generateRandomString(),
				model: generateRandomString(),
				tickets: {
					updated: { count: 10, link: generateRandomString() },
					assigned: { count: 10, link: generateRandomString() },
					closed: { count: 10, link: generateRandomString() },
				},
			}],
		};
		describe.each([
			['data is undefined', undefined],
			['username is undefined', { ...standardData, username: undefined }],
			['notifications is empty', { ...standardData, notifications: [] }],
		])(
			'Error checking ', (desc, data) => {
				test(`should throw an error if ${desc}`, async () => {
					await expect(DailyDigest.html(data)).rejects.toThrow();
				});
			},
		);

		test('should get dailyDigest template html', async () => {
			const res = await DailyDigest.html(standardData);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe('Email subject', () => {
		test('Should return the subject title as expected', () => {
			const teamspace = generateRandomString();
			expect(DailyDigest.subject({ teamspace })).toEqual(`[${teamspace}] Activities you have missed`);
			expect();
		});
	});
};

describe('services/mailer/templates/dailyDigest', () => {
	testHtml();
	testSubject();
});
