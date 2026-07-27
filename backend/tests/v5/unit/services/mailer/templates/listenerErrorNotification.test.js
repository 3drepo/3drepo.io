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

const ListenerErrorNotification = require(`${src}/services/mailer/templates/listenerErrorNotification`);

const testHtml = () => {
	describe('get template html', () => {
		test('should get listenerErrorNotification template html', async () => {
			const res = await ListenerErrorNotification.html({
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
				error: new Error(generateRandomString()),
			});
			expect(isHtml(res)).toEqual(true);
		});

		test('should throw if payload is undefined', async () => {
			await expect(ListenerErrorNotification.html({
				listenerName: generateRandomString(),
				component: generateRandomString(),
				error: new Error(generateRandomString()),
			})).rejects.toThrow();
		});

		test('should throw if error is not an object', async () => {
			await expect(ListenerErrorNotification.html({
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
				error: generateRandomString(),
			})).rejects.toThrow();
		});

		test('should throw if error is null', async () => {
			await expect(ListenerErrorNotification.html({
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
				error: null,
			})).rejects.toThrow();
		});

		test('should throw if payload is not an object', async () => {
			await expect(ListenerErrorNotification.html({
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: generateRandomString(),
				error: new Error(generateRandomString()),
			})).rejects.toThrow();
		});

		test('should throw if error is undefined', async () => {
			await expect(ListenerErrorNotification.html({
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
			})).rejects.toThrow();
		});
	});
};

const testSubject = () => {
	describe.each([
		['data object is empty', {}],
		['data object is not empty', { listenerName: generateRandomString(), component: generateRandomString() }],
	])('get subject', (desc, data) => {
		test(`should succeed if ${desc}`, () => {
			expect(ListenerErrorNotification.subject(data).length).not.toEqual(0);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testHtml();
	testSubject();
});
