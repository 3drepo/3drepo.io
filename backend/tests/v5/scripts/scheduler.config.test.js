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

const { determineTestGroup } = require('../helper/utils');
const { utilScripts } = require('../helper/path');

const { validateConfig } = require(`${utilScripts}/scheduler.config`);

const cmdList = ['cleanUpSharedDir', 'detectZombieProcessing'];
const emptyValidatedConfig = {
	daily: [],
	weekly: [],
	monthly: [],
	emailOnFailure: true,
};

const testValidateConfig = () => {
	const helmStringConfig = {
		daily: [{ name: 'detectZombieProcessing', params: [null, null, true] }],
		weekly: [],
		monthly: [],
		emailOnFailure: false,
	};

	describe.each([
		['schedules are missing', {}, emptyValidatedConfig, false],
		['task params are missing', { daily: [{ name: 'cleanUpSharedDir' }] }, {
			...emptyValidatedConfig,
			daily: [{ name: 'cleanUpSharedDir', params: [] }],
		}, false],
		['config is a JSON string rendered by helm', JSON.stringify(helmStringConfig), helmStringConfig, false],
		['task name is missing', { daily: [{}] }, undefined, true],
		['task name is unknown', { daily: [{ name: 'unknownTask' }] }, undefined, true],
		['task params are not an array', { daily: [{ name: 'cleanUpSharedDir', params: 'invalid' }] }, undefined, true],
		['config is a malformed JSON string', '{', undefined, true],
	])('Validate scheduler config', (desc, input, expectedOutput, shouldThrow) => {
		test(`should ${shouldThrow ? 'reject' : 'validate'} if ${desc}`, async () => {
			// Wrap the call so sync JSON parse errors and async Yup validation errors use the same assertion path.
			const validation = () => Promise.resolve().then(() => validateConfig(input, cmdList));

			if (shouldThrow) {
				await expect(validation()).rejects.toThrow();
			} else {
				await expect(validation()).resolves.toEqual(expectedOutput);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testValidateConfig();
});
