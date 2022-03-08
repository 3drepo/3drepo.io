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

const { src } = require('../../../../../../helper/path');

jest.mock('../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../src/v5/models/projectSettings');
const ProjectsModel = require(`${src}/models/projectSettings`);

const Projects = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects`);

const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const existingProjectId = 'projectId';
const existingProjectName = 'existing';
ProjectsModel.getProjectByQuery.mockImplementation((teamspace, query) => (
	query.name === existingProjectName && query._id.$ne !== existingProjectId
		? Promise.resolve({ name: existingProjectName, _id: existingProjectId })
		: Promise.reject(templates.modelNotFound)));

const testValidateProjectData = () => {
	describe.each([
		['Request with valid data', { params: { teamspace: 'ts', project: existingProjectId }, body: { name: '123' } }],
		['Request with invalid name', { params: { teamspace: 'ts', project: existingProjectId }, body: { name: 123 } }, templates.invalidArguments],
		['Request with project that exists', { params: { teamspace: 'ts', project: existingProjectId }, body: { name: '123' } }],
		['Request with project that exists changing its name to the same', { params: { teamspace: 'ts', project: existingProjectId }, body: { name: existingProjectName } }],
		['Request with name change with a name that is taken', { params: { teamspace: 'ts', project: 'pr2' }, body: { name: existingProjectName } }, templates.invalidArguments],
	])('Check new project data', (desc, req, error) => {
		test(`${desc} should ${error ? `fail with ${error.code}` : ' succeed and next() should be called'}`, async () => {
			const mockCB = jest.fn(() => {});
			await Projects.validateProjectData(req, {}, mockCB);
			if (error) {
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(error.code);
			} else {
				expect(mockCB.mock.calls.length).toBe(1);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects', () => {
	testValidateProjectData();
});
