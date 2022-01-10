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

const { createSession, destroySession } = require('../middleware/sessions');
const { isLoggedIn, notLoggedIn, validSession } = require('../middleware/auth');
const { validateAvatarFile, validateLoginData,
	validateUpdateData } = require('../middleware/dataConverter/inputs/users');
const { Router } = require('express');
const Users = require('../processors/users');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');

const login = (req, res, next) => {
	const { user, password } = req.body;
	Users.login(user, password).then((loginData) => {
		req.loginData = loginData;
		next();
	}).catch((err) => respond(req, res, err));
};

const getUsername = (req, res) => {
	respond(req, res, templates.ok, { username: req.session.user.username });
};

const getProfile = (req, res) => {
	const { username } = req.session.user;
	Users.getProfileByUsername(username).then((profile) => {
		respond(req, res, templates.ok, { ...profile });
	}).catch((err) => respond(req, res, err));
};

const updateProfile = (req, res) => {
	const { username } = req.session.user;
	const updatedProfile = req.body;
	Users.updateProfile(username, updatedProfile).then(() => {
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
};

const generateApiKey = (req, res) => {
	const { username } = req.session.user;
	Users.generateApiKey(username).then((apiKey) => {
		respond(req, res, templates.ok, { apiKey });
	}).catch((err) => respond(req, res, err));
};

const deleteApiKey = (req, res) => {
	const { username } = req.session.user;
	Users.deleteApiKey(username).then(() => {
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
};

const getAvatar = (req, res) => {
	const { username } = req.session.user;
	Users.getAvatar(username).then((avatar) => {
		res.write(avatar.data.buffer);
		res.end();
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
};

const uploadAvatar = (req, res) => {
	const { username } = req.session.user;
	Users.uploadAvatar(username, req.file.buffer).then(() => {
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
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
	router.post('/login', validateLoginData, notLoggedIn, login, createSession);

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
	 *     tags: [Auth]
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
	 *                 hasAvatar:
	 *                   type: boolean
	 *                   description: Whether or not the user has an avatar
	 *                   example: true
	 *                 apiKey:
	 *                   type: string
	 *                   description: The API key of the user
	 *                   example: 23b61deadbba098fec517dc4fcc84d68
	 *
	 */
	router.get('/user', validSession, getProfile);

	/**
	* @openapi
	* /user:
	*   put:
	*     description: Updates the profile of the logged in user
	*     tags: [Auth]
	*     operationId: updateProfile
	*     requestBody:
	*       content:
	*         application/json:
	*           schema:
	*             type: object
	*             properties:
	*               firstName:
	*                 type: string
	*                 description: The first name of the user
	*                 example: Jason
	*               lastName:
	*                 type: string
	*                 description: The last name of the user
	*                 example: Voorhees
	*               email:
	*                 type: string
	*                 description: The email of the user
	*                 example: jason@vorhees.com
	*                 format: email
	*               oldPassport:
	*                 type: string
	*                 description: The old password of the user
	*                 example: password12345
    *                 format: password
	*               newPassport:
	*                 type: string
	*                 description: The new password of the user
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

	router.post('/user/key', isLoggedIn, generateApiKey);

	router.delete('/user/key', isLoggedIn, deleteApiKey);

	router.get('/user/avatar', isLoggedIn, getAvatar);

	router.put('/user/avatar', isLoggedIn, validateAvatarFile, uploadAvatar);

	return router;
};

module.exports = establishRoutes();
