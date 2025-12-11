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
	generateRandomDate,
} = require('../../helper/services');

const { src, utilScripts } = require('../../helper/path');

const ViewLicense = require(`${utilScripts}/teamspaces/viewLicense`);

const { editSubscriptions } = require(`${src}/models/teamspaceSettings`);
const { SUBSCRIPTION_TYPES } = require(`${src}/models/teamspaces.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const { isEmpty } = require(`${src}/utils/helper/objects`);

const { disconnect } = require(`${src}/handler/db`);

const setupData = async (data) => {
	await Promise.all(Object.keys(data).map(async (index) => {
		const { name, sub = {}, sub2 = {} } = data[index];
		await createTeamspace(name);
		if (!isEmpty(sub)) {
			const { type, ...changes } = sub;
			await editSubscriptions(name, type, changes);
		}
		if (!isEmpty(sub2)) {
			const { type, ...changes } = sub2;
			await editSubscriptions(name, type, changes);
		}
	}));
};

const runTest = (testData) => {
	const determineExpectedResults = ({ sub = {}, sub2 = {} }) => {
		const res = {};

		if (!isEmpty(sub)) {
			const { type, ...subData } = sub;
			res[type] = subData;
		}
		if (!isEmpty(sub2)) {
			const { type, ...subData } = sub2;
			res[type] = subData;
		}

		return res;
	};
	describe.each([
		['teamspace does not exist', false, templates.teamspaceNotFound, { name: generateRandomString() }],
		['teamspace has no sub', true, undefined, testData.noSub],
		['teamspace has 1 sub', true, undefined, testData.enterprise],
		['teamspace has multiple subs', true, undefined, testData.multipleSubs],

	])('View license', (desc, success, expectedOutput, teamspace) => {
		beforeAll(async () => {
			resetFileshare();
			await resetDB();
			await setupData(testData);
		});

		test(`Should ${success ? 'succeed' : 'fail with an error'} if ${desc}`, async () => {
			const exe = ViewLicense.run(teamspace.name);
			if (success) {
				await expect(exe).resolves.toEqual(determineExpectedResults(teamspace));
			} else {
				await expect(exe).rejects.toEqual(expectedOutput);
			}
		});
	});
};

const createData = () => ({
	noSub: {
		name: generateRandomString(),
	},
	enterprise: {
		name: generateRandomString(),
		sub: {
			type: SUBSCRIPTION_TYPES.ENTERPRISE,
			collaborators: 10,
			data: 10,
			expiryDate: generateRandomDate(),
		},
	},
	multipleSubs: {
		name: generateRandomString(),
		sub: {
			type: SUBSCRIPTION_TYPES.DISCRETIONARY,
			collaborators: 'unlimited',
			data: 10,
			expiryDate: generateRandomDate(),
		},
		sub2: {
			type: SUBSCRIPTION_TYPES.ENTERPRISE,
			collaborators: 1,
			data: 10,
			expiryDate: generateRandomDate(),
		},
	},

});

describe(determineTestGroup(__filename), () => {
	const data = createData();
	runTest(data);
	afterAll(disconnect);
});
