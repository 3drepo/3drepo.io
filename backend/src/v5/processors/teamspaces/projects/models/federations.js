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
const Comments = require('./commons/tickets.comments');
const Groups = require('./commons/groups');
const TicketGroups = require('./commons/tickets.groups');
const Tickets = require('./commons/tickets');
const Views = require('./commons/views');
const { getLatestRevision } = require('../../../../models/revisions');
const { getOpenTicketsCount } = require('./commons/tickets');
const { getProjectById } = require('../../../../models/projectSettings');
const { modelTypes } = require('../../../../models/modelSettings.constants');
const { queueFederationUpdate } = require('../../../../services/modelProcessing');

const Federations = { ...Groups, ...Views, ...Tickets, ...Comments, ...TicketGroups };

// Override
Federations.getTicketGroupById = async (teamspace, project, federation, revId, ticket, groupId, convertToMeshIds) => {
	const { subModels: containers } = await getFederationById(teamspace, federation, { subModels: 1 });
	return TicketGroups.getTicketGroupById(teamspace, project, federation, revId,
		ticket, groupId, convertToMeshIds, containers ? containers.map(({ _id }) => _id) : undefined);
};

Federations.addFederation = (teamspace, project, federation) => addModel(teamspace, project,
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

Federations.newRevision = queueFederationUpdate;

const getLastUpdatesFromModels = async (teamspace, models) => {
	const lastUpdates = [];
	if (models) {
		await Promise.all(models.map(async (m) => {
			try {
				lastUpdates.push(await getLatestRevision(teamspace, m, modelTypes.FEDERATION, { timestamp: 1 }));
			} catch {
				// do nothing. A container can have 0 revision.
			}
		}));
	}

	return lastUpdates.length ? lastUpdates.sort((a, b) => b.timestamp
        - a.timestamp)[0].timestamp : undefined;
};

Federations.getFederationStats = async (teamspace, project, federation) => {
	const { properties, status, subModels: containers, desc } = await getFederationById(teamspace, federation, {
		properties: 1,
		status: 1,
		subModels: 1,
		desc: 1,
	});

	const [ticketsCount, lastUpdates] = await Promise.all([
		getOpenTicketsCount(teamspace, project, federation),
		getLastUpdatesFromModels(teamspace, containers ? containers.map(({ _id }) => _id) : containers),
	]);

	return {
		code: properties.code,
		unit: properties.unit,
		status,
		containers,
		desc,
		lastUpdated: lastUpdates,
		tickets: ticketsCount,
	};
};

Federations.updateSettings = updateModelSettings;

Federations.getSettings = (teamspace, federation) => getFederationById(teamspace,
	federation, { corID: 0, account: 0, permissions: 0, subModels: 0, federate: 0 });

module.exports = Federations;
