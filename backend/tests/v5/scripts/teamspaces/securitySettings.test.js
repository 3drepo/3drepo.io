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

const SecurityRestrictionss = require(`${utilScripts}/teamspaces/securitySettings`);

const { getSecurityRestrictions, updateSecurityRestrictions } = require(`${src}/models/teamspaceSettings`);
const { SECURITY_SETTINGS } = require(`${src}/models/teamspaces.constants`);
const { templates } = require(`${src}/utils/responseCodes`);
const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

const { disconnect } = require(`${src}/handler/db`);

const setupData = async (data) => {
	await Promise.all(Object.keys(data).map(async (index) => {
		const entry = data[index];
		await createTeamspace(entry.name);
		if (entry.restricted) {
			await updateSecurityRestrictions(entry.name, true, entry.whiteList);
		}
	}));
};

const runTest = (data) => {
	const determineExpectedResults = (ts, update, enabled, whiteList) => {
		const isSSO = update && enabled !== undefined ? enabled : ts.restricted;
		let domains = ts.whiteList;

		if (update && whiteList !== undefined) {
			if (whiteList === 'null') domains = undefined;
			else domains = whiteList.split(',');
		}

		return deleteIfUndefined({
			[SECURITY_SETTINGS.SSO_RESTRICTED]: isSSO === true ? true : undefined,
			[SECURITY_SETTINGS.DOMAIN_WHITELIST]: domains,
		});
	};
	describe.each([
		['teamspace does not exist', false, templates.teamspaceNotFound, generateRandomString()],
		['view only', true, undefined, data.hasAllRestrictions],
		['update to sso restriction to true', true, undefined, data.noRestriction, true, true],
		['update to whiteList', true, undefined, data.noRestriction, true, undefined, times(10, () => generateRandomString()).join(',')],
		['update both', true, undefined, data.hasAllRestrictions, true, true, times(10, () => generateRandomString()).join(',')],
		['turn off whitelist', true, undefined, data.hasAllRestrictions, true, undefined, 'null'],
		['turn off sso restriction', true, undefined, data.hasAllRestrictions, true, false],
		['turn off both', true, undefined, data.hasAllRestrictions, true, false, 'null'],

	])('View/Update SSO restriction', (desc, success, expectedOutput, teamspace, update, enabled, whiteList) => {
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupData(data);
		});

		test(`Should ${success ? 'succeed' : 'fail with an error'} if ${desc}`, async () => {
			const exe = SecurityRestrictionss.run(teamspace.name, !update, update, enabled, whiteList);
			if (success) {
				await exe;
				await expect(getSecurityRestrictions(teamspace.name)).resolves
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
	hasAllRestrictions: {
		name: generateRandomString(),
		restricted: true,
		whiteList: times(3, () => generateRandomString()),
	},

});

describe(determineTestGroup(__filename), () => {
	const data = createData();
	runTest(data);
	afterAll(disconnect);
});
