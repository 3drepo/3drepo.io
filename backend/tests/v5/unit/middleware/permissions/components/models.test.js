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

const { src } = require('../../../../helper/path');
const { determineTestGroup, generateRandomString } = require('../../../../helper/services');

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

const testHelper = (label, testFn, mockedFn) => {
	describe.each([
		['user has access', true, true],
		['byPass is enabled', true, null, true],
		['the user has no access', false, false, false, templates.notAuthorized],
		[`${label} threw ${templates.projectNotFound.code}`, false, templates.projectNotFound, false, templates.projectNotFound],
	])(label, (desc, success, mockVal, byPass, expectedRes) => {
		const teamspace = generateRandomString();
		const project = generateRandomString();
		const model = generateRandomString();
		const user = generateRandomString();
		test(` ${success ? 'next() ' : 'respond() '}should be called if ${desc}`, async () => {
			const mockCB = jest.fn(() => {});
			const req = {
				params: { teamspace, project, model },
				session: { user: { username: user } },
				app: { get: () => byPass },
			};

			Sessions.getUserFromSession.mockReturnValueOnce(user);

			if (mockVal !== null) {
				if (isBool(mockVal)) {
					mockedFn.mockResolvedValueOnce(mockVal);
				} else {
					mockedFn.mockRejectedValueOnce(mockVal);
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

			if (mockVal !== null) {
				expect(mockedFn).toHaveBeenCalledTimes(1);
				expect(mockedFn).toHaveBeenCalledWith(teamspace, project, model, user);
			} else {
				expect(mockedFn).not.toHaveBeenCalled();
			}
		});
	});
};

const testHasReadAccessToContainer = () => {
	testHelper('hasReadAccessToContainer', ModelMiddleware.hasReadAccessToContainer, Permissions.hasReadAccessToContainer);
};

const testHasWriteAccessToContainer = () => {
	testHelper('hasWriteAccessToContainer', ModelMiddleware.hasWriteAccessToContainer, Permissions.hasWriteAccessToContainer);
};

const testHasCommenterAccessToContainer = () => {
	testHelper('hasCommenterAccessToContainer', ModelMiddleware.hasCommenterAccessToContainer, Permissions.hasCommenterAccessToContainer);
};

const testHasReadAccessToFederation = () => {
	testHelper('hasReadAccessToFederation', ModelMiddleware.hasReadAccessToFederation, Permissions.hasReadAccessToFederation);
};

const testHasWriteAccessToFederation = () => {
	testHelper('hasWriteAccessToFederation', ModelMiddleware.hasWriteAccessToFederation, Permissions.hasWriteAccessToFederation);
};

const testHasCommenterAccessToFederation = () => {
	testHelper('hasCommenterAccessToFederation', ModelMiddleware.hasCommenterAccessToFederation, Permissions.hasCommenterAccessToFederation);
};

const testHasAdminAccessToContainer = () => {
	testHelper('hasAdminAccessToContainer', ModelMiddleware.hasAdminAccessToContainer, Permissions.hasAdminAccessToContainer);
};

const testHasAdminAccessToFederation = () => {
	testHelper('hasAdminAccessToFederation', ModelMiddleware.hasAdminAccessToFederation, Permissions.hasAdminAccessToFederation);
};

const testHasAdminAccessToDrawing = () => {
	testHelper('hasAdminAccessToDrawing', ModelMiddleware.hasAdminAccessToDrawing, Permissions.hasAdminAccessToDrawing);
};

describe(determineTestGroup(__filename), () => {
	testHasReadAccessToContainer();
	testHasWriteAccessToContainer();
	testHasCommenterAccessToContainer();
	testHasAdminAccessToContainer();

	testHasReadAccessToFederation();
	testHasWriteAccessToFederation();
	testHasCommenterAccessToFederation();
	testHasAdminAccessToFederation();

	testHasAdminAccessToDrawing();
});
