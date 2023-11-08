/**
 *  Copyright (C) 2023 3D Repo Ltd
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

const { UUIDToString, stringToUUID } = require('../../../../../utils/helper/uuids');
const { addGroups, getGroupById, updateGroup } = require('../../../../../models/tickets.groups');
const { getFile } = require('../../../../../services/filesManager');
const { getLatestRevision } = require('../../../../../models/revisions');
const { getMetadataByRules, repoIdsToExternalIds } = require('../../../../../models/metadata');
const { getNodesBySharedIds } = require('../../../../../models/scenes');

const TicketGroups = {};

const getIdToMeshesMapping = async (teamspace, model, revId) => {
	const fileData = await getFile(teamspace, `${model}.stash.json_mpc`, `${UUIDToString(revId)}/idToMeshes.json`);
	return JSON.parse(fileData);
};

const getObjectArrayFromRules = async (teamspace, project, model, revId, rules) => {
	let revision = revId;
	if (!revision) {
		try {
			const rev = await getLatestRevision(teamspace, model, { _id: 1 });
			revision = rev._id;
		} catch (err) {
			return { container: model, _ids: [] };
		}
	}

	const [
		{ matched, unwanted },
		idToMeshes,
	] = await Promise.all([
		getMetadataByRules(teamspace, project, model, revision, rules, { parents: 1 }),
		getIdToMeshesMapping(teamspace, model, revision),
	]);

	const [
		matchedNodes,
		unwantedNodes,
	] = await Promise.all([
		matched.length ? getNodesBySharedIds(teamspace, project, model, revision,
			matched.flatMap(({ parents }) => parents), { _id: 1 }) : Promise.resolve([]),
		unwanted.length ? getNodesBySharedIds(teamspace, project, model, revision,
			unwanted.flatMap(({ parents }) => parents), { _id: 1 }) : Promise.resolve([]),
	]);

	const matchedMeshes = {};

	matchedNodes.forEach(({ _id }) => {
		const idStr = UUIDToString(_id);
		if (idToMeshes[idStr]) {
			idToMeshes[idStr].forEach((id) => {
				matchedMeshes[id] = stringToUUID(id);
			});
		}
	});

	unwantedNodes.forEach(({ _id }) => {
		const idStr = UUIDToString(_id);
		if (idToMeshes[idStr]) {
			idToMeshes[idStr].forEach((id) => delete matchedMeshes[id]);
		}
	});

	return { container: model, _ids: Object.values(matchedMeshes) };
};

const convertObjectIds = async (teamspace, model, group) => {
	const convertedObjects = await Promise.all(group.objects.map(async (obj) => {
		const convertedObject = obj;

		if (obj._ids) {
			let externalIds;
			let externalIdsName;

			externalIds = await repoIdsToExternalIds(teamspace, model, obj._ids, 'IFC GUID');
			if (externalIds?.length) {
				externalIdsName = 'ifcGuids';
			} else {
				externalIds = await repoIdsToExternalIds(teamspace, model, obj._ids, 'Element ID');
				if (externalIds?.length) {
					externalIdsName = 'revitIds';
				}
			}

			if (externalIds.length) {
				delete convertedObject._ids;
				convertedObject[externalIdsName] = externalIds.map((g) => g.metadata[0].value);
			}
		}

		return convertedObject;
	}));

	return convertedObjects;
};

TicketGroups.addGroups = async (teamspace, project, model, ticket, groups) => {
	const convertedGroups = await Promise.all(groups.map(async (g) => {
		const convertedObjects = await convertObjectIds(teamspace, model, g);
		return { ...g, objects: convertedObjects };
	}));

	await addGroups(teamspace, project, model, ticket, convertedGroups);
};

TicketGroups.updateTicketGroup = updateGroup;

TicketGroups.getTicketGroupById = async (teamspace, project, model, revId, ticket, groupId, containers) => {
	const group = await getGroupById(teamspace, project, model, ticket, groupId);

	if (group.rules) {
		const modelsToQuery = containers || [model];
		const rev = containers ? undefined : revId;

		group.objects = (await Promise.all(
			modelsToQuery.map(async (con) => {
				const objs = await getObjectArrayFromRules(teamspace, project, con, rev, group.rules);
				// eslint-disable-next-line no-underscore-dangle
				return objs._ids.length ? objs : [];
			}),
		)).flat();
	}

	return group;
};

module.exports = TicketGroups;
