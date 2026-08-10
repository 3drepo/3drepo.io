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

const { determineTestGroup } = require('../../../../helper/utils');
const { src } = require('../../../../helper/path');
const { generateRandomString, generateUUID } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const DailyDigest = require(`${src}/services/mailer/templates/dailyDigest`);

const testHtml = () => {
	describe('get dailyDigest template html', () => {
		const standardData = {
			username: generateRandomString(),
			teamspace: generateRandomString(),
			notifications: [{
				project: generateUUID(),
				ticketData: [{
					model: generateRandomString(),
					tickets: {
						updated: {
							count: 10,
							link: generateRandomString(),
						},
						assigned: {
							count: 10,
							link: generateRandomString(),
						},
						closed: {
							count: 10,
							link: generateRandomString(),
						},
					},
				}],
				clashData: [{
					planName: generateRandomString(),
					runs: [{
						status: generateRandomString(),
						stats: {
							new: 10,
							active: 10,
							resolved: 10,
						},
						error: {
							reason: generateRandomString(),
						},
						triggeredAt: new Date(),
					}],
				}],
			}],
		};

		describe.each([
			['data is undefined', undefined],
			['username is undefined', { ...standardData, username: undefined }],
			['notifications is empty', { ...standardData, notifications: [] }],
			['ticketData model is undefined', { ...standardData, notifications: [{ ...standardData.notifications[0], ticketData: [{ ...standardData.notifications[0].ticketData[0], model: undefined }] }] }],
			['clashData planName is undefined', { ...standardData, notifications: [{ ...standardData.notifications[0], clashData: [{ ...standardData.notifications[0].clashData[0], planName: undefined }] }] }],
			['clashData runs is undefined', { ...standardData, notifications: [{ ...standardData.notifications[0], clashData: [{ ...standardData.notifications[0].clashData[0], runs: undefined }] }] }],
			['clashData runs is empty', { ...standardData, notifications: [{ ...standardData.notifications[0], clashData: [{ ...standardData.notifications[0].clashData[0], runs: [] }] }] }],
		])('Error checking ', (desc, data) => {
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

describe(determineTestGroup(__filename), () => {
	testHtml();
	testSubject();
});
