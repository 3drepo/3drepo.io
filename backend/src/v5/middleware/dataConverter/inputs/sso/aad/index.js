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
const axios = require('axios');
const config = require('../../../../../utils/config');
const { generateHashString } = require('../../../../../utils/helper/strings');
const { getClientApplication, checkAadConfig } = require('../../../../../services/sso/aad');
const { respond } = require('../../../../../utils/responder');

const Aad = {};

const signupRedirectUri = 'http://localhost/api/v5/sso/aad/signup-post';
const msGraphUserDetailsUri = 'https://graph.microsoft.com/v1.0/me';

Aad.checkAadConfig = async (req, res, next) => {
	checkAadConfig();
	await next();
};

Aad.getUserDetailsAndValidateEmail = async (req, res, next) => {
	try {
		const tokenRequest = { redirectUri: signupRedirectUri, code: req.query.code };
		const clientApplication = getClientApplication();
		const response = await clientApplication.acquireTokenByCode(tokenRequest);

		const user = await axios.default.get(msGraphUserDetailsUri, {
			headers: {
				Authorization: `Bearer ${response.accessToken}`,
			},
		});

		req.body = {
			...JSON.parse(req.query.state),
			email: user.data.mail,
			firstName: user.data.givenName,
			lastName: user.data.surname,
			password: generateHashString(),
			sso: {
				type: 'aad',
				id: user.data.id,
			},
		};

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Aad;
