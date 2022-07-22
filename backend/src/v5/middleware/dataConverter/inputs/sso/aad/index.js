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
const { aad } = require('../../../../../services/sso/sso.constants');
const { getUserByQuery } = require('../../../../../models/users');
const { respond } = require('../../../../../utils/responder');

const Aad = {};

Aad.getUserDetailsAndCheckEmailAvailability = async (req, res, next) => {
	const { data: { mail, givenName, surname, id } } = await getUserDetails(req.query.code,
		signupRedirectUri, req.session.pkceCodes?.verifier);

	try {
		const user = await getUserByQuery({ 'customData.email': mail }, { 'customData.sso': 1 });
		const message = user.customData.sso ? 'Email already exists from SSO user' : 'Email already exists'
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
		sso: { type: aad, id },
	};

	await next();
};

Aad.setAuthenticateAuthParams = async (req, res, next) => {
	const params = {
		redirectUri: authenticateRedirectUri,
		state: JSON.stringify({ redirectUri: req.query.signupUri }),
		codeChallenge: req.session.pkceCodes.challenge,
		codeChallengeMethod: req.session.pkceCodes.challengeMethod,
	};

	req.authParams = params;

	await next();
};

Aad.setSignupAuthParams = async (req, res, next) => {
	const { body } = req;

	const params = {
		redirectUri: signupRedirectUri,
		state: JSON.stringify({
			username: body.username,
			countryCode: body.countryCode,
			company: body.company,
			mailListAgreed: body.mailListAgreed,
		}),
		codeChallenge: req.session.pkceCodes.challenge,
		codeChallengeMethod: req.session.pkceCodes.challengeMethod,
	};

	req.authParams = params;

	await next();
};

Aad.getAuthenticationCodeUrl = async (req, res, next) => {
	const authenticationCodeUrl = await getAuthenticationCodeUrl(req.authParams);
	req.authenticationCodeUrl = authenticationCodeUrl;

	await next();
};

module.exports = Aad;
