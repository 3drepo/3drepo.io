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

Sessions.getUserFromSession.mockImplementation(() => 'hi');

const testHasReadAccessToContainer = () => {
	describe('hasReadAccessToContainer', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasReadAccessToContainer(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasReadAccessToContainer(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with projectNotFound error if hasReadAccessToContainer threw projectNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasReadAccessToContainer(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

const testHasWriteAccessToContainer = () => {
	describe('hasWriteAccessToContainer', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasWriteAccessToContainer(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasWriteAccessToContainer(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with projectNotFound error if hasReadAccessToContainer threw projectNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasWriteAccessToContainer(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

const testHasCommenterAccessToContainer = () => {
	describe('hasCommenterAccessToContainer', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasCommenterAccessToContainer(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasCommenterAccessToContainer(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with projectNotFound error if hasReadAccessToContainer threw projectNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasCommenterAccessToContainer(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

const testHasReadAccessToFederation = () => {
	describe('hasReadAccessToFederation', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasReadAccessToFederation(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasReadAccessToFederation(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with projectNotFound error if hasReadAccessToFederation threw projectNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasReadAccessToFederation(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

const testHasWriteAccessToFederation = () => {
	describe('hasWriteAccessToFederation', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasWriteAccessToFederation(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasWriteAccessToFederation(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with projectNotFound error if hasReadAccessToFederation threw projectNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasWriteAccessToFederation(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

const testHasCommenterAccessToFederation = () => {
	describe('hasCommenterAccessToFederation', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasCommenterAccessToFederation(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasCommenterAccessToFederation(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with projectNotFound error if hasReadAccessToFederation threw projectNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasCommenterAccessToFederation(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

const testHasAdminAccessToDrawing = () => {
	describe('hasAdminAccessToDrawing', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasAdminAccessToDrawing(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasAdminAccessToDrawing(
				{ params: { teamspace: 'ts1' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
		});

		test('should respond with projectNotFound error if hasReadAccessToDrawing threw projectNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await ModelMiddleware.hasAdminAccessToDrawing(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});
	});
};

describe('middleware/permissions/components/models', () => {
	testHasReadAccessToContainer();
	testHasWriteAccessToContainer();
	testHasCommenterAccessToContainer();

	testHasAdminAccessToDrawing();

	testHasReadAccessToFederation();
	testHasWriteAccessToFederation();
	testHasCommenterAccessToFederation();
});
