const { getSessionsByUsername, removeSessions } = require('../models/sessions');
const { login, getUserByEmail, getUserByUsername } = require('../models/users');
const { hasEmailFormat } = require('../utils/helper/strings');
const { regenerateAuthSession } = require('../../v4/services/session')
const config = require('../utils/config');
const Auth = {};
const { saveLoginRecord } = require('../models/loginRecord');
const { templates } = require('../utils/responseCodes');

Auth.login = async (userNameOrEmail, password, req) => {
	let user = null;
	if (hasEmailFormat(userNameOrEmail)) {
		user = await getUserByEmail(userNameOrEmail);
	} else {
		user = await getUserByUsername(userNameOrEmail);
	}

	if (isAccountLocked(user)) {
		throw templates.tooManyLoginAttempts;
	}

	const loginData = await login(user, password);
	await createSession(req, loginData);
	return loginData;
};

const isAccountLocked = function (user) {
	const currentTime = new Date();

	return user && user.customData && user.customData.loginInfo &&
		user.customData.loginInfo.failedLoginCount && user.customData.loginInfo.lastFailedLoginAt &&
		user.customData.loginInfo.failedLoginCount >= config.loginPolicy.maxUnsuccessfulLoginAttempts &&
		currentTime - user.customData.loginInfo.lastFailedLoginAt < config.loginPolicy.lockoutDuration;
};

const createSession = async (req, user) => {
	await regenerateAuthSession(req, config, user)
		.then(() => {
			saveLoginRecord(req.sessionID, user.username, req.ips[0] || req.ip, req.headers["user-agent"] ,req.header("Referer"));
			return Auth.getSessionsByUsername(user.username);
		})
		.then(sessions => { // Remove other sessions with the same username
			if (!req.session.user.webSession) {
				return null;
			}

			const ids = [];

			sessions.forEach(entry => {
				if (entry._id === req.session.id || !entry.session.user.webSession) {
					return;
				}
				ids.push(entry._id);
				//chatEvent.loggedOut(entry.session.user.socketId);
			});

			return Auth.removeSessions(ids);
		});
}


Auth.getSessionsByUsername = getSessionsByUsername;

Auth.removeSessions = removeSessions;

module.exports = Auth;
