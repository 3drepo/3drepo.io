 const { src } = require('../../../../helper/path');

 jest.mock('../../../../../../src/v5/utils/responder');
 const Responder = require(`${src}/utils/responder`);

 jest.mock('../../../../../../src/v5/utils/permissions/permissions');
 const { templates } = require(`${src}/utils/responseCodes`);
 const config = require(`${src}/utils/config`);
 jest.mock('../../../../../../src/v5/models/users');
 const Users = require(`${src}/models/users`);
 jest.mock('../../../../../../src/v5/utils/helper/strings');
 const StringsHelper = require(`${src}/utils/helper/strings`);
 jest.mock('../../../../../../src/v5/utils/helper/userAgent');
 const UserAgentHelper = require(`${src}/utils/helper/userAgent`);
 jest.mock('../../../../../../src/v5/services/eventsManager/eventsManager');
 const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
 jest.mock('../../../../../../src/v5/services/eventsManager/eventsManager.constants');
 const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

 const Auth = require(`${src}/middleware/dataConverter/outputs/auth`);
 
 // Mock respond function to just return the resCode
 Responder.respond.mockImplementation((req, res, errCode) => errCode);
 
 UserAgentHelper.isFromWebBrowser.mockImplementation((userAgent) => userAgent === webBrowserUserAgent);
 StringsHelper.getURLDomain.mockImplementation(() => urlDomain);
 const publishFn = EventsManager.publish.mockImplementation(() => { });

 const webBrowserUserAgent = 'web browser user agent';
 const urlDomain = 'url domain';

 const testRegenerateAuthSession = () => {
    const checkResults = (request) => {
        expect(Responder.respond.mock.calls.length).toBe(1);
        expect(Responder.respond.mock.results[0].value.code).toBe(templates.ok.code);
        expect(publishFn.mock.calls.length).toBe(1);
        expect(publishFn.mock.calls[0][0]).toEqual(events.USER_LOGGED_IN);
        expect(publishFn.mock.calls[0][1]).toEqual({ 
            username: request.body.user,
            sessionID: request.sessionID,
            ipAddress: request.ips[0] || request.ip,
            userAgent: request.headers['user-agent'], 
            referer: request.headers.referer 
        });
    }

    const req = { 
        session: { regenerate: (callback) => { callback() }, cookie: { domain: undefined } },    
        body: { user: 'user1'},
        sessionID: '123',
        ips: ['0.1.2.3'],
        ip: '0.1.2.3',
        headers: { 'x-socket-id': '123' } 
    };

     describe('Regenerate auth session', ()=> {
         test('Should regenerate session', async () => {
            config.cookie.maxAge = 100;
            await Auth.regenerateAuthSession(req, {});
            checkResults(req);
         });

         test('Should regenerate session with request with referer', async () => {
            const reqWithReferer = {...req, headers: { ...req.headers, referer: 'http://abc.com/' } };
            await Auth.regenerateAuthSession(reqWithReferer, {});
            checkResults(reqWithReferer);
         });

         test('Should regenerate session with request with user agent', async () => {
            const reqWithUserAgent = { ...req, headers: { ...req.headers, 'user-agent': 'some user agent' } };
            await Auth.regenerateAuthSession(reqWithUserAgent, {});
            checkResults(reqWithUserAgent);
         });

         test('Should regenerate session with request with web user agent', async () => {
            const reqWithWebUserAgent = {...req, headers: { ...req.headers, 'user-agent': webBrowserUserAgent } };
            await Auth.regenerateAuthSession(reqWithWebUserAgent, {});
            checkResults(reqWithWebUserAgent);
         });

         test('Should regenerate session without cookie.maxAge', async () => {
            config.cookie.maxAge = undefined;
            await Auth.regenerateAuthSession(req, {});
            checkResults(req);
         });

         test('Should regenerate session wit request with empty ips array', async () => {
            const emptyIpsRequest = {...req, ips: [] };
            await Auth.regenerateAuthSession(emptyIpsRequest , {});
            checkResults(emptyIpsRequest);
         });

         test('Should respond with error if the session cannot be regenerated', async () => {
            await Auth.regenerateAuthSession({...req, session: { regenerate: (callback) => { callback(1) }}}, {});
            expect(Responder.respond.mock.calls.length).toBe(1);
            expect(Responder.respond.mock.results[0].value.code).toBe(templates.sessionCouldBeRegenerated.code);
        });
     })
 };

 const testEndSession = () => {
    const req = { 
        session: { destroy: (callback) => { callback() }, user: { username: 'user1' } },    
        body: { user: 'user1'},        
        ips: ['0.1.2.3']
    };

    const res = { clearCookie: () => { } };

     describe('Destroy session', ()=> {
         test('Should destroy session', async () => {
            await Auth.endSession(req, res);
            expect(Responder.respond.mock.calls.length).toBe(1);
            expect(Responder.respond.mock.results[0].value.code).toBe(templates.ok.code);
         });
     })
 };
 
 describe('middleware/dataConverter/outputs/auth', () => {
    testRegenerateAuthSession();
    testEndSession();
 });
 