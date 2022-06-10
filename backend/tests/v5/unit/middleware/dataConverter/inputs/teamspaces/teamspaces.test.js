const { generateRandomString } = require('../../../../../helper/services');
const { src } = require('../../../../../helper/path');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

jest.mock('../../../../../../../src/v5/models/users');
const UsersModel = require(`${src}/models/users`);

jest.mock('../../../../../../../src/v5/utils/permissions/permissions');
const PermissionsUtils = require(`${src}/utils/permissions/permissions`);

const Teamspaces = require(`${src}/middleware/dataConverter/inputs/teamspaces`);
const { templates } = require(`${src}/utils/responseCodes`);

// Mock respond function to just return the resCode
Responder.respond.mockImplementation((req, res, errCode) => errCode);

const adminUser = generateRandomString();
const nonAdminUser = generateRandomString();
const usernameToRemove = generateRandomString();
const nonExistingUsernameToRemove = generateRandomString();
const teamspace = generateRandomString();

UsersModel.getUserByUsername.mockImplementation((username) => {
    if (username === nonExistingUsernameToRemove) {
        throw templates.userNotFound;
    };
});

PermissionsUtils.isTeamspaceAdmin.mockImplementation((teamspace, user) => user === adminUser);

const testCanRemoveTeamspaceMember = () => {
    describe.each([
        ['User to remove is the owner of teamspace', { session: { user: { username: adminUser } }, 
            params: { teamspace, username: teamspace } }, false],
        ['Logged in user is not a teamspace admin', { session: { user: { username: nonAdminUser } },
            params: { teamspace, username: adminUser } }, false],
        ['User to be removed does not exist', { session: { user: { username: adminUser } },
            params: { teamspace, username: nonExistingUsernameToRemove } }, false],
        ['Logged in user is not a teamspace admin but remmove themselves', { session: { user: { username: nonAdminUser } }, 
            params: { teamspace, username: nonAdminUser } }, true],
        ['Logged in user is a teamspace admin', { session: { user: { username: adminUser } }, 
            params: { teamspace, username: usernameToRemove } }, true],
    ])('Can remove team member', (desc, req, success) => {
        test(`${desc} ${success ? 'should call next()' : 'should respond with invalidArguments'}`, async () => {
            const mockCB = jest.fn();
            await Teamspaces.canRemoveTeamspaceMember(req, {}, mockCB);

            if (success) {
                expect(mockCB.mock.calls.length).toBe(1);
            } else {
                expect(mockCB.mock.calls.length).toBe(0);
                expect(Responder.respond.mock.calls.length).toBe(1);
                expect(Responder.respond.mock.results[0].value.code).toEqual(templates.invalidArguments.code);
            }
        });
    });
};

describe('middleware/dataConverter/inputs/teamspaces', () => {
    testCanRemoveTeamspaceMember();
});
