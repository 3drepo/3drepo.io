const { src } = require('../../../../helper/path');

 jest.mock('../../../../../../src/v5/utils/responder');
 const Responder = require(`${src}/utils/responder`);
 jest.mock('../../../../../../src/v5/utils/permissions/permissions');
 const Permissions = require(`${src}/utils/permissions/permissions`);
 const { templates } = require(`${src}/utils/responseCodes`);
 
 jest.mock('../../../../../../src/v5/utils/sessions');
 const Sessions = require(`${src}/utils/sessions`);
 const ProjectMiddlewares = require(`${src}/middleware/permissions/components/projects`);
 
 // Mock respond function to just return the resCode
 Responder.respond.mockImplementation((req, res, errCode) => errCode);
 Permissions.isTeamspaceAdmin.mockImplementation((teamspace) => teamspace === 'ts');
 Permissions.isProjectAdmin.mockImplementation((teamspace, project) => project === 'pr');
 Sessions.isSessionValid.mockImplementation((session) => !!session);
 Sessions.getUserFromSession.mockImplementation(() => 'hi');
 
 const testIsProjectAdmin = () => {
     describe('isProjectAdmin', () => {
         test('next() should be called if the user is teamspace admin', async () => {
             const mockCB = jest.fn(() => {});
             await ProjectMiddlewares.isProjectAdmin(
                 { params: { teamspace: "ts", project: "pr1" }, session: { user: { username: 'hi' } } },
                 {},
                 mockCB,
             );
             expect(mockCB.mock.calls.length).toBe(1);
         });

         test('next() should be called if the user is project admin', async () => {
            const mockCB = jest.fn(() => {});
            await ProjectMiddlewares.isProjectAdmin(
                { params: { teamspace: "ts1", project: "pr" }, session: { user: { username: 'hi' } } },
                {},
                mockCB,
            );
            expect(mockCB.mock.calls.length).toBe(1);
        });
 
         test('should respond with not authorised if the user is not project admin', async () => {
             const mockCB = jest.fn(() => {});
             await ProjectMiddlewares.isProjectAdmin(
                 { params: { teamspace: "ts1", project: "pr1" }, session: { user: { username: 'hi' } } },
                 {},
                 mockCB,
             );
             expect(mockCB.mock.calls.length).toBe(0);
             expect(Responder.respond.mock.calls.length).toBe(1);
             expect(Responder.respond.mock.results[0].value).toEqual(templates.notAuthorized);
         });
     });
 };
 
 describe('middleware/permissions/components/projects', () => {
    testIsProjectAdmin();
 });
 