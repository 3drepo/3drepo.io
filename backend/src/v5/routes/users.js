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

const { notLoggedIn, isLoggedIn } = require('../middleware/auth');
const Users = require('../processors/users');
const { Router } = require('express');
const config = require('../utils/config');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');
const { validateLoginData } = require('../middleware/dataConverter/inputs/auth');
const { endSession, regenerateAuthSession } = require('../middleware/dataConverter/outputs/auth');

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
	 *         description: Loggs the user in
	 */
	router.post('/login', validateLoginData, notLoggedIn, login, regenerateAuthSession);

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
	 *         description: Loggs the user out
	 */
	router.post('/logout', isLoggedIn, endSession);

	/**
	 * @openapi
	 * /login:
	 *   get:
	 *     description: Verifies if there is a valid session with the request and returns the name of the user
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
	 *                   description: The username of the user currently logged in
	 *                   example: Username1
	 *
	 */
	router.get('/login', isLoggedIn, getUsername);
	return router;
};

module.exports = establishRoutes();
