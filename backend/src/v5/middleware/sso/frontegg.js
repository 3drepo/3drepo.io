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

const { codeExists, createResponseCode, templates } = require('../../utils/responseCodes');
const { fromBase64, toBase64 } = require('../../utils/helper/strings');
const { generateAuthenticationCodeUrl, generateToken, getUserInfoFromToken } = require('../../services/sso/frontegg');
const { addPkceProtection } = require('./pkce');
const { logger } = require('../../utils/logger');
const { respond } = require('../../utils/responder');
const { setSessionInfo } = require('.');
const { validateMany } = require('../common');

const AuthSSO = {};

const checkStateIsValid = async (req, res, next) => {
	try {
		const { state, code } = req.query;

		if (!(state && code)) {
			throw createResponseCode(templates.invalidArguments, 'Response body does not contain code or state');
		}
		req.state = { ...JSON.parse(fromBase64(state)), code };
		if (req.session.csrfToken !== req.state.csrfToken) {
			throw createResponseCode(templates.invalidArguments, 'CSRF Token mismatched. Please clear your cookies and try again');
		}

		await next();
	} catch (err) {
		const response = codeExists(err.code) ? err
			: createResponseCode(templates.invalidArguments, 'state is required and must be a valid encoded JSON');

		respond(req, res, response);
	}
};

const getToken = (urlUsed) => async (req, res, next) => {
	try {
		const token = await generateToken(urlUsed, req.state.code, req.session.pkceCodes.challenge);
		const { userId, email } = await getUserInfoFromToken(token);
		req.loginData = {
			token, userId, email,
		};

		await next();
	} catch (err) {
		logger.logError(`Failed to generate token from vendor: ${err.message}`);
		respond(req, res, templates.unknown);
	}
};

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

		const link = generateAuthenticationCodeUrl(req.authParams);
		respond(req, res, templates.ok, { link });
	} catch (err) {
		respond(req, res, err);
	}
};

AuthSSO.redirectToStateURL = (req, res) => {
	try {
		res.redirect(req.state.redirectUri);
	} catch (err) {
		logger.logError(`Failed to redirect user back to the specified URL: ${err.message}`);
		respond(req, res, templates.unknown);
	}
};

AuthSSO.generateLinkToAuthenticator = (redirectURL) => validateMany([addPkceProtection, setSessionInfo,
	redirectForAuth(redirectURL)]);

AuthSSO.generateToken = (redirectURLUsed) => validateMany([checkStateIsValid, getToken(redirectURLUsed)]);

module.exports = AuthSSO;
