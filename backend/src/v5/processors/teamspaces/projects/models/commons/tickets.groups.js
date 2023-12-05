/* eslint-disable no-underscore-dangle */
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
const { getMetadataByRules, getMetadataByValues, sharedIdsToExternalIds } = require('../../../../../models/metadata');
const { getNodesByByIds, getNodesBySharedIds } = require('../../../../../models/scenes');
const { getFile } = require('../../../../../services/filesManager');
const { getLatestRevision } = require('../../../../../models/revisions');

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

const convert3dRepoGuidsToExternalIds = async (teamspace, project, objects) => {
	const convertedObjects = await Promise.all(objects.map(async (obj) => {
		const convertedObject = { ...obj };

		if (obj._ids) {
			let externalIds;
			let externalIdsName;

			let shared_ids = await getNodesByByIds(teamspace, project, obj.container, obj._ids,
				{ _id: 0, shared_id: 1 });
			shared_ids = shared_ids.map((s) => s.shared_id);

			externalIds = await sharedIdsToExternalIds(teamspace, obj.container, shared_ids, 'IFC GUID');
			if (externalIds?.length) {
				externalIdsName = 'ifc_guids';
			} else {
				externalIds = await sharedIdsToExternalIds(teamspace, obj.container, shared_ids, 'Element ID');
				if (externalIds?.length) {
					externalIdsName = 'revitIds';
				}
			}

			if (externalIds?.length) {
				delete convertedObject._ids;
				convertedObject[externalIdsName] = externalIds.map((g) => g.metadata[0].value);
			}
		}

		return convertedObject;
	}));

	return convertedObjects;
};

const convertExternalIdsTo3dRepoGuids = async (teamspace, project, revId, objects) => {
	const convertedObjects = await Promise.all(objects.map(async (obj) => {
		if (obj._ids) {
			return obj;
		}

		const convertedObject = { ...obj };

		let revision = revId;
		if (!revision) {
			try {
				const rev = await getLatestRevision(teamspace, obj.container, { _id: 1 });
				revision = rev._id;
			} catch (err) {
				return convertedObject;
			}
		}

		let metadata;
		if (obj.revitIds) {
			metadata = await getMetadataByValues(teamspace, obj.container, revision, 'Element ID', obj.revitIds, { parents: 1 });
			delete convertedObject.revitIds;
		} else if (obj.ifc_guids) {
			metadata = await getMetadataByValues(teamspace, obj.container, revision, 'IFC GUID', obj.ifc_guids, { parents: 1 });
			delete convertedObject.ifc_guids;
		}

		const nodes = await getNodesBySharedIds(teamspace, project, obj.container, revision,
			metadata.flatMap(({ parents }) => parents), { _id: 1 });

		convertedObject._ids = nodes.map(({ _id }) => _id);

		return convertedObject;
	}));

	return convertedObjects;
};

TicketGroups.addGroups = async (teamspace, project, model, ticket, groups) => {
	const convertedGroups = await Promise.all(groups.map(
		async (group) => {
			const objects = await convert3dRepoGuidsToExternalIds(teamspace, project, group.objects);
			return { ...group, objects };
		}));

	await addGroups(teamspace, project, model, ticket, convertedGroups);
};

TicketGroups.updateTicketGroup = async (teamspace, project, model, ticket, groupId, data, author) => {
	const convertedData = { ...data };

	if (data.objects) {
		convertedData.objects = await convert3dRepoGuidsToExternalIds(teamspace, project, data.objects);
	}

	await updateGroup(teamspace, project, model, ticket, groupId, convertedData, author);
};

TicketGroups.getTicketGroupById = async (teamspace, project, model, revId, ticket, groupId, containers,
	convertTo3DRepoGuids) => {
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

	if (convertTo3DRepoGuids) {
		group.objects = await convertExternalIdsTo3dRepoGuids(teamspace, project, revId, group.objects);
	}

	return group;
};

module.exports = TicketGroups;
