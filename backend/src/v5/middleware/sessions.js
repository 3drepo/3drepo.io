 const config = require('../utils/config');
 const { events } = require('../services/eventsManager/eventsManager.constants');
 const { getURLDomain } = require('../utils/helper/strings');
 const { isFromWebBrowser } = require('../utils/helper/userAgent');
 const { publish } = require('../services/eventsManager/eventsManager');
 const { respond } = require('../utils/responder');
 const { templates } = require('../utils/responseCodes');
 
 const Sessions = {};
 
 Sessions.createSession = (req, res) => {
     req.session.regenerate((err) => {
         if (err) {
             respond(req, res, templates.sessionCouldBeRegenerated);
         } else {
             const updatedUser = { ...req.loginData, socketId: req.headers['x-socket-id'], webSession: false };
 
             if (req?.headers['user-agent']) {
                 updatedUser.webSession = isFromWebBrowser(req.headers['user-agent']);
             }
 
             if (req.headers.referer) {
                 updatedUser.referer = getURLDomain(req.headers.referer);
             }
 
             req.session.user = updatedUser;
             req.session.cookie.domain = config.cookie_domain;
 
             if (config.cookie.maxAge) {
                 req.session.cookie.maxAge = config.cookie.maxAge;
             }
 
             publish(events.SESSION_CREATED, { username: req.body.user,
                 sessionID: req.sessionID,
                 ipAddress: req.ips[0] || req.ip,
                 userAgent: req.headers['user-agent'],
                 referer: req.headers.referer });
 
             respond(req, res, templates.ok);
         }
     });
 };
 
 Sessions.destroySession = (req, res) => {
     const username = req.session?.user?.username;
     try {
         req.session.destroy(() => {
             res.clearCookie('connect.sid', { domain: config.cookie_domain, path: '/' });
             const session = { user: { username } };
             respond({ ...req, session }, res, templates.ok);
         });
     } catch (err) {
         // istanbul ignore next
         respond(req, res, err);
     }
 };
 
 module.exports = Sessions;
 