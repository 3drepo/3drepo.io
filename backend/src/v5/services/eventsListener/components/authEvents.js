 const { loggedOut } = require('../../../models/chatEvent');
 const { events } = require('../../eventsManager/eventsManager.constants');
 const { saveLoginRecord } = require('../../../models/loginRecord');
 const { subscribe } = require('../../eventsManager/eventsManager');
 
 const userLoggedIn = ({
     username, sessionID, ipAddress, userAgent, referrer, oldSessions
 }) => {
    saveLoginRecord(sessionID, username, ipAddress, userAgent , referrer);

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
 };
 
 const AuthEventsListener = {};
 
 AuthEventsListener.init = () => {
    subscribe(events.USER_LOGGED_IN, userLoggedIn); 
 };
 
 module.exports = AuthEventsListener;
 