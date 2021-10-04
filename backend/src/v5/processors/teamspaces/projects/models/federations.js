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
const { getFederationById, getFederations } = require('../../../../models/modelSettings');
const { getLatestRevision } = require('../../../../models/revisions');
const { getModelList } = require('./commons/modelList');
const { getProjectById } = require('../../../../models/projects');

const Federations = {};

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

Federations.getFederationStats = async (teamspace, federation) => {
	const { properties, status, subModels, category } = await getFederationById(teamspace, federation, { properties: 1,
		status: 1,
		subModels: 1,
		category: 1 });

	const lastUpdates = [];
	if (subModels) {
		await Promise.all(subModels.map(async (m) => {
			try {
				lastUpdates.push(await getLatestRevision(teamspace, m.model, { timestamp: 1 }));
			} catch {
				// do nothing. A container can have 0 revision.
			}
		}));
	}

	return {
		code: properties.code,
		status: status,
		subModels: subModels,
		category: category,
		lastUpdated: lastUpdates.length ? lastUpdates.sort(
			(a, b) => b.timestamp - a.timestamp,
		)[0].timestamp : undefined,
	};
};

module.exports = Federations;
