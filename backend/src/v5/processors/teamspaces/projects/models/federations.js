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

const { addModel, deleteModel, getModelList } = require('./commons/modelList');
const { appendFavourites, deleteFavourites } = require('./commons/favourites');
const { getFederationById, getFederations, updateModelSettings } = require('../../../../models/modelSettings');
const Groups = require('./commons/groups');
const { getIssuesCount } = require('../../../../models/issues');
const { getLatestRevision } = require('../../../../models/revisions');
const { getProjectById } = require('../../../../models/projects');
const { getRisksCount } = require('../../../../models/risks');

const Federations = { ...Groups };

Federations.addFederation = async (teamspace, project, federation) => addModel(teamspace, project,
	{ ...federation, federate: true });

Federations.deleteFederation = deleteModel;

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

const getLastUpdatesFromModels = async (teamspace, models) => {
	const lastUpdates = [];
	if (models) {
		await Promise.all(models.map(async (m) => {
			try {
				lastUpdates.push(await getLatestRevision(teamspace, m.model, { timestamp: 1 }));
			} catch {
				// do nothing. A container can have 0 revision.
			}
		}));
	}

	return lastUpdates.length ? lastUpdates.sort((a, b) => b.timestamp
        - a.timestamp)[0].timestamp : undefined;
};

Federations.getFederationStats = async (teamspace, federation) => {
	const { properties, status, subModels, category } = await getFederationById(teamspace, federation, {
		properties: 1,
		status: 1,
		subModels: 1,
		category: 1,
	});

	const [issueCount, riskCount, lastUpdates] = await Promise.all([
		getIssuesCount(teamspace, federation),
		getRisksCount(teamspace, federation),
		getLastUpdatesFromModels(teamspace, subModels),
	]);

	return {
		code: properties.code,
		status,
		subModels,
		category,
		lastUpdated: lastUpdates,
		tickets: { issues: issueCount, risks: riskCount },
	};
};

Federations.updateSettings = updateModelSettings;

Federations.getSettings = async (teamspace, federation) => getFederationById(teamspace,
	federation, { corID: 0, account: 0, permissions: 0, subModels: 0, federate: 0 });

module.exports = Federations;
