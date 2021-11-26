 const { loggedOut } = require('../../../models/chatEvent');
 const { events } = require('../../eventsManager/eventsManager.constants');
 const { saveLoginRecord } = require('../../../models/loginRecord');
 const { subscribe } = require('../../eventsManager/eventsManager');
 const { createLoginRecord } = require("../../../handler/elastic");

 const userLoggedIn = async ({
     username, sessionID, ipAddress, userAgent, referrer, oldSessions
 }) => {

	if (oldSessions) {
        const ids = [];

		oldSessions.forEach(entry => {
			if (entry._id === req.session.id || !entry.session.user.webSession) {
				return;
			}
			ids.push(entry._id);
			loggedOut(entry.session.user.socketId);
		});

		removeSessions(ids);
	}

	const loginRecord = await saveLoginRecord(sessionID, username, ipAddress, userAgent , referrer);
	createLoginRecord(username, loginRecord);
 };
 
 const AuthEventsListener = {};
 
 AuthEventsListener.init = () => {
    subscribe(events.USER_LOGGED_IN, userLoggedIn); 
 };
 
 module.exports = AuthEventsListener;
 