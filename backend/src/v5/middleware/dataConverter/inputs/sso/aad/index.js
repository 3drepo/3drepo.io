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
const { authenticateRedirectUri, signupRedirectUri } = require('../../../../../services/sso/aad/aad.constants');
const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { getAuthenticationCodeUrl, getUserDetails } = require('../../../../../services/sso/aad');
const { providers } = require('../../../../../services/sso/sso.constants');
const { types } = require('../../../../../utils/helper/yup');
const { getUserByQuery } = require('../../../../../models/users');
const { respond } = require('../../../../../utils/responder');
const Yup = require('yup');
const { addPkceProtection } = require('..');
const { validateMany } = require('../../../../common');

const Aad = {};

Aad.getUserDetailsAndCheckEmailAvailability = async (req, res, next) => {
	const { data: { mail, givenName, surname, id } } = await getUserDetails(req.query.code,
		signupRedirectUri, req.session.pkceCodes?.verifier);

	try {
		const user = await getUserByQuery({ 'customData.email': mail }, { 'customData.sso': 1 });
		const message = user.customData.sso ? 'Email already exists from SSO user' : 'Email already exists';
		respond(req, res, createResponseCode(templates.invalidArguments, message));
		return;
	} catch {
		// do nothing
	}

	req.body = {
		...JSON.parse(req.query.state),
		email: mail,
		firstName: givenName,
		lastName: surname,
		sso: { type: providers.AAD, id },
	};

	await next();
};

Aad.authenticate = (redirectUri) => validateMany([addPkceProtection, authenticate(redirectUri)]);

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
			...(req.body || {})
		}),
		codeChallenge: req.session.pkceCodes.challenge,
		codeChallengeMethod: req.session.pkceCodes.challengeMethod,
	};

	const authenticationCodeUrl = await getAuthenticationCodeUrl(req.authParams);
	res.redirect(authenticationCodeUrl);
};

module.exports = Aad;
