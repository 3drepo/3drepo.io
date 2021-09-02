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

const { v4Path } = require('../../interop');
// FIXME: can remove the disable once we migrated config
// eslint-disable-next-line
const { apiUrls } = require(`${v4Path}/config`);
const { getURLDomain } = require('./helper/strings');

const referrerMatch = (sessionReferrer, headerReferrer) => {
	const domain = getURLDomain(headerReferrer);
	return domain === sessionReferrer
        || apiUrls.all.some((api) => api.match(domain));
};

const SessionUtils = {};

SessionUtils.isSessionValid = (session, referrer) => !!(session?.user
	&& (session.user.isAPIKey || (!referrer || referrerMatch(session.user.referer, referrer))));

SessionUtils.getUserFromSession = ({ user } = {}) => (user ? user.username : undefined);

module.exports = SessionUtils;
