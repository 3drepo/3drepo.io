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
const { isLoggedIn, notLoggedIn } = require('../middleware/auth');
const { Router } = require('express');
const { createEndpointURL } = require('../utils/config');
const { isMemberOfTeamspace } = require('../middleware/permissions');
const { updateSession } = require('../middleware/sessions');

const AUTH_POST = '/authenticate-post';
const authenticateRedirectUrl = createEndpointURL(`authentication${AUTH_POST}`);

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	/**
	* @openapi
	* /authentication/authenticate:
	*   get:
	*     description: General authentication route to establish a session.
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
	*         description: Returns a link to 3DR's authentication page and then redirects to a URI provided upon success. The process works like the standard SSO protocol.
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

	/**
	* @openapi
	* /authentication/authenticate/{teamspace}:
	*   get:
	*     description: Authenticates a user against a particular teamspace, the user has to have already established a session to use this endpoint.
	*     tags: [Authentication]
	*     operationId: authenticate
	*     parameters:
	*       - in: path
	*         name: teamspace
	*         description: Name of the teamspace to authenticate against
	*         required: true
	*         schema:
	*           type: string
	*       - in: query
	*         name: redirectUri
	*         schema:
	*           type: string
	*         description: a URI to redirect to when authentication finished
	*     responses:
	*       200:
	*         description: Returns a link to 3DR's authentication page and then redirects to a URI provided upon success. The process works like the standard SSO protocol.
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
	router.get('/authenticate/:teamspace', isLoggedIn, isMemberOfTeamspace, generateLinkToAuthenticator(authenticateRedirectUrl));

	// This endpoint is not exposed in swagger as it is not designed to be called by clients
	router.get(AUTH_POST, generateToken(authenticateRedirectUrl), updateSession, redirectToStateURL);

	return router;
};

module.exports = establishRoutes();
