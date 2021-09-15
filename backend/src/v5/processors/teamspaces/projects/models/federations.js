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

const { getFederations } = require('../../../../models/modelSettings');
const { getModelList } = require('./commons/modelList');
const { getProjectById } = require('../../../../models/projects');

const Federations = {};

Federations.getFederationList = async (teamspace, project, user) => {
	const { models } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });
	const modelSettings = await getFederations(teamspace, models, { _id: 1, name: 1, permissions: 1 });

	return getModelList(teamspace, project, user, modelSettings);
};

Federations.appendFavourites = async (username, teamspace, project, favouritesToAdd) => {
	const accessibleFederations = await getFederationList(teamspace, project, username);
	const federationIDs = accessibleFederations.map((a) => a._id);

	if (favouritesToAdd.every((i) => federationIDs.includes(i))) {
		await appendFavourites(username, teamspace, favouritesToAdd);
	}
};

Federations.deleteFavourites = async (username, teamspace, project, favouritesToRemove) => {
	const accessibleFederations = await getFederationList(teamspace, project, username);
	const federationIDs = accessibleFederations.map((a) => a._id);

	if (favouritesToRemove.every((i) => federationIDs.includes(i))) {
		await deleteFavourites(username, teamspace, favouritesToRemove);
	}
};

module.exports = Federations;
