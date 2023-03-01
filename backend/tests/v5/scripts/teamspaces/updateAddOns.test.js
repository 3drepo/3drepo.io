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

const UpdateAddOns = require(`${utilScripts}/teamspaces/updateAddOns`);

const { getAddOns, updateAddOns } = require(`${src}/models/teamspaceSettings`);
const { ADD_ONS } = require(`${src}/models/teamspaces.constants`);
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
			new Error('Must specify at least 1 add on'), data.noAddOn, { }],
		['the request enables all add ons', true, undefined, data.noAddOn, {
			[ADD_ONS.VR]: true,
			[ADD_ONS.SRC]: true,
			[ADD_ONS.HERE]: true,
			[ADD_ONS.POWERBI]: true,
		}],
		['the request enables all add ons when they are already enabled', true, undefined, data.withAllAddOns, {
			[ADD_ONS.VR]: true,
			[ADD_ONS.SRC]: true,
			[ADD_ONS.HERE]: true,
			[ADD_ONS.POWERBI]: true,
		}],
		['the request disables all add ons', true, undefined, data.withAllAddOns,
			{ removeAll: true }],
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
			const exe = UpdateAddOns.run(teamspace.name,
				params[ADD_ONS.VR],
				params[ADD_ONS.SRC],
				params[ADD_ONS.HERE],
				params[ADD_ONS.POWERBI],
				params.removeAll);
			if (success) {
				await exe;
				await expect(getAddOns(teamspace.name)).resolves
					.toEqual(determineExpectedResults(teamspace.addOns, params));
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
