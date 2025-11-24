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

const UpdateLicense = require(`${utilScripts}/teamspaces/updateLicense`);

const { editSubscriptions, getSubscriptions } = require(`${src}/models/teamspaceSettings`);
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
	const determineExpectedResults = ({ sub = {}, sub2 = {} }, { remove, ...changes }) => {
		if (changes.removeAll) return {};

		const { type: typeChanged, ...changedData } = changes;
		const res = remove ? {} : {
			[typeChanged]: changedData,
		};

		if (!isEmpty(sub)) {
			const { type, ...subData } = sub;
			if (!remove || type !== typeChanged) {
				res[type] = typeChanged === type ? { ...subData, ...changedData } : subData;
			}
		}
		if (!isEmpty(sub2)) {
			const { type, ...subData } = sub2;
			if (!remove || type !== typeChanged) {
				res[type] = typeChanged === type ? { ...subData, ...changedData } : subData;
			}
		}

		return res;
	};
	const badType = generateRandomString();
	describe.each([
		['teamspace does not exist', false, templates.teamspaceNotFound, { name: generateRandomString() }, {}],
		['removing sub of an unrecognised type', false, new Error(`Unrecognised license type: ${badType}`), testData.noSub, { remove: true, type: badType }],
		['removing a non existing sub', true, undefined, testData.noSub, { remove: true, type: SUBSCRIPTION_TYPES.ENTERPRISE }],
		['removing an existing sub (multiple subs)', true, undefined, testData.multipleSubs, { remove: true, type: SUBSCRIPTION_TYPES.ENTERPRISE }],
		['removing an existing sub (single sub)', true, undefined, testData.enterprise, { remove: true, type: SUBSCRIPTION_TYPES.ENTERPRISE }],
		['removing all subs', true, undefined, testData.multipleSubs, { removeAll: true }],
		['updating a non existing sub', true, undefined, testData.noSub, { type: SUBSCRIPTION_TYPES.ENTERPRISE, data: 1 }],
		['updating an existing sub', true, undefined, testData.enterprise, { type: SUBSCRIPTION_TYPES.ENTERPRISE, data: 100 }],
		['updating an existing sub with invalid data', false, undefined, testData.enterprise, { type: SUBSCRIPTION_TYPES.ENTERPRISE, data: 'abc' }],

	])('Update License', (desc, success, expectedOutput, teamspace, params) => {
		beforeEach(async () => {
			resetFileshare();
			await resetDB();
			await setupData(testData);
		});

		test(`Should ${success ? 'succeed' : 'fail with an error'} if ${desc}`, async () => {
			const { remove, removeAll, type, collaborators, data, expiryDate } = params;
			const exe = UpdateLicense.run(teamspace.name, remove, removeAll, type, collaborators, data, expiryDate);
			if (success) {
				await exe;
				await expect(getSubscriptions(teamspace.name)).resolves
					.toEqual(determineExpectedResults(teamspace, params));
			} else if (expectedOutput) {
				await expect(exe).rejects.toEqual(expectedOutput);
			} else {
				// not checking for specific response, just making sure it rejects
				await expect(exe).rejects.not.toBeUndefined();
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
