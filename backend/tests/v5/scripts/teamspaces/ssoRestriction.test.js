/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const {
	determineTestGroup,
	resetFileshare,
	db: { reset: resetDB, createTeamspace },
	generateRandomString,
} = require('../../helper/services');

const { times } = require('lodash');
const { src, utilScripts } = require('../../helper/path');

const SSORestrictions = require(`${utilScripts}/teamspaces/ssoRestriction`);

const { getSSORestriction, updateSSORestriction } = require(`${src}/models/teamspaceSettings`);
const { SSO_RESTRICTED } = require(`${src}/models/teamspaces.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const { disconnect } = require(`${src}/handler/db`);

const setupData = async (data) => {
	await Promise.all(Object.keys(data).map(async (index) => {
		const entry = data[index];
		await createTeamspace(entry.name);
		if (entry[SSO_RESTRICTED]) {
			await updateSSORestriction(entry.name, !!entry[SSO_RESTRICTED],
				entry[SSO_RESTRICTED]?.length ? entry[SSO_RESTRICTED] : undefined);
		}
	}));
};

const runTest = (data) => {
	const determineExpectedResults = (ts, update, enabled, whiteList) => {
		if (!update) return ts[SSO_RESTRICTED];

		return whiteList ? whiteList.toLowerCase().split(',') : enabled;
	};
	describe.each([
		['teamspace does not exist', false, templates.teamspaceNotFound, generateRandomString()],
		['turning off restriction whilst providing a whitelist', false,
			new Error('Inconsistent options: cannot define a whitelist whilst trying to disable SSO restriction.'),
			data.noRestriction, true, false, generateRandomString()],
		['view only', true, undefined, data.hasSSO],
		['update to true', true, undefined, data.noRestriction, true, true],
		['update to whiteList', true, undefined, data.hasSSO, true, true, times(10, () => generateRandomString()).join(',')],
		['turn off', true, undefined, data.hasWhiteList, true, false],

	])('View/Update SSO restriction', (desc, success, expectedOutput, teamspace, update, enabled, whiteList) => {
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupData(data);
		});

		test(`Should ${success ? 'succeed' : 'fail with an error'} if ${desc}`, async () => {
			const exe = SSORestrictions.run(teamspace.name, !update, update, enabled, whiteList);
			if (success) {
				await exe;
				await expect(getSSORestriction(teamspace.name)).resolves
					.toEqual(determineExpectedResults(teamspace, update, enabled, whiteList));
			} else {
				await expect(exe).rejects.toEqual(expectedOutput);
			}
		});
	});
};

const createData = () => ({
	noRestriction: {
		name: generateRandomString(),
	},
	hasSSO: {
		name: generateRandomString(),
		[SSO_RESTRICTED]: true,
	},
	hasWhiteList: {
		name: generateRandomString(),
		[SSO_RESTRICTED]: times(5, generateRandomString()),
	},

});

describe(determineTestGroup(__filename), () => {
	const data = createData();
	runTest(data);
	afterAll(disconnect);
});
