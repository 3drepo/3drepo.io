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

const { appendFavourites, deleteFavourites } = require('./commons/favourites');
const Groups = require('./commons/groups');
const { getFederations, updateModelSettings } = require('../../../../models/modelSettings');
const { getModelList } = require('./commons/modelList');
const { getProjectById } = require('../../../../models/projects');
const { templates } = require('../../../../utils/responseCodes');

const Federations = { ...Groups };

Federations.getFederationList = async (teamspace, project, user) => {
	const { models } = await getProjectById(teamspace, project, { permissions: 1, models: 1 });
	const modelSettings = await getFederations(teamspace, models, { _id: 1, name: 1, permissions: 1 });

	return getModelList(teamspace, project, user, modelSettings);
};

Federations.appendFavourites = async (username, teamspace, project, favouritesToAdd) => {
	const accessibleFederations = await Federations.getFederationList(teamspace, project, username);
	await appendFavourites(username, teamspace, accessibleFederations, favouritesToAdd);
};

Federations.deleteFavourites = async (username, teamspace, project, favouritesToRemove) => {
	const accessibleFederations = await Federations.getFederationList(teamspace, project, username);
	await deleteFavourites(username, teamspace, accessibleFederations, favouritesToRemove);
};

Federations.updateSettings = async (teamspace, federation, payload) => {
	const res = await updateModelSettings(teamspace, federation, payload);

	if (!res || res.matchedCount === 0) {
		throw templates.federationNotFound;
	}
};

module.exports = Federations;
