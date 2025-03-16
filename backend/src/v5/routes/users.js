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

const { isLoggedIn, validSession } = require('../middleware/auth');
const { Router } = require('express');
const Users = require('../processors/users');
const { destroySession } = require('../middleware/sessions');
const { fileExtensionFromBuffer } = require('../utils/helper/typeCheck');
const { getUserFromSession } = require('../utils/sessions');
const { respond } = require('../utils/responder');
const { routeDecommissioned } = require('../middleware/common');
const { singleImageUpload } = require('../middleware/dataConverter/multer');
const { templates } = require('../utils/responseCodes');
const { validateUpdateData } = require('../middleware/dataConverter/inputs/users');

const getLoginInfo = (req, res) => {
	const response = {
		username: req.session.user.username,
		authenticatedTeamspace: req.session.user.auth.authenticatedTeamspace,
	};

	respond(req, res, templates.ok, response);
};

const getProfile = async (req, res) => {
	try {
		const user = getUserFromSession(req.session);
		const profile = await Users.getProfileByUsername(user);
		respond(req, res, templates.ok, profile);
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

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	router.post('/login', routeDecommissioned());

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
	 *     operationId: getLoginInfo
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
	 *                 authenticatedTeamspace:
	 *                   type: string
	 *                   description: The teamspace the user is authenticated against
	 *                   example: BuildingProject
	 *
	 */
	router.get('/login', isLoggedIn, getLoginInfo);

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

	router.post('/user/password', routeDecommissioned());

	router.put('/user/password', routeDecommissioned());

	router.post('/user', routeDecommissioned());

	router.post('/user/verify', routeDecommissioned());
	return router;
};

module.exports = establishRoutes();
