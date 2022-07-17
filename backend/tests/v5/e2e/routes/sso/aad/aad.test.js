const SuperTest = require('supertest');
const ServiceHelper = require('../../../../helper/services');
const { src } = require('../../../../helper/path');
const session = require('supertest-session');
const AadConstants = require('../../../../../../src/v5/routes/sso/aad/aad.constants');
const { getAuthenticationCodeUrl } = require('../../../../../../src/v5/utils/sso/aad');
const { generateRandomString } = require('../../../../helper/services');

const { templates } = require(`${src}/utils/responseCodes`);

let testSession;
let server;
let agent;

const testAuthenticate = () => {
    describe('Sign Up Authenticate', () => {
        test('should redirect the user to Microsoft authentication page', async () => {
            const res = await agent.get('/v5/sso/aad/authenticate')            
                .expect(templates.found.status);
            
            expect(res.headers.location).toEqual(
                expect.stringContaining('https://login.microsoftonline.com/common/oauth2/v2.0/authorize'));
        });
    });
};

const testAuthenticatePost = () => {
    describe('Sign Up Authenticate Post', () => {
        test('should redirect the user to ', async () => {
            const randomUrl = generateRandomString();
            const res = await agent.get(`/v5/sso/aad/authenticate-post?state=${randomUrl}`)
                .expect(templates.found.status);
            expect(res.headers.location).toEqual(expect.stringMatching(randomUrl));
        });
    });
};

const app = ServiceHelper.app();

describe('E2E routes/sso/aad', () => {
    beforeAll(async () => {
        server = app;
        agent = await SuperTest(server);
        testSession = session(app);
    });

    afterAll(() => ServiceHelper.closeApp(server));

    testAuthenticate();
    testAuthenticatePost();
});
