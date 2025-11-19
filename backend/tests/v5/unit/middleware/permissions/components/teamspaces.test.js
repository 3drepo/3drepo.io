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
const { generateRandomString } = require('../../../../helper/services');

jest.mock('../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../src/v5/utils/permissions');
const Permissions = require(`${src}/utils/permissions`);
const { templates } = require(`${src}/utils/responseCodes`);
const { ADD_ONS: { USERS_PROVISIONED } } = require(`${src}/models/teamspaces.constants`);

jest.mock('../../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);

jest.mock('../../../../../../src/v5/models/teamspaceSettings');
const TeamspaceSettings = require(`${src}/models/teamspaceSettings`);

jest.mock('../../../../../../src/v5/processors/teamspaces');
const TeamspacesProcessor = require(`${src}/processors/teamspaces`);

const TSMiddlewares = require(`${src}/middleware/permissions/components/teamspaces`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
Permissions.isTeamspaceAdmin.mockImplementation((teamspace) => teamspace === 'ts');
Sessions.isSessionValid.mockImplementation((session) => !!session);
Sessions.getUserFromSession.mockImplementation(({ user }) => user?.username);

const app = { get: () => false };
const testIsTeamspaceMember = () => {
	describe('isTeamspaceMember', () => {
		const teamspace = generateRandomString();
		const username = generateRandomString();
		const request = {
			params: { teamspace }, session: { user: { username } }, app,
		};
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			TeamspacesProcessor.isTeamspaceMember.mockResolvedValueOnce(true);
			await TSMiddlewares.isTeamspaceMember(
				request,
				{},
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledWith(teamspace, username, true);
		});

		test('next() should be called if auth bypassed is enabled', async () => {
			const mockCB = jest.fn(() => {});
			await TSMiddlewares.isTeamspaceMember(
				{ ...request, app: { get: () => true } },
				{},
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).not.toHaveBeenCalled();
		});

		test('should respond with teamspace not found if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			TeamspacesProcessor.isTeamspaceMember.mockResolvedValueOnce(false);
			await TSMiddlewares.isTeamspaceMember(
				request,
				{},
				mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(request, {}, templates.teamspaceNotFound);
		});

		test('should respond with error if isTeamspaceMember did not resolve', async () => {
			const mockCB = jest.fn(() => {});
			TeamspacesProcessor.isTeamspaceMember.mockRejectedValueOnce(templates.userNotFound);
			await TSMiddlewares.isTeamspaceMember(
				request,
				{},
				mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(request, {}, templates.userNotFound);
		});
	});
};

const testIsActiveTeamspaceMember = () => {
	describe('isActiveTeamspaceMember', () => {
		const teamspace = generateRandomString();
		const username = generateRandomString();
		const request = {
			params: { teamspace }, session: { user: { username } }, app,
		};
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			TeamspacesProcessor.isTeamspaceMember.mockResolvedValueOnce(true);
			await TSMiddlewares.isTeamspaceMember(
				request,
				{},
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).toHaveBeenCalledWith(teamspace, username, true);
		});

		test('next() should be called if auth bypassed is enabled', async () => {
			const mockCB = jest.fn(() => {});
			await TSMiddlewares.isTeamspaceMember(
				{ ...request, app: { get: () => true } },
				{},
				mockCB,
			);
			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(TeamspacesProcessor.isTeamspaceMember).not.toHaveBeenCalled();
		});

		test('should respond with teamspace not found if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			TeamspacesProcessor.isTeamspaceMember.mockResolvedValueOnce(false);
			await TSMiddlewares.isTeamspaceMember(
				request,
				{},
				mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(request, {}, templates.teamspaceNotFound);
		});

		test('should respond with error if isTeamspaceMember did not resolve', async () => {
			const mockCB = jest.fn(() => {});
			TeamspacesProcessor.isTeamspaceMember.mockRejectedValueOnce(templates.userNotFound);
			await TSMiddlewares.isTeamspaceMember(
				request,
				{},
				mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(request, {}, templates.userNotFound);
		});
	});
};

const testIsTeamspaceAdmin = () => {
	describe('isTeamspaceAdmin', () => {
		test('next() should be called if the user is admin', async () => {
			const mockCB = jest.fn(() => {});
			await TSMiddlewares.isTeamspaceAdmin(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } }, app },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('next() should be called if the auth bypass is enabled', async () => {
			const mockCB = jest.fn(() => {});
			await TSMiddlewares.isTeamspaceAdmin(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } }, app: { get: () => true } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorized if the user is not admin', async () => {
			const mockCB = jest.fn(() => {});
			await TSMiddlewares.isTeamspaceAdmin(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } }, app },
				{},
				mockCB,
			);
			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});
	});
};

