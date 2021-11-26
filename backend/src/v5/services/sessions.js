 const expressSession = require("express-session");
 const { getCollection, getSessionStore } = require("../handler/db");
 const C = require("../constants");
 const { getURLDomain } = require("../utils/helper/strings");
 const store = getSessionStore(expressSession);
 const useragent = require("useragent");
 
 module.exports.session = function(config) {
     const isSSL = config.public_protocol === "https";
     return expressSession({
         secret: config.cookie.secret,
         resave: true,
         rolling: true,
         saveUninitialized: false,
         cookie: {
             maxAge: config.cookie.maxAge,
             domain: config.cookie.domain,
             path: "/",
             secure: isSSL,
             // None can only applied with secure set to true, which requires SSL.
             // None is required for embeddable viewer to work.
             sameSite:  isSSL ? "None" : "Lax"
         },
         store: store
     });
 };
 
 module.exports.regenerateAuthSession = (req, config, user) => {
     return new Promise((resolve, reject) => {
         req.session.regenerate((err) => {
             if(err) {
                 reject(err);
             } else {
                 user = {...user, socketId: req.headers[C.HEADER_SOCKET_ID], webSession: false};
 
                 if (req.headers && req.headers["user-agent"]) {
                     const ua = useragent.is(req.headers["user-agent"]);
                     user.webSession = ["webkit", "opera", "ie", "chrome", "safari", "mobile_safari", "firefox", "mozilla", "android"].
                         some(browserType => ua[browserType]); // If any of these browser types matches then is a websession
                 }
 
                 if (req.headers.referer) {
                     user.referer = getURLDomain(req.headers.referer);
                 }
 
                 req.session[C.REPO_SESSION_USER] = user;
                 req.session.cookie.domain = config.cookie_domain;
 
                 if (config.cookie.maxAge) {
                     req.session.cookie.maxAge = config.cookie.maxAge;
                 }
 
                 resolve(req.session);
             }
         });
     });
 };
 
 module.exports.getSessionsByUsername = (username) => {
     const query = {
         "session.user.username": username
     };
 
     return getCollection("admin", "sessions").then(_dbCol => _dbCol.find(query).toArray());
 };
 
 module.exports.removeSessions = (sessionIds) => {
     const query = { _id: { $in: sessionIds } };
     return getCollection("admin", "sessions").then(_dbCol => _dbCol.deleteMany(query));
 };
 