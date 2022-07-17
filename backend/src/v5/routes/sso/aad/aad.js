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
const { checkAadConfig, getUserDetailsAndValidateEmail } = require('../../../middleware/dataConverter/inputs/sso/aad');
const { Router } = require('express');
const Users = require('../../../processors/users');
const { getAuthenticationCodeUrl } = require('../../../utils/sso/aad');
const { respond } = require('../../../utils/responder');
const { templates } = require('../../../utils/responseCodes');
const { validateSignUpData } = require('../../../middleware/dataConverter/inputs/users');
const { authenticateRedirectUri, sigupUri } = require('./aad.constants');

const authenticate = async (req, res) => {
	try {
		const params = { redirectUri: authenticateRedirectUri, state: sigupUri};        
		const authenticationCodeUrl = await getAuthenticationCodeUrl(params);
		res.redirect(authenticationCodeUrl);
	} catch (err) {
		/* istanbul ignore next */
		respond(req, res, err);
	}
};

const authenticatePost = (req, res) => {
	try {
		res.redirect(req.query.state);
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
		await Users.signUp(req.body);
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
	*     description: Redirects the user to Microsoft's authentication page and calls authenticate-post endpoint upon successful authentication
	*     tags: [Aad]
	*     operationId: authenticate
	*/
	router.get('/authenticate', checkAadConfig, authenticate);

	/**
	 * @openapi
	 * /sso/aad/authenticate-post:
	 *   get:
	 *     description: Redirects the user to 3D Repo's SSO signup page
	 *     tags: [Aad]
	 *     operationId: authenticatePost
	 */
	router.get('/authenticate-post', checkAadConfig, authenticatePost);

	/**
	 * @openapi
	 * /sso/aad/signup:
	 *   post:
	 *     description: Redirects the user to Microsoft's authentication page and calls signup-post endpoint upon successful authentication
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
	 *                 description: Whether the user has signed yp for the latest news and tutorials
	 *                 example: true
	 *               captcha:
	 *                 type: string
	 *                 description: The reCAPTCHA token generated from the sign up form
	 *                 example: 5LcN0ysfAAAAAHpnld1tAweI7DKU7dswmwnHWYcB
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 */
	router.post('/signup', checkAadConfig, signup);

	/**
	 * @openapi
	 * /sso/aad/signup-post:
	 *   get:
	 *     description: Retrieves user email, firstname and lastname from Microsoft Graph API, signs a user up and sends a verification email to the email address provided
	 *     tags: [Aad]
	 *     operationId: signup-post
	 *     responses:
	 *       400:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       200:
	 *         description: Retrieves user email, firstname and lastname from Microsoft Graph API, signs a user up and sends a verification email to the email address provided
	 */
	router.get('/signup-post', checkAadConfig, getUserDetailsAndValidateEmail, validateSignUpData, signupPost);

	return router;
};

module.exports = establishRoutes();