const testIsAddOnModuleEnabled = () => {
	describe('isAddOnModuleEnabled', () => {
		const moduleName = generateRandomString();
		const teamspace = generateRandomString();
		const mockCB = jest.fn(() => {});

		test('next() should be called if module is enabled', async () => {
			TeamspaceSettings.isAddOnModuleEnabled.mockResolvedValueOnce(true);
			await TSMiddlewares.isAddOnModuleEnabled(moduleName)({ params: { teamspace } }, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.isAddOnModuleEnabled).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.isAddOnModuleEnabled).toHaveBeenCalledWith(teamspace, moduleName);
		});

		test('should respond with moduleUnavailable if the module is not enabled', async () => {
			TeamspaceSettings.isAddOnModuleEnabled.mockResolvedValueOnce(false);
			await TSMiddlewares.isAddOnModuleEnabled(moduleName)({ params: { teamspace } }, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(templates.moduleUnavailable.code);
			expect(TeamspaceSettings.isAddOnModuleEnabled).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.isAddOnModuleEnabled).toHaveBeenCalledWith(teamspace, moduleName);
		});

		test('should respond with error if the isAddOnModuleEnabled throws error', async () => {
			const error = new Error();
			TeamspaceSettings.isAddOnModuleEnabled.mockRejectedValueOnce(error);
			await TSMiddlewares.isAddOnModuleEnabled(moduleName)({ params: { teamspace } }, {}, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond.mock.results[0].value.code).toEqual(error.code);
			expect(TeamspaceSettings.isAddOnModuleEnabled).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.isAddOnModuleEnabled).toHaveBeenCalledWith(teamspace, moduleName);
		});
	});
};

const testNotUserProvisioned = () => {
	describe('notUserProvisioned', () => {
		const teamspace = generateRandomString();
		const mockCB = jest.fn(() => {});

		test('next() should be called if userProvisioned is not set', async () => {
			TeamspaceSettings.getAddOns.mockResolvedValueOnce({});
			await TSMiddlewares.notUserProvisioned({ params: { teamspace } }, {}, mockCB);

			expect(mockCB).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getAddOns).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getAddOns).toHaveBeenCalledWith(teamspace);
		});

		test('should respond with notAuthorized if userProvisioned is set to true', async () => {
			TeamspaceSettings.getAddOns.mockResolvedValueOnce({ [USERS_PROVISIONED]: true });
			const req = { params: { teamspace } };
			const res = {};
			await TSMiddlewares.notUserProvisioned(req, res, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, templates.userProvisioned);

			expect(TeamspaceSettings.getAddOns).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getAddOns).toHaveBeenCalledWith(teamspace);
		});

		test('should respond with error if getAddOns throws error', async () => {
			const error = new Error();
			TeamspaceSettings.getAddOns.mockRejectedValueOnce(error);
			const req = { params: { teamspace } };
			const res = {};
			await TSMiddlewares.notUserProvisioned(req, res, mockCB);

			expect(mockCB).not.toHaveBeenCalled();
			expect(Responder.respond).toHaveBeenCalledTimes(1);
			expect(Responder.respond).toHaveBeenCalledWith(req, res, error);

			expect(TeamspaceSettings.getAddOns).toHaveBeenCalledTimes(1);
			expect(TeamspaceSettings.getAddOns).toHaveBeenCalledWith(teamspace);
		});
	});
};

describe('middleware/permissions/components/teamspaces', () => {
	testIsTeamspaceMember();
	testIsActiveTeamspaceMember();
	testIsTeamspaceAdmin();
	testIsAddOnModuleEnabled();
	testNotUserProvisioned();
});
