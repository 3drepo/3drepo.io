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
const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const ZombieProcessingStatuses = require(`${src}/services/mailer/templates/zombieProcessingStatuses`);

const testHtml = () => {
	describe('get template html', () => {
		test('should get zombieProcessingStatuses template html', async () => {
			const modelId = generateRandomString();
			const clashRunId = generateRandomString();
			const res = await ZombieProcessingStatuses.html({
				message: generateRandomString(),
				domain: generateRandomString(),
				zombieEntries: {
					models: [{
						teamspace: generateRandomString(),
						id: modelId,
						status: generateRandomString(),
						timestamp: new Date(),
					}],
					drawings: [],
					clashRuns: [{
						teamspace: generateRandomString(),
						id: clashRunId,
						status: generateRandomString(),
						timestamp: new Date(),
					}],
				},
			});
			expect(isHtml(res)).toEqual(true);
			expect(res).toContain('<b>Models</b>');
			expect(res).toContain(modelId);
			expect(res).not.toContain('<b>Drawings</b>');
			expect(res).toContain('<b>Clash runs</b>');
			expect(res).toContain(clashRunId);
		});
	});
};

const testSubject = () => {
	describe.each([
		['data object is empty', {}],
		['data object is not empty', { domain: generateRandomString(), title: generateRandomString(), script: generateRandomString() }],
	])('get subject', (desc, data) => {
		test(`should succeed if ${desc}`, () => {
			expect(ZombieProcessingStatuses.subject(data).length).not.toEqual(0);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testHtml();
	testSubject();
});
