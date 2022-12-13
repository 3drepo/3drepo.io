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

const { isSsoUser, validateUnlinkData } = require('../../middleware/sso');
const { Router } = require('express');
const Users = require('../../processors/users');
const { getUserFromSession } = require('../../utils/sessions');
const { isLoggedIn } = require('../../middleware/auth');
const { respond } = require('../../utils/responder');
const { templates } = require('../../utils/responseCodes');

const unlink = async (req, res) => {
	try {
		const username = getUserFromSession(req.session);
		const { password } = req.body;
		await Users.unlinkFromSso(username, password);
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
	 * /sso/unlink:
	 *   post:
	 *     description: Unlinks an SSO user's account from SSO
	 *     tags: [Sso]
	 *     operationId: ssoUnlink
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             required:
	 *               - password
	 *             properties:
	 *               password:
	 *                 type: string
	 *                 description: The new password of the user
	 *                 example: password123
	 *     responses:
	 *       401:
	 *         $ref: "#/components/responses/invalidArguments"
	 *       200:
	 *         description: Unlinks the users account from SSO
	 */
	router.post('/unlink', isLoggedIn, isSsoUser, validateUnlinkData, unlink);

	return router;
};

module.exports = establishRoutes();
