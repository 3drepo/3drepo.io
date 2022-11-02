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

const { authenticate, checkStateIsValid, hasAssociatedAccount, redirectToStateURL, verifyNewUserDetails } = require('../../../middleware/sso/aad');
const { authenticateRedirectEndpoint, authenticateRedirectUri, signupRedirectEndpoint, signupRedirectUri } = require('../../../services/sso/aad/aad.constants');
const { Router } = require('express');
const Users = require('../../../processors/users');
const { createSession } = require('../../../middleware/sessions');
const { notLoggedIn } = require('../../../middleware/auth');
const { respond } = require('../../../utils/responder');
const { validateSsoSignUpData } = require('../../../middleware/dataConverter/inputs/users');

const signUpPost = async (req, res, next) => {
	try {
		await Users.signUp(req.body);
		await next();
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
	*     description: Redirects the user to Microsoft's authentication page and then to a URI provided upon success
	*     tags: [Aad]
	*     operationId: aadAuthenticate
	*     parameters:
	*       - in: query
	*         name: redirectUri
	*         schema:
	*           type: string
	*         description: a URI to redirect to when authentication finished
	*     responses:
	*       302:
	*         description: Redirects the user to Microsoft's authentication page and then to a provided URI upon success
	*/
	router.get('/authenticate', authenticate(authenticateRedirectUri));

	router.get(authenticateRedirectEndpoint, notLoggedIn, checkStateIsValid, hasAssociatedAccount,
		createSession, redirectToStateURL);

	/**
	 * @openapi
	 * /sso/aad/signup:
	 *   post:
	 *     description: Redirects the user to Microsoft's authentication page and signs the user up. Upon successful signup the user is redirected to the URI provided. In case an error is occured during the signup process the user is redirected to the provided URI with the error code specified in the query. Error codes - 1 There is a non SSO account with the same email 2 there is a SSO account witht he same email
	 *     tags: [Aad]
	 *     operationId: aadSignup
	 *     parameters:
	 *       - in: query
	 *         name: redirectUri
	 *         schema:
	 *           type: string
	 *         description: a URI to redirect to when authentication finished
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
	 *         $ref: "#/components/responses/invalidArguments"
	 *       302:
	 *         description: Redirects the user to Microsoft's authentication page and then to a provided URI upon success
	 */
	router.post('/signup', validateSsoSignUpData, authenticate(signupRedirectUri));

	router.get(signupRedirectEndpoint, checkStateIsValid, verifyNewUserDetails, signUpPost, redirectToStateURL);

	return router;
};

module.exports = establishRoutes();
