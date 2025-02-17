/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { canLogin, isLoggedIn, validSession } = require('../middleware/auth');
const { createSession, destroySession } = require('../middleware/sessions');
const { validateForgotPasswordData, validateLoginData,
	validateResetPasswordData, validateSignUpData, validateUpdateData, validateVerifyData } = require('../middleware/dataConverter/inputs/users');
const { Router } = require('express');
const Users = require('../processors/users');
const { fileExtensionFromBuffer } = require('../utils/helper/typeCheck');
const { getUserFromSession } = require('../utils/sessions');
const { respond } = require('../utils/responder');
const { singleImageUpload } = require('../middleware/dataConverter/multer');
const { templates } = require('../utils/responseCodes');

const login = async (req, res, next) => {
	const { user, password } = req.body;
	try {
		await Users.login(user, password);
		req.loginData = { username: user };
		await next();
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const getUsername = (req, res) => {
	respond(req, res, templates.ok, { username: req.session.user.username });
};

const getProfile = async (req, res) => {
	try {
		const user = getUserFromSession(req.session);
		const profile = await Users.getProfileByUsername(user);
		respond(req, res, templates.ok, { ...profile, authorisedTeamspace: req.session.user.auth.authorisedTeamspace });
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const updateProfile = async (req, res) => {
	try {
		const user = getUserFromSession(req.session);
		const updatedProfile = req.body;
		await Users.updateProfile(user, updatedProfile);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const generateApiKey = (req, res) => {
	const user = getUserFromSession(req.session);
	Users.generateApiKey(user).then((apiKey) => {
		respond(req, res, templates.ok, { apiKey });
	}).catch(
		// istanbul ignore next
		(err) => respond(req, res, err),
	);
};

const deleteApiKey = (req, res) => {
	const user = getUserFromSession(req.session);
	Users.deleteApiKey(user).then(() => {
		respond(req, res, templates.ok);
	}).catch(
		// istanbul ignore next
		(err) => respond(req, res, err),
	);
};

const getAvatar = async (req, res) => {
	try {
		const user = getUserFromSession(req.session);
		const buffer = await Users.getAvatar(user);
		const fileExt = await fileExtensionFromBuffer(buffer);
		req.params.format = fileExt || 'png';
		respond(req, res, templates.ok, buffer);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const uploadAvatar = async (req, res) => {
	try {
		const user = getUserFromSession(req.session);
		await Users.uploadAvatar(user, req.file.buffer);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const forgotPassword = async (req, res) => {
	const { user } = req.body;

	try {
		await Users.generateResetPasswordToken(user);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const resetPassword = async (req, res) => {
	const { newPassword, user } = req.body;

	try {
		await Users.updatePassword(user, newPassword);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const signUp = async (req, res) => {
	try {
		await Users.signUp(req.body);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const verify = async (req, res) => {
	const { username, token } = req.body;

	try {
		await Users.verify(username, token);
		respond(req, res, templates.ok);
	} catch (err) {
		// istanbul ignore next
		respond(req, res, err);
	}
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	 * @openapi
	 * /login:
	 *   post:
	 *     description: Logs a user in
	 *     tags: [Auth]
	 *     operationId: login
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *               user:
	 *                 type: string
	 *                 description: The username or email of the user
	 *                 example: username1
	 *               password:
	 *                 type: string
	 *                 description: The password of the user
	 *                 example: password1
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/alreadyLoggedIn"
	 *       400:
	 *         $ref: "#/components/responses/tooManyLoginAttempts"
	 *       200:
	 *         description: Authenticates the user and establish a session
	 */
	router.post('/login', validateLoginData, canLogin, login, createSession);

	/**
	 * @openapi
	 * /logout:
	 *   post:
	 *     description: Logs a user out
	 *     tags: [Auth]
	 *     operationId: logout
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: User is logged out and session is destroyed.
	 */
	router.post('/logout', isLoggedIn, destroySession);

	/**
	 * @openapi
	 * /login:
	 *   get:
	 *     description: Gets the username of the logged in user
	 *     tags: [Auth]
	 *     operationId: getUsername
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the username of the user currently logged in
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 username:
	 *                   type: string
	 *                   description: The username of the user
	 *                   example: Username1
	 *
	 */
	router.get('/login', isLoggedIn, getUsername);

	/**
	 * @openapi
	 * /user:
	 *   get:
	 *     description: Gets the profile of the logged in user
	 *     tags: [User]
	 *     operationId: getProfile
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/notLoggedIn"
	 *       200:
	 *         description: Returns the details of the user currently logged in
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                 username:
	 *                   type: string
	 *                   description: The username of the user
	 *                   example: Username1
	 *                 firstName:
	 *                   type: string
	 *                   description: The first name of the user
	 *                   example: Jason
	 *                 lastName:
	 *                   type: string
	 *                   description: The last name of the user
	 *                   example: Voorhees
	 *                 email:
	 *                   type: string
	 *                   description: The email of the user
	 *                   example: jason@vorhees.com
	 *                 company:
	 *                   type: string
	 *                   description: Name of the company
	 *                   example: 3D Repo
	 *                 countryCode:
	 *                   type: string
	 *                   description: Country Code
	 *                   example: GB
	 *                 hasAvatar:
	 *                   type: boolean
	 *                   description: Whether or not the user has an avatar
	 *                   example: true
	 *                 apiKey:
	 *                   type: string
	 *                   description: The API key of the user
	 *                   example: 23b61deadbba098fec517dc4fcc84d68
	 *                 isSso:
	 *                   type: boolean
	 *                   description: Whether or not the user is an SSO user
	 *                   example: true
	 *
	 */
	router.get('/user', validSession, getProfile);

	/**
	* @openapi
	* /user:
	*   put:
	*     description: Updates the profile of the logged in user
	*     tags: [User]
	*     operationId: updateProfile
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               firstName:
	*                 type: string
	*                 description: The first name of the user (applies only to non SSO users)
	*                 example: Jason
	*               lastName:
	*                 type: string
	*                 description: The last name of the user (applies only to non SSO users)
	*                 example: Voorhees
	*               email:
	*                 type: string
	*                 description: The email of the user (applies only to non SSO users)
	*                 example: jason@vorhees.com
	*                 format: email
	*               company:
	*                 type: string
	*                 description: Name of the company
	*                 example: 3D Repo
	*               countryCode:
	*                 type: string
	*                 description: Country Code
	*                 example: GB
	*               oldPassword:
	*                 type: string
	*                 description: The old password of the user (applies only to non SSO users)
	*                 example: password12345
    *                 format: password
	*               newPassword:
	*                 type: string
	*                 description: The new password of the user (applies only to non SSO users)
	*                 example: password12345
    *                 format: password
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Updates the details of the user
	*
	*/
	router.put('/user', isLoggedIn, validateUpdateData, updateProfile);

	/**
	* @openapi
	* /user/key:
	*   post:
	*     description: Generates a new API key for the logged in user
	*     tags: [User]
	*     operationId: generateApiKey
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Generates a new API key for the user
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 apiKey:
	*                   type: string
	*                   description: The new API key of the user
	*                   example: 20f947a673dce5419ce187ca7998a68f
	*/
	router.post('/user/key', isLoggedIn, generateApiKey);

	/**
	* @openapi
	* /user/key:
	*   delete:
	*     description: Deletes the API key of the logged in user
	*     tags: [User]
	*     operationId: deleteApiKey
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Deletes the details of the user
	*/
	router.delete('/user/key', isLoggedIn, deleteApiKey);

	/**
	* @openapi
	* /user/avatar:
	*   get:
	*     description: Gets the avatar of the logged in user
	*     tags: [User]
	*     operationId: getAvatar
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Gets the avatar of the user
	*         content:
	*           image/png:
	*             schema:
	*               type: string
	*               format: binary
	*/
	router.get('/user/avatar', validSession, getAvatar);

	/**
	* @openapi
	* /user/avatar:
	*   put:
	*     description: Uploads new avatar for the logged in user
	*     tags: [User]
	*     operationId: uploadAvatar
	*     requestBody:
	*       content:
	*         multipart/form-data:
	*           schema:
	*             type: object
	*             properties:
	*               file:
	*                 type: string
	*                 format: binary
	*     responses:
	*       401:
	*         $ref: "#/components/responses/notLoggedIn"
	*       200:
	*         description: Uploads a new avatar for the user
	*/
	router.put('/user/avatar', isLoggedIn, singleImageUpload('file'), uploadAvatar);

	/**
	* @openapi
	* /user/password:
	*   post:
	*     description: Sends an email to the user with a reset password link
	*     tags: [User]
	*     operationId: forgotPassword
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               user:
	*                 type: string
	*                 description: The username or email of the user
	*                 example: nick.wilson@email.com
	*     responses:
	*       200:
	*         description: Sends an email to the user with a reset password link
	*/
	router.post('/user/password', validateForgotPasswordData, forgotPassword);

	/**
	* @openapi
	* /user/password:
	*   put:
	*     description: Resets the user password
	*     tags: [User]
	*     operationId: resetPassword
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               user:
	*                 type: string
	*                 description: The username of the user
	*                 example: username123
	*               newPassword:
	*                 type: string
	*                 description: The new password of the user
	*                 example: newPassword123!
	*               token:
	*                 type: string
	*                 description: The reset password token
	*                 example: c0f6b97ae5a9c210ee050a9ada3faabc
	*     responses:
	*       400:
	*         $ref: "#/components/responses/invalidArguments"
	*       200:
	*         description: Resets the user password
	*/
	router.put('/user/password', validateResetPasswordData, resetPassword);

	/**
	* @openapi
	* /user:
	*   post:
	*     description: Signs a user up and sends a verification email to the email address provided
	*     tags: [User]
	*     operationId: signUp
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             required:
	*             - username
	*             - email
	*             - password
	*             - firstName
	*             - lastName
	*             - countryCode
	*             - mailListAgreed
	*             properties:
	*               username:
	*                 type: string
	*                 description: The username of the user
	*                 example: username123
	*               email:
	*                 type: string
	*                 description: The email of the user
	*                 example: example@email.com
	*                 format: email
	*               password:
	*                 type: string
	*                 description: The password of the user
	*                 example: newPassword123!
	*               firstName:
	*                 type: string
	*                 description: The first name of the user
	*                 example: Nick
	*               lastName:
	*                 type: string
	*                 description: The last name of the user
	*                 example: Wilson
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
	*       400:
	*         $ref: "#/components/responses/invalidArguments"
	*       200:
	*         description: Signs a user up and sends a verification email to the email address provided
	*/
	router.post('/user', validateSignUpData, signUp);

	/**
	* @openapi
	* /user/verify:
	*   post:
	*     description: Verifies a user and the user teamspace is initialised
	*     tags: [User]
	*     operationId: verify
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             required:
	*             - username
	*             - token
	*             properties:
	*               username:
	*                 type: string
	*                 description: The username of the user
	*                 example: username123
	*               token:
	*                 type: string
	*                 description: The verification token of the user
	*                 example: c0f6b97ae5a9c210ee050a9ada3faabc
	*     responses:
	*       400:
	*         $ref: "#/components/responses/invalidArguments"
	*       200:
	*         description: Verifies a user and the user teamspace is initialised
	*/
	router.post('/user/verify', validateVerifyData, verify);
	return router;
};

module.exports = establishRoutes();
