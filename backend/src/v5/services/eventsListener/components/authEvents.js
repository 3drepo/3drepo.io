/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const { events } = require('../../eventsManager/eventsManager.constants');
const { removeOldSessions } = require('../../sessions');
const { saveLoginRecord } = require('../../../models/loginRecord');
const { subscribe } = require('../../eventsManager/eventsManager');

const userLoggedIn = async ({ username, sessionID, ipAddress, userAgent, referer }) => {	
	await saveLoginRecord(username, sessionID, ipAddress, userAgent, referer);
	await removeOldSessions(username, sessionID);
};

const AuthEventsListener = {};

AuthEventsListener.init = () => {
	subscribe(events.USER_LOGGED_IN, userLoggedIn);
};

module.exports = AuthEventsListener;
