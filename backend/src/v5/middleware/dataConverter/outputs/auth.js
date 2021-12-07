 const { respond } = require('../../../utils/responder');
 const { templates } = require('../../../utils/responseCodes');
 const config = require('../../../utils/config');
 const { getURLDomain } = require('../../../utils/helper/strings');
 const useragent = require('useragent');
 const { publish } = require('../../../services/eventsManager/eventsManager');
 const { events } = require('../../../services/eventsManager/eventsManager.constants');

 const Auth = {};
 
 Auth.regenerateAuthSession = (req, res) => {
	req.session.regenerate((err) => {
		if (err) {
			reject(err);
		} else {
			const updatedUser = { ...req.loginData, socketId: req.headers['x-socket-id'], webSession: false };

			if (req?.headers['user-agent']) {
				const ua = useragent.is(req.headers['user-agent']);
				updatedUser.webSession = ['webkit', 'opera', 'ie', 'chrome', 'safari', 'mobile_safari', 'firefox', 'mozilla', 'android']
					.some((browserType) => ua[browserType]); // If any of these browser types matches then is a websession
			}

			if (req.headers.referer) {
				updatedUser.referer = getURLDomain(req.headers.referer);
			}

			req.session.user = updatedUser;
			req.session.cookie.domain = config.cookie_domain;

			if (config.cookie.maxAge) {
				req.session.cookie.maxAge = config.cookie.maxAge;
			}

			publish(events.USER_LOGGED_IN, { username: req.body.user, sessionID: req.sessionID, ipAddress: req.ips[0] || req.ip,
				userAgent: req.headers['user-agent'], referer: req.headers.referer });

			respond(req, res, templates.ok);
		}
	});
};

Auth.endSession = (req, res) => {
    const username = req.session?.user?.username;
	try {
		req.session.destroy(() => {
			res.clearCookie('connect.sid', { domain: config.cookie_domain, path: '/' });
			const session = { user: { username } };
			respond({...req, session }, res, templates.ok);
		});
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
}
 
 module.exports = Auth;
 