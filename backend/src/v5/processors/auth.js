const { login, getUserByEmail, getUserByUsername } = require('../models/users');
const { hasEmailFormat } = require('../utils/helper/strings');
const { getSessionsByUsername, regenerateAuthSession } = require('../services/sessions');
const { publish } = require("../services/eventsManager/eventsManager");
const { events } = require("../services/eventsManager/eventsManager.constants");
const config = require('../utils/config');
const Auth = {};
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
};

const isAccountLocked = function (user) {
	const currentTime = new Date();

	return user && user.customData && user.customData.loginInfo &&
		user.customData.loginInfo.failedLoginCount && user.customData.loginInfo.lastFailedLoginAt &&
		user.customData.loginInfo.failedLoginCount >= config.loginPolicy.maxUnsuccessfulLoginAttempts &&
		currentTime - user.customData.loginInfo.lastFailedLoginAt < config.loginPolicy.lockoutDuration;
};

const createSession = async (req, user) => {
	await regenerateAuthSession(req, config, user);
	
	const sessions = req.session.user.webSession ? await getSessionsByUsername(user.username) : null;	

	publish(events.USER_LOGGED_IN, { username: user.username, sessionID: req.sessionID, 
		ipAddress: req.ips[0] || req.ip , userAgent: req.headers["user-agent"], referrer: req.header("Referer"), oldSessionIds: sessions });
}

module.exports = Auth;
