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

const { Router } = require('express');
const { validSession } = require('../../middleware/auth');
const { respond } = require('../../utils/responder');
const { template, createResponseCode } = require('../../utils/responseCodes');
const Teamspaces = require('../../processors/teamspaces');

const getTeamspaceList = (req, res) => {
	const user = req.session.user.username;
	Teamspaces.getTeamspaceListByUser(user).then((teamspaces) => {
		respond(req, res, createResponseCode(template.ok), { teamspaces });
	}).catch((err) => respond(req, res, err));
};

const establishRoutes = () => {
	const router = Router({ mergeParams: true });

	router.get('/', validSession, getTeamspaceList);

	return router;
};

module.exports = establishRoutes();
