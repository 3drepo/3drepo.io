/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { src, utilScripts } = require('../../helper/path');

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);

const UpdateAddOns = require(`${utilScripts}/teamspaces/updateAddOns`);

const { getAddOns, updateAddOns } = require(`${src}/models/teamspaceSettings`);
const { ADD_ONS, ADD_ONS_MODULES } = require(`${src}/models/teamspaces.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const { disconnect } = require(`${src}/handler/db`);

const setupData = async (data) => {
	await Promise.all(Object.keys(data).map(async (index) => {
		const { name, addOns } = data[index];
		await createTeamspace(name);
		if (addOns !== {}) {
			await updateAddOns(name, addOns);
		}
	}));
};

const runTest = (data) => {
	const determineExpectedResults = (existing, changes) => {
		if (changes.removeAll) return {};
		const merged = { ...existing, ...changes };
		Object.keys(merged).forEach((key) => {
			if (!merged[key]) {
				delete merged[key];
			}
		});

		return merged;
	};
	describe.each([
		['teamspace does not exist', false, templates.teamspaceNotFound, { name: generateRandomString() }, { [ADD_ONS.VR]: true }],
		['there is no request to change the addons', false,
			new Error(`Modules must be one of the following: ${Object.values(ADD_ONS_MODULES)}`), data.noAddOn, {
				[ADD_ONS.VR]: true,
				[ADD_ONS.MODULES]: `${generateRandomString()}, ${ADD_ONS_MODULES.ISSUES}`,
			}],
		['the request includes invalid modules', false,
			new Error('Must specify at least 1 add on'), data.noAddOn, { }],
		['the request enables all add ons', true, undefined, data.noAddOn, {
			[ADD_ONS.VR]: true,
			[ADD_ONS.SRC]: true,
			[ADD_ONS.HERE]: true,
			[ADD_ONS.POWERBI]: true,
			[ADD_ONS.DAILY_DIGEST]: true,
			[ADD_ONS.MODULES]: Object.values(ADD_ONS_MODULES).join(','),
		}],
		['the request enables some add ons', true, undefined, data.noAddOn, {
			[ADD_ONS.VR]: true,
			[ADD_ONS.POWERBI]: true,
			[ADD_ONS.MODULES]: ADD_ONS_MODULES.ISSUES,
		}],
		['the request enables all add ons when they are already enabled', true, undefined, data.withAllAddOns, {
			[ADD_ONS.VR]: true,
			[ADD_ONS.SRC]: true,
			[ADD_ONS.HERE]: true,
			[ADD_ONS.POWERBI]: true,
			[ADD_ONS.MODULES]: Object.values(ADD_ONS_MODULES).join(','),
		}],
		['the request disables all add ons', true, undefined, data.withAllAddOns,
			{ removeAll: true }],
		['the request disables some add ons', true, undefined, data.noAddOn, {
			[ADD_ONS.POWERBI]: false,
			[ADD_ONS.MODULES]: 'null',
		}],
		['the request disables all add ons when they were disabled already', true, undefined, data.noAddOn,
			{ removeAll: true }],
		['the request changes the state of some flags', true, undefined, data.withSomeAddOns,
			{ [ADD_ONS.VR]: false, [ADD_ONS.HERE]: true }],

	])('Update add ons', (desc, success, expectedOutput, teamspace, params) => {
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupData(data);
		});

		test(`Should ${success ? 'succeed' : 'fail with an error'} if ${desc}`, async () => {
			const { removeAll, ...addOnsToChange } = params;
			const exe = UpdateAddOns.run(teamspace.name,
				params.removeAll,
				addOnsToChange,
			);
			if (success) {
				let expectedModules = teamspace.addOns[ADD_ONS_MODULES];
				if (params[ADD_ONS.MODULES]) {
					expectedModules = params[ADD_ONS.MODULES] === 'null' ? undefined : params[ADD_ONS.MODULES].split(',');
				}

				await exe;
				await expect(getAddOns(teamspace.name)).resolves
					.toEqual(determineExpectedResults(teamspace.addOns,
						deleteIfUndefined({ ...params, [ADD_ONS.MODULES]: expectedModules })));
			} else {
				await expect(exe).rejects.toEqual(expectedOutput);
			}
		});
	});
};

const createData = () => ({
	noAddOn: {
		name: generateRandomString(),
		addOns: {},
	},
	withAllAddOns: {
		name: generateRandomString(),
		addOns: {
			[ADD_ONS.VR]: true,
			[ADD_ONS.SRC]: true,
			[ADD_ONS.HERE]: true,
			[ADD_ONS.POWERBI]: true,
			[ADD_ONS.MODULES]: Object.values(ADD_ONS_MODULES),
		},
	},
	withSomeAddOns: {
		name: generateRandomString(),
		addOns: {
			[ADD_ONS.VR]: true,
			[ADD_ONS.SRC]: true,
		},
	},

});

describe(determineTestGroup(__filename), () => {
	const data = createData();
	runTest(data);
	afterAll(disconnect);
});
