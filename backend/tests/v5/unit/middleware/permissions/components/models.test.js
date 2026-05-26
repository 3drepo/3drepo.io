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

const { determineTestGroup } = require('../../../../helper/utils');
const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');

const { modelTypes } = require(`${src}/models/modelSettings.constants`);
const { isBool } = require(`${src}/utils/helper/typeCheck`);

jest.mock('../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../src/v5/utils/permissions');
const Permissions = require(`${src}/utils/permissions`);

const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);
const ModelMiddleware = require(`${src}/middleware/permissions/components/models`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const mockImp = (teamspace) => {
	if (teamspace === 'throwProjectError') {
		throw templates.projectNotFound;
	}
	return teamspace === 'ts';
};

Permissions.hasReadAccessToContainer.mockImplementation(mockImp);
Permissions.hasWriteAccessToContainer.mockImplementation(mockImp);
Permissions.hasCommenterAccessToContainer.mockImplementation(mockImp);

Permissions.hasAdminAccessToDrawing.mockImplementation(mockImp);

Permissions.hasReadAccessToFederation.mockImplementation(mockImp);
Permissions.hasWriteAccessToFederation.mockImplementation(mockImp);
Permissions.hasCommenterAccessToFederation.mockImplementation(mockImp);

Permissions.hasReadAccessToMultipleContainers.mockImplementation(mockImp);
Permissions.hasReadAccessToMultipleDrawings.mockImplementation(mockImp);
Permissions.hasReadAccessToMultipleFederations.mockImplementation(mockImp);

const testHelper = (type, label, testFn, mockedFn, multipleModels = false) => {
	const multipleModelsTest = multipleModels ? [['models not in request', false, { mockVal: null, multipleModelsFail: true }, templates.modelNotFound]] : [];
	describe.each([
		['user has access', true, { }],
		['byPass is enabled', true, { mockVal: null, byPass: true }],
		['the user has no access', false, { mockVal: false }, templates.notAuthorized],
		[`${label} threw ${templates.projectNotFound.code}`, false, { mockVal: templates.projectNotFound }, templates.projectNotFound],
		['model not found', false, { mockVal: null, modelByIdFail: templates.modelNotFound }, templates.modelNotFound],
		['model not in project', false, { mockVal: null, modelInProject: false }, templates.modelNotFound],
		...multipleModelsTest,
	])(label, (desc, success,
		{ mockVal = true, byPass = false, modelByIdFail, modelInProject = true, multipleModelsFail = false },
		expectedRes) => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const user = generateRandomString();

		test(` ${success ? 'next() ' : 'respond() '}should be called if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});

			const modelParam = multipleModels ? {} : { model };

			const req = {
				params: { teamspace, project, type, ...modelParam },
				models: multipleModels && !multipleModelsFail ? [model] : undefined,
				session: { user: { username: user } },
				app: { get: () => byPass },
			};

			Sessions.getUserFromSession.mockReturnValueOnce(user);

			if (modelByIdFail) {
				Permissions.checkModelsExists.mockRejectedValueOnce(modelByIdFail);
			} else if (!multipleModelsFail) {
				Permissions.checkModelsExists.mockResolvedValueOnce(modelInProject);
				if (modelInProject) {
					if (mockVal !== null) {
						if (isBool(mockVal)) {
							mockedFn.mockResolvedValueOnce(mockVal);
						} else {
							mockedFn.mockRejectedValueOnce(mockVal);
						}
					}
				}
			}

			await testFn(
				req,
				{},
				mockCB,
			);

			if (success) {
				expect(mockCB).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
			} else {
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, {}, expectedRes);
				expect(mockCB).not.toHaveBeenCalledTimes(1);
			}

			if (!multipleModelsFail) {
				expect(Permissions.checkModelsExists).toHaveBeenCalledTimes(1);
				expect(Permissions.checkModelsExists).toHaveBeenCalledWith(teamspace, project, [model], type);
			}
			if (modelByIdFail) {
				expect(mockedFn).not.toHaveBeenCalled();
			} else if (modelInProject) {
				if (mockVal !== null) {
					expect(mockedFn).toHaveBeenCalledTimes(1);
					expect(mockedFn).toHaveBeenCalledWith(teamspace, project,
						multipleModels ? [model] : model, user, true);
				} else {
					expect(mockedFn).not.toHaveBeenCalled();
				}
			} else {
				expect(mockedFn).not.toHaveBeenCalled();
			}
		});
	});
};

const testHasReadAccessToContainer = () => {
	testHelper(modelTypes.CONTAINER, 'hasReadAccessToContainer', ModelMiddleware.hasReadAccessToContainer, Permissions.hasReadAccessToContainer);
};

const testHasWriteAccessToContainer = () => {
	testHelper(modelTypes.CONTAINER, 'hasWriteAccessToContainer', ModelMiddleware.hasWriteAccessToContainer, Permissions.hasWriteAccessToContainer);
};

const testHasCommenterAccessToContainer = () => {
	testHelper(modelTypes.CONTAINER, 'hasCommenterAccessToContainer', ModelMiddleware.hasCommenterAccessToContainer, Permissions.hasCommenterAccessToContainer);
};

const testHasReadAccessToFederation = () => {
	testHelper(modelTypes.FEDERATION, 'hasReadAccessToFederation', ModelMiddleware.hasReadAccessToFederation, Permissions.hasReadAccessToFederation);
};

const testHasWriteAccessToFederation = () => {
	testHelper(modelTypes.FEDERATION, 'hasWriteAccessToFederation', ModelMiddleware.hasWriteAccessToFederation, Permissions.hasWriteAccessToFederation);
};

const testHasCommenterAccessToFederation = () => {
	testHelper(modelTypes.FEDERATION, 'hasCommenterAccessToFederation', ModelMiddleware.hasCommenterAccessToFederation, Permissions.hasCommenterAccessToFederation);
};

const testHasAdminAccessToContainer = () => {
	testHelper(modelTypes.CONTAINER, 'hasAdminAccessToContainer', ModelMiddleware.hasAdminAccessToContainer, Permissions.hasAdminAccessToContainer);
};

const testHasAdminAccessToFederation = () => {
	testHelper(modelTypes.FEDERATION, 'hasAdminAccessToFederation', ModelMiddleware.hasAdminAccessToFederation, Permissions.hasAdminAccessToFederation);
};

const testHasAdminAccessToDrawing = () => {
	testHelper(modelTypes.DRAWING, 'hasAdminAccessToDrawing', ModelMiddleware.hasAdminAccessToDrawing, Permissions.hasAdminAccessToDrawing);
};

const testHasReadAccessToMultipleContainers = () => {
	testHelper(modelTypes.CONTAINER, 'hasReadAccessToMultipleContainers', ModelMiddleware.hasReadAccessToMultipleContainers, Permissions.hasReadAccessToMultipleContainers, true);
};

const testHasReadAccessToMultipleDrawings = () => {
	testHelper(modelTypes.DRAWING, 'hasReadAccessToMultipleDrawings', ModelMiddleware.hasReadAccessToMultipleDrawings, Permissions.hasReadAccessToMultipleDrawings, true);
};

const testHasReadAccessToMultipleFederations = () => {
	testHelper(modelTypes.FEDERATION, 'hasReadAccessToMultipleFederations', ModelMiddleware.hasReadAccessToMultipleFederations, Permissions.hasReadAccessToMultipleFederations, true);
};

describe(determineTestGroup(__filename), () => {
	testHasReadAccessToContainer();
	testHasReadAccessToMultipleContainers();
	testHasWriteAccessToContainer();
	testHasCommenterAccessToContainer();
	testHasAdminAccessToContainer();

	testHasReadAccessToFederation();
	testHasReadAccessToMultipleFederations();
	testHasWriteAccessToFederation();
	testHasCommenterAccessToFederation();

	testHasReadAccessToMultipleDrawings();
	testHasAdminAccessToDrawing();
	testHasAdminAccessToFederation();
});
