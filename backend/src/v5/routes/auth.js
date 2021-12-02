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

const { notValidSession, validSession } = require('../middleware/auth');
const Auth = require('../processors/auth');
const { Router } = require('express');
const config = require('../utils/config');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');
const { validateLoginData } = require('../middleware/dataConverter/inputs/auth');

const login = (req, res) => {
	const { username, password } = req.body;

	Auth.login(username, password, req).then(() => {
		respond(req, res, templates.ok);
	}).catch((err) => respond(req, res, err));
};

const logout = (req, res) => {
	const username = req.session?.user?.username;
	Auth.getUserByUsername(username).then(() => {
		req.session.destroy(() => {
			res.clearCookie('connect.sid', { domain: config.cookie_domain, path: '/' });
			respond(req, res, templates.ok, undefined, {}, username);
		});
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
	 *               username:
	 *                 type: string
	 *                 description: The username of the user
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
	router.post('/login', validateLoginData, notValidSession, login);

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
	router.post('/logout', validSession, logout);

	/**
	 * @openapi
	 * /login:
	 *   get:
	 *     description: Returns the username of the user currently logged in
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
	router.get('/login', validSession, getUsername);
	return router;
};

module.exports = establishRoutes();
