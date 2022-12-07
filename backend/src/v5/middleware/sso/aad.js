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
const { authenticateRedirectUri, linkRedirectUri, signupRedirectUri } = require('../../services/sso/aad/aad.constants');
const { createResponseCode, templates } = require('../../utils/responseCodes');
const { errorCodes, providers } = require('../../services/sso/sso.constants');
const { getAuthenticationCodeUrl, getUserDetails } = require('../../services/sso/aad');
const { getUserByEmail, getUserByQuery, getUserByUsername } = require('../../models/users');
const { URL } = require('url');
const { addPkceProtection } = require('./pkce');
const { getURLDomain } = require('../../utils/helper/strings');
const { getUserFromSession } = require('../../utils/sessions');
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
		respond(req, res, createResponseCode(templates.invalidArguments, 'state(query string) is required and must be valid JSON'));
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
		const { id, email, firstName, lastName } = await getUserDetails(req.query.code,
			signupRedirectUri, req.session.pkceCodes?.verifier);

		const user = await getUserByEmail(email, { 'customData.sso': 1 }).catch(() => undefined);
		if (user) {
			throw user.customData.sso ? errorCodes.EMAIL_EXISTS_WITH_SSO : errorCodes.EMAIL_EXISTS;
		} else {
			req.body = {
				...req.state,
				email,
				firstName,
				lastName,
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

Aad.verifyNewEmail = async (req, res, next) => {
	try {
		const username = getUserFromSession(req.session);
		const { data: { mail, id } } = await getUserDetails(req.query.code,
			linkRedirectUri, req.session.pkceCodes?.verifier);

		const user = await getUserByQuery({ 'customData.email': mail, user: { $ne: username } },
			{ 'customData.sso': 1 }).catch(() => undefined);
		if (user) {
			throw errorCodes.emailExists;
		} else {
			req.body = { email: mail, sso: { type: providers.AAD, id } };
			await next();
		}
	} catch (errorCode) {
		const state = JSON.parse(req.query.state);
		redirectWithError(res, state.redirectUri, errorCode);
	}
};

Aad.redirectToStateURL = (req, res) => {
	try {
		res.redirect(req.state.redirectUri);
	} catch (err) {
		logger.logError(`Failed to redirect user back to the specified URL: ${err.message}`);
		respond(req, res, templates.unknown);
	}
};

const setSessionReferer = async (req, res, next) => {
	if (req.headers.referer) {
		req.session.referer = getURLDomain(req.headers.referer);
	}

	await next();
};

Aad.authenticate = (redirectUri) => validateMany([addPkceProtection, setSessionReferer, authenticate(redirectUri)]);

const hasAssociatedAccount = async (req, res, next) => {
	try {
		const { id, email } = await getUserDetails(req.query.code, authenticateRedirectUri,
			req.session.pkceCodes?.verifier);

		const { user, customData: { sso } } = await getUserByEmail(email, { _id: 0, user: 1, 'customData.sso': 1 });

		if (sso?.id !== id) {
			throw errorCodes.NON_SSO_USER;
		} else {
			req.loginData = { username: user };
			await next();
		}
	} catch (err) {
		let errorCode = err;

		if (errorCode === templates.userNotFound) errorCode = errorCodes.USER_NOT_FOUND;

		redirectWithError(res, req.state.redirectUri, errorCode);
	}
};

Aad.hasAssociatedAccount = validateMany([checkStateIsValid, hasAssociatedAccount]);

const isSsoUser = async (req) => {
	const username = getUserFromSession(req.session);
	const { customData: { sso } } = await getUserByUsername(username);
	return !!sso;
};

Aad.isSsoUser = async (req, res, next) => {
	try {
		if (!await isSsoUser(req)) {
			throw templates.nonSsoUser;
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Aad.isNonSsoUser = async (req, res, next) => {
	try {
		if (await isSsoUser(req)) {
			throw templates.ssoUser;
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

module.exports = Aad;
