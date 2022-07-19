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
const { getUserDetailsAndCheckEmailAvailability } = require('../../../middleware/dataConverter/inputs/sso/aad');
const { Router } = require('express');
const Users = require('../../../processors/users');
const { getAuthenticationCodeUrl } = require('../../../services/sso/aad');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');
const { validateSsoSignUpData } = require('../../../middleware/dataConverter/inputs/users');
const { authenticateRedirectUri, signupRedirectUri, authenticateRedirectEndpoint, signupRedirectEndpoint } = require('../../../services/sso/aad/aad.constants');
const { addPkceProtection } = require('../../../middleware/dataConverter/inputs/sso');

const authenticate = async (req, res) => {
	try {
		const params = { 
			redirectUri: authenticateRedirectUri, 
			state: JSON.stringify({ redirecturi: req.query.signupUri }),
			codeChallenge: req.session.pkceCodes.challenge, 
            codeChallengeMethod: req.session.pkceCodes.challengeMethod 
		};        
		const authenticationCodeUrl = await getAuthenticationCodeUrl(params);
		res.redirect(authenticationCodeUrl);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const authenticatePost = (req, res) => {
	try {
		res.redirect(JSON.parse(req.query.state).redirecturi);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const signup = async (req, res) => {
	try {
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
            codeChallengeMethod: req.session.pkceCodes.challengeMethod    
		};

		const authenticationCodeUrl = await getAuthenticationCodeUrl(params);
		res.redirect(authenticationCodeUrl);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const signupPost = async (req, res) => {
	try {
		await Users.signUp(req.body, true);
		respond(req, res, templates.ok);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	* @openapi
	* /sso/aad/authenticate:
	*   get:
	*     description: Redirects the user to Microsoft's authentication page and then to a provided URI upon success
	*     tags: [Aad]
	*     operationId: authenticate
	*/
	router.get('/authenticate', addPkceProtection, authenticate);

	router.get(`/${authenticateRedirectEndpoint}`, authenticatePost);

	/**
	 * @openapi
	 * /sso/aad/signup:
	 *   post:
	 *     description: Redirects the user to Microsoft's authentication page and signs the user up upon successful authentication
	 *     tags: [Aad]
	 *     operationId: signup
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *             - username
	 *             - countryCode
	 *             - mailListAgreed
	 *             properties:
	 *               username:
	 *                 type: string
	 *                 description: The username of the user
	 *                 example: username123
	 *               countryCode:
	 *                 type: string
	 *                 description: The country code of the user
	 *                 example: GB
	 *               company:
	 *                 type: string
	 *                 description: The company of the user
	 *                 example: 3D Repo
	 *               mailListAgreed:
	 *                 type: boolean
	 *                 description: Whether the user has signed up for the latest news and tutorials
	 *                 example: true
	 *               captcha:
	 *                 type: string
	 *                 description: The reCAPTCHA token generated from the sign up form
	 *                 example: 5LcN0ysfAAAAAHpnld1tAweI7DKU7dswmwnHWYcB
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 */
	router.post('/signup', validateSsoSignUpData, addPkceProtection, signup);

	router.get(`/${signupRedirectEndpoint}`, getUserDetailsAndCheckEmailAvailability, signupPost);

	return router;
};

module.exports = establishRoutes();
