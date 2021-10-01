
const { src } = require('../../../../helper/path');

jest.mock('../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);
jest.mock('../../../../../../src/v5/utils/permissions/permissions');
const Permissions = require(`${src}/utils/permissions/permissions`);
const { templates } = require(`${src}/utils/responseCodes`);

jest.mock('../../../../../../src/v5/utils/sessions');
const Sessions = require(`${src}/utils/sessions`);
const FederationMiddleware = require(`${src}/middleware/permissions/components/federations`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);
Permissions.hasReadAccessToModel.mockImplementation((teamspace) => {
	if (teamspace === 'throwProjectError') {
		throw templates.projectNotFound;
	}
	if (teamspace === 'throwModelError') {
		throw templates.modelNotFound;
	}
	return teamspace === 'ts';
});

Sessions.getUserFromSession.mockImplementation(() => 'hi');

const testHasReadAccessToFederation = () => {
	describe('hasReadAccessToFederation', () => {
		test('next() should be called if the user has access', async () => {
			const mockCB = jest.fn(() => {});
			await FederationMiddleware.hasReadAccessToFederation(
				{ params: { teamspace: 'ts' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(1);
		});

		test('should respond with not authorised if the user has no access', async () => {
			const mockCB = jest.fn(() => {});
			await FederationMiddleware.hasReadAccessToFederation(
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
			await FederationMiddleware.hasReadAccessToFederation(
				{ params: { teamspace: 'throwProjectError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.projectNotFound);
		});

		test('should respond with federationNotFound error if hasReadAccessToFederation threw modelNotFound', async () => {
			const mockCB = jest.fn(() => {});
			await FederationMiddleware.hasReadAccessToFederation(
				{ params: { teamspace: 'throwModelError' }, session: { user: { username: 'hi' } } },
				{},
				mockCB,
			);
			expect(mockCB.mock.calls.length).toBe(0);
			expect(Responder.respond.mock.calls.length).toBe(1);
			expect(Responder.respond.mock.results[0].value).toEqual(templates.federationNotFound);
		});
	});
};

describe('middleware/permissions/components/federations', () => {
	testHasReadAccessToFederation();
});
