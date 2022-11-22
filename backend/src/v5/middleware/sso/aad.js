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
const { authenticateRedirectUri, signupRedirectUri } = require('../../services/sso/aad/aad.constants');
const { createResponseCode, templates } = require('../../utils/responseCodes');
const { errorCodes, providers } = require('../../services/sso/sso.constants');
const { getAuthenticationCodeUrl, getUserDetails } = require('../../services/sso/aad');
const { URL } = require('url');
const { addPkceProtection } = require('./pkce');
const { getUserByEmail } = require('../../models/users');
const { logger } = require('../../utils/logger');
const { respond } = require('../../utils/responder');
const { validateMany } = require('../common');

const Aad = {};

const checkStateIsValid = async (req, res, next) => {
	try {
		req.state = JSON.parse(req.query.state);
		await next();
	} catch (err) {
		logger.logError('Failed to parse req.query.state');
		respond(req, res, templates.unknown);
	}
};

const redirectWithError = (res, url, errorCode) => {
	const urlRedirect = new URL(url);
	urlRedirect.searchParams.set('error', errorCode);
	res.redirect(urlRedirect.href);
};

const authenticate = (redirectUri) => async (req, res) => {
	try {
		if (!req.query.redirectUri) {
			respond(req, res, createResponseCode(templates.invalidArguments, 'redirectUri(query string) is required'));
			return;
		}

		req.authParams = {
			redirectUri,
			state: JSON.stringify({
				redirectUri: req.query.redirectUri,
				...(req.body || {}),
			}),
			codeChallenge: req.session.pkceCodes.challenge,
			codeChallengeMethod: req.session.pkceCodes.challengeMethod,
		};

		res.redirect(await getAuthenticationCodeUrl(req.authParams));
	} catch (err) {
		respond(req, res, err);
	}
};

const verifyNewUserDetails = async (req, res, next) => {
	try {
		const { data: { mail, givenName, surname, id } } = await getUserDetails(req.query.code,
			signupRedirectUri, req.session.pkceCodes?.verifier);

		const user = await getUserByEmail(mail, { 'customData.sso': 1 }).catch(() => undefined);
		if (user) {
			throw user.customData.sso ? errorCodes.emailExistsWithSSO : errorCodes.emailExists;
		} else {
			req.body = {
				...req.state,
				email: mail,
				firstName: givenName,
				lastName: surname,
				sso: { type: providers.AAD, id },
			};

			delete req.body.redirectUri;
			await next();
		}
	} catch (errorCode) {
		redirectWithError(res, req.state.redirectUri, errorCode);
	}
};

Aad.verifyNewUserDetails = validateMany([checkStateIsValid, verifyNewUserDetails]);

Aad.redirectToStateURL = (req, res) => {
	try {
		res.redirect(req.state.redirectUri);
	} catch (err) {
		logger.logError(`Failed to redirect user back to the specified URL: ${err.message}`);
		respond(req, res, templates.unknown);
	}
};

Aad.authenticate = (redirectUri) => validateMany([addPkceProtection, authenticate(redirectUri)]);

const hasAssociatedAccount = async (req, res, next) => {
	try {
		const { data: { id, mail } } = await getUserDetails(req.query.code, authenticateRedirectUri,
			req.session.pkceCodes?.verifier);

		const { user, customData: { sso } } = await getUserByEmail(mail, { _id: 0, user: 1, 'customData.sso': 1 });

		if (sso?.id !== id) {
			throw errorCodes.nonSsoUser;
		} else {
			req.loginData = { username: user };
			await next();
		}
	} catch (err) {
		let errorCode = err;

		if (errorCode === templates.userNotFound) errorCode = errorCodes.userNotFound;

		redirectWithError(res, req.state.redirectUri, errorCode);
	}
};

Aad.hasAssociatedAccount = validateMany([checkStateIsValid, hasAssociatedAccount]);

module.exports = Aad;
