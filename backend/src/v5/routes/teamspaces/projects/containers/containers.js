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
 const Containers = require('../../../../processors/teamspaces/projects/containers/containers');
 const { respond } = require('../../../../utils/responder');
 const { templates } = require('../../../../utils/responseCodes');
const { hasAccessToTeamspace } = require('../../../../middleware/permissions/teamspaces');

 const appendFavourites = (req, res) => {
	const user = req.session.user.username;
	const { teamspace } = req.params;
	const favouritesToAdd = req.body.containers;

	Containers.appendFavourites(user, teamspace, favouritesToAdd).then((favourites) => {
		respond(req, res, templates.ok, {favourites});
	}).catch((err) => respond(req, res, err));
};

const deleteFavourites =(req, res)=>{
	const user = req.session.user.username;
	const { teamspace } = req.params;
	const favouritesToRemove = req.body.containers;

	Containers.deleteFavourites(user, teamspace, favouritesToRemove).then((favourites) => {
		respond(req, res, templates.ok, {favourites});
	}).catch((err) => respond(req, res, err));
}

const establishRoutes = () => {
	const router = Router({ mergeParams: true });
	router.patch('/favourites', hasAccessToTeamspace, appendFavourites);
	router.delete('/favourites', hasAccessToTeamspace, deleteFavourites);
	return router;
};

module.exports = establishRoutes();