/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { URL } = require('url');
const { appendCSRFToken } = require('../sessions');
const { getURLDomain } = require('../../utils/helper/strings');
const { validateMany } = require('../common');

const Sso = {};

Sso.redirectWithError = (res, url, errorCode) => {
	const urlRedirect = new URL(url);
	urlRedirect.searchParams.set('error', errorCode);
	res.redirect(urlRedirect.href);
};

const setSessionInfo = async (req, res, next) => {
	const ssoInfo = {
		userAgent: req.headers['user-agent'],
		...(req.headers.referer ? { referer: getURLDomain(req.headers.referer) } : { }),
	};

	req.session.ssoInfo = ssoInfo;

	req.session.token = req.token;
	await next();
};

Sso.setSessionInfo = validateMany([appendCSRFToken, setSessionInfo]);

module.exports = Sso;
