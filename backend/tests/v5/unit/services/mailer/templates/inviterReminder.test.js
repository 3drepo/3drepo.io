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
const { generateRandomString } = require('../../../../helper/dataGen');
const isHtml = require('is-html-content');

const inviterReminder = require(`${src}/services/mailer/templates/inviterReminder`);

const testHtml = () => {
	describe('get inviterReminder template html', () => {
		const standardData = {
			teamspace: generateRandomString(),
			inviteeEmail: generateRandomString(),
		};

		describe.each([
			['data is undefined', undefined],
			['teamspace is undefined', { ...standardData, teamspace: undefined }],
			['inviteeEmail is undefined', { ...standardData, inviteeEmail: undefined }],
		])('Error checking ', (desc, data) => {
			test(`should throw an error if ${desc}`, async () => {
				await expect(inviterReminder.html(data)).rejects.toThrow();
			});
		},
		);

		test('should get inviterReminder template html', async () => {
			const res = await inviterReminder.html(standardData);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe('Email subject', () => {
		test('Should return the subject title as expected', () => {
			const inviteeEmail = generateRandomString();
			expect(inviterReminder.subject({ inviteeEmail })).toEqual(`Invitation to ${inviteeEmail} expires tomorrow`);
		});
	});
};

describe('services/mailer/templates/inviterReminder', () => {
	testHtml();
	testSubject();
});
