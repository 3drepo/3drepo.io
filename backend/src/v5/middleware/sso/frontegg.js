/**
 *  Copyright (C) 2025 3D Repo Ltd
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

const { createResponseCode, templates } = require('../../utils/responseCodes');
const { addPkceProtection } = require('./pkce');
const { getAuthenticationCodeUrl } = require('../../services/sso/frontegg');
const { respond } = require('../../utils/responder');
const { setSessionInfo } = require('.');
const { toBase64 } = require('../../utils/helper/strings');
const { validateMany } = require('../common');

const AuthSSO = {};

const redirectForAuth = (redirectURL) => (req, res) => {
	try {
		if (!req.query.redirectUri) {
			respond(req, res, createResponseCode(templates.invalidArguments, 'redirectUri(query string) is required'));
			return;
		}

		req.authParams = {
			redirectURL,
			state: toBase64(JSON.stringify({
				csrfToken: req.session.csrfToken,
				redirectUri: req.query.redirectUri,
			})),
			codeChallenge: req.session.pkceCodes.challenge,
		};

		const link = getAuthenticationCodeUrl(req.authParams);
		respond(req, res, templates.ok, { link });
	} catch (err) {
		respond(req, res, err);
	}
};

AuthSSO.getLinkToAuthenticator = (redirectURL) => validateMany([addPkceProtection, setSessionInfo,
	redirectForAuth(redirectURL)]);

module.exports = AuthSSO;
