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

const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const TeamspaceExpiringToday = require(`${src}/services/mailer/templates/teamspaceExpiringToday`);

const testHtml = () => {
	describe('get teamspaceExpiringToday template html', () => {
		const standardData = {
			teamspace: generateRandomString(),
			expiryDate: new Date(),
		};
		describe.each([
			['data is undefined', undefined],
			['teamspace is undefined', { ...standardData, teamspace: undefined }],
		])(
			'Error checking ', (desc, data) => {
				test(`should throw an error if ${desc}`, async () => {
					await expect(TeamspaceExpiringToday.html(data)).rejects.toThrow();
				});
			},
		);

		test('should get teamspaceExpiringToday template html', async () => {
			const res = await TeamspaceExpiringToday.html(standardData);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe('Email subject', () => {
		test('Should return the subject title as expected', () => {
			const teamspace = generateRandomString();
			expect(TeamspaceExpiringToday.subject({ teamspace })).toEqual(`Your teamspace ${teamspace} has expired`);
		});
	});
};

describe('services/mailer/templates/teamspaceExpiringToday', () => {
	testHtml();
	testSubject();
});
