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
const { addRevision, getLatestRevision } = require('../../../../models/revisions');
const { appendFavourites, deleteFavourites } = require('./commons/favourites');
const { getFederationById, getFederations, updateModelSettings } = require('../../../../models/modelSettings');
const { getOpenTicketsCount, getOpenTicketsCountForMultipleModels } = require('./commons/tickets');
const AllJSONAssets = require('./commons/assets/json');
const Comments = require('./commons/tickets.comments');
const Groups = require('./commons/groups');
const TicketGroups = require('./commons/tickets.groups');
const Tickets = require('./commons/tickets');
const Views = require('./commons/views');

const { getModelMD5Hash } = require('./commons/modelList');
const { getProjectById } = require('../../../../models/projectSettings');
const { getRepoBundleInfo } = require('./commons/assets/bundles');
const { getSuperMeshesInfo } = require('./containers');
const { modelTypes } = require('../../../../models/modelSettings.constants');
const { splitArrayIntoChunks } = require('../../../../utils/helper/arrays');
const { updateModelSubModels } = require('../../../../models/modelSettings');

const { getTree, ...JSONAssets } = AllJSONAssets;

const Federations = { ...Groups, ...Views, ...Tickets, ...Comments, ...TicketGroups, ...JSONAssets };

// Override
Federations.getTicketGroupById = (
	teamspace, project, federation, revId, ticket, groupId, convertToMeshIds, containers,
) => TicketGroups.getTicketGroupById(teamspace, project, federation, revId,
	ticket, groupId, convertToMeshIds, containers?.length ? containers.map(({ container }) => container) : undefined);

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

Federations.newRevision = async (teamspace, project, federation, info) => {
	const revisionId = await addRevision(teamspace, project, federation, modelTypes.FEDERATION, {
		containers: info.containers,
		author: info.owner,
	});
	await updateModelSubModels(teamspace, project, federation, info.owner, revisionId, info.containers);
};

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

Federations.getMD5Hash = (teamspace, containers) => Promise.all(
	containers.map(({ container, revision }) => getModelMD5Hash(teamspace, container, revision)));

Federations.getRepoBundleInfo = getRepoBundleInfo;

Federations.getSuperMeshesInfo = async (teamspace, federation, revision, containers) => {
	const supermeshData = await Promise.all(containers.map(async ({ container, revision: containerRev }) => {
		const data = await getSuperMeshesInfo(teamspace, container, containerRev);
		return { teamspace, model: container, superMeshes: data };
	}));
	return { subModels: supermeshData };
};

Federations.getMultipleFederationsStats = async (teamspace, project, federations) => {
	const stats = {};

	const [settings, ticketCounts] = await Promise.all([
		getFederations(
			teamspace, federations, { properties: 1, status: 1, subModels: 1, desc: 1 },
		),
		getOpenTicketsCountForMultipleModels(teamspace, project, federations),
	]);

	const listOfPromises = splitArrayIntoChunks(settings.map(async (setting) => {
		stats[setting._id] = {
			code: setting.properties?.code,
			unit: setting.properties?.unit,
			status: setting?.status,
			containers: setting?.subModels,
			desc: setting?.desc,
			lastUpdated: await getLastUpdatesFromModels(
				teamspace, setting.subModels ? setting.subModels.map(({ _id }) => _id) : setting.subModels,
			),
			tickets: ticketCounts[setting._id] || 0,
		};
	}), 25);

	for (const promises of listOfPromises) {
		// eslint-disable-next-line no-await-in-loop
		await Promise.all(promises);
	}

	return stats;
};

module.exports = Federations;
