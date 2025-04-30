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
const {
	destroyAllSessions,
	doesUserExist,
	generateAuthenticationCodeUrl,
	generateToken,
	getClaimedDomains,
	getTeamspaceByAccount,
	getUserById,
	getUserInfoFromToken,
} = require('../../services/sso/frontegg');
const { fromBase64, toBase64 } = require('../../utils/helper/strings');

const { getUserByEmail, getUserByUsername, updateUserId } = require('../../models/users');
const { redirectWithError, setSessionInfo } = require('.');
const Yup = require('yup');
const { addPkceProtection } = require('./pkce');
const { createNewUserRecord } = require('../../processors/users');
const { destroySession } = require('../../utils/sessions');
const { types: { strings: { email: emailSchema } } } = require('../../utils/helper/yup');
const { errorCodes } = require('../../services/sso/sso.constants');
const { generateUUIDString } = require('../../utils/helper/uuids');
const { getTeamspaceRefId } = require('../../models/teamspaceSettings');
const { logger } = require('../../utils/logger');
const { respond } = require('../../utils/responder');
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
			: createResponseCode(templates.invalidArguments, 'Variable "state" is required and must be a valid encoded JSON');

		destroySession(req.session, res, () => {
			respond(req, res, response);
		});
	}
};

const determineUsername = async (userId, email) => {
	try {
		const { user: username, customData } = await getUserByEmail(email, { user: 1, 'customData.userId': 1 });

		if (userId !== customData.userId) {
			await updateUserId(username, userId);
		}
		return username;
	} catch (err) {
		if (err.code !== templates.userNotFound.code) {
			throw err;
		}
		logger.logDebug(`User not found: ${userId}, creating user based on info from IDP...`);
		const userData = await getUserById(userId);

		return createNewUserRecord(userData);
	}
};

const getUserDetails = async (req, res, next) => {
	try {
		const { auth } = req;
		const { userId, email, authAccount, accounts } = await getUserInfoFromToken(auth.tokenInfo.token);
		const username = await determineUsername(userId, email);

		const teamspaces = await Promise.all(accounts.map(getTeamspaceByAccount));

		auth.userId = userId;
		auth.teamspaces = teamspaces.filter((entry) => !!entry);
		auth.authenticatedTeamspace = await getTeamspaceByAccount(authAccount);

		req.loginData = {
			auth, username,
		};
		await next();
	} catch (err) {
		logger.logError(`Failed to fetch user information: ${err.message}`);
		redirectWithError(res, req.state.redirectUri, errorCodes.UNKNOWN);
	}
};

const getToken = (urlUsed) => async (req, res, next) => {
	try {
		const tokenInfo = await generateToken(urlUsed, req.state.code, req.session.pkceCodes.challenge);
		req.auth = { tokenInfo };
		await next();
	} catch (err) {
		logger.logError(`Failed to generate token from vendor: ${err.message}`);
		redirectWithError(res, req.state.redirectUri, errorCodes.UNKNOWN);
	}
};

const determineAuthAccount = async (email, accounts, preferredAccount) => {
	/*
	 * Frontegg doesn't allow password authentication if the user is subscribed to a SSO configured
	 * account, it will result in an error. so we want the prioritisation is:
	 * 1. the active teamspace if it is SSO configured and domain matches
	 * 2. any SSO configured account if domain matches
	 * 3. the active teamspace
	 */

	const emailDomain = email.split('@')[1];

	// check preferredAccount first so it take precedence
	const accountsToCheck = [preferredAccount, ...accounts];

	for (const account of accountsToCheck) {
		// eslint-disable-next-line no-await-in-loop
		const domains = await getClaimedDomains(account);
		if (domains.includes(emailDomain)) {
			return account;
		}
	}
	return preferredAccount;
};

const redirectForAuth = (redirectURL) => async (req, res) => {
	try {
		const queryValidator = Yup.object({
			redirectUri: Yup.string().min(1).required(),
			email: emailSchema,
		}).required();

		await queryValidator.validate(req.query, { strict: true }).catch(({ message }) => {
			throw createResponseCode(templates.invalidArguments, message);
		});

		let accountId;
		if (req.params.teamspace) {
			accountId = req.params.accountId ?? await getTeamspaceRefId(req.params.teamspace);
			req.session.reAuth = true;
		} else if (req.query.email) {
			const userId = await doesUserExist(req.query.email);
			if (userId) {
				const { tenantId, tenantIds = [] } = await getUserById(userId);
				accountId = await determineAuthAccount(req.query.email, tenantIds, tenantId ?? tenantIds[0]);
			} else {
				// generate a fake accountId to ensure the response doesn't reveal whether
				// the email is a user
				accountId = generateUUIDString();
			}
		}

		const authParams = {
			redirectURL,
			state: toBase64(JSON.stringify({
				csrfToken: req.session.csrfToken,
				redirectUri: req.query.redirectUri,
			})),
			codeChallenge: req.session.pkceCodes.challenge,
			email: req.query.email,
		};

		const link = await generateAuthenticationCodeUrl(authParams, accountId);
		respond(req, res, templates.ok, { link });
	} catch (err) {
		respond(req, res, err);
	}
};

const removeFronteggSessionIfNeeded = async (req, res, next) => {
	const { teamspace } = req.params;
	const { authenticatedTeamspace, userId } = req.session.user.auth;
	try {
		if (teamspace !== authenticatedTeamspace) {
		// we want to wipe the frontegg session and force the user to relogin over there if
		// the user is trying to authenticate against a teamspace with SSO connections
		// and the user email is one of the claimed domains

			const accountId = await getTeamspaceRefId(req.params.teamspace);
			const { username } = req.session.user;
			const [domains, { customData: { email } }] = await Promise.all([
				getClaimedDomains(accountId),
				getUserByUsername(username, { 'customData.email': 1 }),
			]);

			const emailDomain = email.split('@')[1];

			req.params.accountId = accountId;
			req.query.email = email;

			if (domains.includes(emailDomain)) {
				await destroyAllSessions(userId);
			}
		}
		await next();
	} catch (err) {
		logger.logError(`Could not detect SSO configuration: ${err.message}`);
		respond(req, res, templates.unknown);
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

AuthSSO.generateLinkToTeamspaceAuthenticator = (redirectURL) => validateMany(
	[removeFronteggSessionIfNeeded, redirectForAuth(redirectURL)]);

AuthSSO.generateToken = (redirectURLUsed) => validateMany([checkStateIsValid, getToken(redirectURLUsed),
	getUserDetails]);

module.exports = AuthSSO;
