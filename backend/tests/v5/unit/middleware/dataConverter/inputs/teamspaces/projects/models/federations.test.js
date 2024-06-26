/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { times } = require('lodash');
const { src } = require('../../../../../../../helper/path');
const { generateUUIDString, generateRandomString } = require('../../../../../../../helper/services');

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../../../../../src/v5/models/projectSettings');
const Projects = require(`${src}/models/projectSettings`);

const Federations = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/federations`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const modelNotInProject = generateUUIDString();

Projects.modelsExistInProject.mockImplementation(
	(teamspace, project, models) => {
		if (project === 'throw') return Promise.reject(templates.projectNotFound);
		return Promise.resolve(!models.includes(modelNotInProject));
	},
);

ModelSettings.getContainers.mockImplementation(
	(teamspace, models) => (teamspace === 'Error' ? Promise.resolve([]) : Promise.resolve(models)),
);

const testValidateNewRevisionData = () => {
	const createBody = (containers) => ({
		containers,
	});
	describe.each([
		['Request with valid data (old schema)', createBody(times(3, () => generateUUIDString()))],
		['Request with valid data (new schema)', createBody(times(3, () => ({ _id: generateUUIDString() })))],
		['Request with valid data (new schema with groups)', createBody(times(3, () => ({
			_id: generateUUIDString(),
			group: generateRandomString(),
		})))],
		['Request with invalid model Ids (wrong type)', createBody([1, 2, 3]), true],
		['Request with invalid model Ids (not uuid format', createBody(['model 1']), true],
		['Request with empty container array', createBody([]), true],
		['Request with container id that doesn\'t exist in the project', createBody([modelNotInProject]), true],
		['Request with project that does not exist', createBody([generateUUIDString()]), true, 'ts', 'throw'],
		['Request with container ids that is of federation', createBody([generateUUIDString()]), true, 'Error'],
		['Request with empty body', {}, true],
	])('Check new revision data', (desc, body, shouldFail, teamspace = 'a', project = 'b') => {
		test(`${desc} should ${shouldFail ? 'fail' : ' succeed and next() should be called'}`, async () => {
			const params = { teamspace, project, federation: 'c' };
			const mockCB = jest.fn(() => {});
			await Federations.validateNewRevisionData({ params, body }, {}, mockCB);
			if (shouldFail) {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
			} else {
				expect(mockCB.mock.calls.length).toBe(1);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/federations', () => {
	testValidateNewRevisionData();
});
