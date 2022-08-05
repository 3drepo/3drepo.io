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
const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { getAuthenticationCodeUrl, getUserDetails } = require('../../../../../services/sso/aad');
const Yup = require('yup');
const { addPkceProtection } = require('..');
const { getUserByEmail, recordSuccessfulAuthAttempt } = require('../../../../../models/users');
const { logger } = require('../../../../../utils/logger');
const { providers } = require('../../../../../services/sso/sso.constants');
const { respond } = require('../../../../../utils/responder');
const { signupRedirectUri } = require('../../../../../services/sso/aad/aad.constants');
const { types } = require('../../../../../utils/helper/yup');
const { validateMany } = require('../../../../common');

const Aad = {};

Aad.validateUserDetails = async (req, res, next) => {
	const { data: { mail, givenName, surname, id } } = await getUserDetails(req.query.code,
		signupRedirectUri, req.session.pkceCodes?.verifier);

	try {
		const user = await getUserByEmail(mail, { 'customData.sso': 1 });
		const error = user.customData.sso ? templates.emailAlreadyExistsSso : templates.emailAlreadyExists;
		res.redirect(`${JSON.parse(req.query.state).redirectUri}?error=${error.code}`);
		return;
	} catch {
		// do nothing
	}

	try {
		req.body = {
			...JSON.parse(req.query.state),
			email: mail,
			firstName: givenName,
			lastName: surname,
			sso: { type: providers.AAD, id },
		};

		delete req.body.redirectUri;
	} catch (err) {
		logger.logError(`SSO Signup - Failed to parse req.query.state as JSON: ${err.message}`);
		res.redirect(`${JSON.parse(req.query.state).redirectUri}?error=${templates.unknown.code}`);
		return;
	}

	await next();
};

const authenticate = (redirectUri) => async (req, res) => {
	try {
		const querySchema = Yup.object().shape({ redirectUri: types.strings.title.required() }).strict(true);
		await querySchema.validate(req.query);
	} catch (err) {
		return respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
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

	try{
		const authenticationCodeUrl = await getAuthenticationCodeUrl(req.authParams);
		return res.redirect(authenticationCodeUrl);
	} catch (err){
		return respond(req, res, err);
	}
};

Aad.authenticate = (redirectUri) => validateMany([addPkceProtection, authenticate(redirectUri)]);

Aad.checkIfMsAccountIsLinkedTo3DRepo = async (req, res, next) => {
	const { data: { id, mail } } = await getUserDetails(req.query.code,
		authenticateRedirectUri);

	try {
		const user = await getUserByQuery({ 'customData.email': mail },
			{ _id: 0, user: 1, 'customData.sso.id': 1 });

		if (user.customData.sso?.id != id) {
			throw templates.containerIsSubModel;
		}

		const loginData = await recordSuccessfulAuthAttempt(user.user);
		req.loginData = loginData;
	} catch {

	}

	await next();
};

module.exports = Aad;
