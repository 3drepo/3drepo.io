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

const { src } = require('../../../../../../../helper/path');

jest.mock('../../../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

const Containers = require(`${src}/middleware/dataConverter/inputs/teamspaces/projects/models/containers`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const subModelContainer = 'ImSub';

ModelSettings.getModelByQuery.mockImplementation((teamspace, query) => (query['subModels.model'] !== subModelContainer
	? Promise.reject(templates.modelNotFound)
	: Promise.resolve({ _id: 1, name: 'abc' })));

const testCanDeleteContainer = () => {
	describe.each([
		['Container that is not a submodel', { params: { teamspace: '123', project: '234', container: '123' } }, true],
		['Container that is a submodel', { params: { teamspace: '123', project: '234', container: subModelContainer } }, false, false],
		['Invalid params', { }, false, true],
	])('Can delete container', (desc, req, success, invalidArguments) => {
		test(`${desc} ${success ? 'should call next()' : `should respond with ${invalidArguments ? 'invalidArguments' : 'containerIsSubModel'}`}`, async () => {
			const mockCB = jest.fn();
			await Containers.canDeleteContainer(req, {}, mockCB);

			if (success) {
				expect(mockCB.mock.calls.length).toBe(1);
			} else {
				const expectedError = invalidArguments ? templates.invalidArguments : templates.containerIsSubModel;
				expect(mockCB.mock.calls.length).toBe(0);
				expect(Responder.respond.mock.calls.length).toBe(1);
				expect(Responder.respond.mock.results[0].value.code).toEqual(expectedError.code);
			}
		});
	});
};

describe('middleware/dataConverter/inputs/teamspaces/projects/models/containers', () => {
	testCanDeleteContainer();
});
