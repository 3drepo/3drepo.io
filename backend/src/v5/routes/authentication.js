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

const { generateLinkToAuthenticator, generateToken, redirectToStateURL } = require('../middleware/sso/frontegg');
const { Router } = require('express');
const { createEndpointURL } = require('../utils/config');
const { notLoggedIn } = require('../middleware/auth');
const { updateSession } = require('../middleware/sessions');

const AUTH_POST = '/authenticate-post';
const authenticateRedirectUrl = createEndpointURL(`authentication${AUTH_POST}`);

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	* @openapi
	* /authentication/authenticate:
	*   get:
	*     description: Returns a link 3DR's authentication page and then to a URI provided upon success. The process works like the standard SSO protocol.
	*     tags: [Authentication]
	*     operationId: authenticate
	*     parameters:
	*       - in: query
	*         name: redirectUri
	*         schema:
	*           type: string
	*         description: a URI to redirect to when authentication finished
	*     responses:
	*       200:
	*         description: returns a link to 3D Repo's authentication page and then to a provided URI upon success
	*         content:
	*           application/json:
	*             schema:
	*               type: object
	*               properties:
	*                 link:
	*                   type: string
	*                   description: link to 3D Repo's authenticator
	*
	*/
	router.get('/authenticate', notLoggedIn, generateLinkToAuthenticator(authenticateRedirectUrl));

	// This endpoint is not exposed in swagger as it is not designed to be called by clients
	router.get(AUTH_POST, notLoggedIn, generateToken(authenticateRedirectUrl), updateSession, redirectToStateURL);

	return router;
};

module.exports = establishRoutes();
