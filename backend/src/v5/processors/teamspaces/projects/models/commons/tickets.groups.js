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
/* eslint-disable no-underscore-dangle */

const { UUIDToString, stringToUUID } = require('../../../../../utils/helper/uuids');
const { addGroups, getGroupById, updateGroup } = require('../../../../../models/tickets.groups');
const { getIdToMeshesMapping, getMeshesWithParentIds } = require('./scene');
const { getMetadataByQuery, getMetadataByRules } = require('../../../../../models/metadata');
const { getNodesByIds, getNodesBySharedIds } = require('../../../../../models/scenes');
const { getCommonElements } = require('../../../../../utils/helper/arrays');
const { getLatestRevision } = require('../../../../../models/revisions');
const { idTypesToKeys } = require('../../../../../models/tickets.groups.constants');

const TicketGroups = {};

const getExteralIdNameFromMetadata = (metadata) => {
	let externalIdName;
	Object.keys(idTypesToKeys).forEach((name) => {
		if (idTypesToKeys[name].some((m) => m === metadata[0].metadata[0].key)) {
			externalIdName = name;
		}
	});

	return externalIdName;
};

const getObjectArrayFromRules = async (teamspace, project, model, revId, rules, convertTo3dRepoIds) => {
	let revision = revId;
	if (!revision) {
		try {
			const rev = await getLatestRevision(teamspace, model, { _id: 1 });
			revision = rev._id;
		} catch (err) {
			return { container: model, _ids: [] };
		}
	}

	const projection = { parents: 1,
		...(convertTo3dRepoIds ? {} : { metadata: {
			$elemMatch: { $or: Object.values(idTypesToKeys).flat().map((n) => ({ key: n })) } } }) };

	const { matched, unwanted } = await getMetadataByRules(teamspace, project, model, revision, rules, projection);

	if (!convertTo3dRepoIds && matched.some((m) => m.metadata)) {
		const wantedIds = [...new Set(matched.map(({ metadata }) => metadata[0].value))];
		const unwantedIds = [...new Set(unwanted.map(({ metadata }) => metadata[0].value))];

		unwantedIds.filter((id) => (wantedIds.includes(id))).forEach((id) => delete wantedIds[id]);

		const externalIdName = getExteralIdNameFromMetadata(matched);
		return { container: model, [externalIdName]: wantedIds };
	}

	const idToMeshes = await getIdToMeshesMapping(teamspace, model, revision);
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

const convert3dRepoIdsToExternalIds = async (teamspace, project, objects) => {
	const convertedObjects = await Promise.all(objects.map(async (obj) => {
		if (!obj._ids) {
			return obj;
		}

		const convertedObject = { ...obj };

		const shared_ids = await getNodesByIds(teamspace, project, obj.container, obj._ids,
			{ _id: 0, shared_id: 1 });

		const externalIdKeys = Object.values(idTypesToKeys).flat();
		const query = { parents: { $in: shared_ids.map((s) => s.shared_id) }, 'metadata.key': { $in: externalIdKeys } };
		const projection = { metadata: { $elemMatch: { $or: externalIdKeys.map((n) => ({ key: n })) } } };
		const metadata = await getMetadataByQuery(teamspace, obj.container, query, projection);

		if (metadata?.length) {
			delete convertedObject._ids;
			const externalIdName = getExteralIdNameFromMetadata(metadata);
			convertedObject[externalIdName] = [...new Set(metadata.map((m) => m.metadata[0].value))];
		}

		return convertedObject;
	}));

	return convertedObjects;
};

const convertToInternalIds = async (teamspace, project, revId, containerEntries) => {
	const convertedEntries = await Promise.all(containerEntries.map(async (entry) => {
		if (entry._ids) {
			return entry;
		}

		const { container } = entry;

		let revision = revId;
		if (!revision) {
			try {
				const rev = await getLatestRevision(teamspace, container, { _id: 1 });
				revision = rev._id;
			} catch (err) {
				return [];
			}
		}

		const idType = getCommonElements(Object.keys(entry), Object.keys(idTypesToKeys))[0];

		const query = {
			rev_id: revision,
			metadata: { $elemMatch: { key: { $in: idTypesToKeys[idType] },
				value: { $in: entry[idType] } } },
		};

		const metadata = await getMetadataByQuery(teamspace, container, query, { parents: 1 });
		const meshIds = await getMeshesWithParentIds(teamspace, project, container, revision,
			metadata.flatMap(({ parents }) => parents));

		return { ...entry, [idType]: undefined, _ids: meshIds };
	}));

	return convertedEntries.flat();
};

TicketGroups.addGroups = async (teamspace, project, model, ticket, groups) => {
	const convertedGroups = await Promise.all(groups.map(
		async (group) => {
			if (group.objects) {
				const objects = await convert3dRepoIdsToExternalIds(teamspace, project, group.objects);
				return { ...group, objects };
			}

			return group;
		}));

	await addGroups(teamspace, project, model, ticket, convertedGroups);
};

TicketGroups.updateTicketGroup = async (teamspace, project, model, ticket, groupId, data, author) => {
	const convertedData = { ...data };

	if (data.objects) {
		convertedData.objects = await convert3dRepoIdsToExternalIds(teamspace, project, data.objects);
	}

	await updateGroup(teamspace, project, model, ticket, groupId, convertedData, author);
};

TicketGroups.getTicketGroupById = async (teamspace, project, model, revId, ticket, groupId, convertTo3dRepoIds,
	containers) => {
	const group = await getGroupById(teamspace, project, model, ticket, groupId);

	const rev = containers ? undefined : revId;

	if (group.rules) {
		const modelsToQuery = containers || [model];

		group.objects = (await Promise.all(
			modelsToQuery.map(async (con) => {
				const objs = await getObjectArrayFromRules(teamspace, project, con, rev,
					group.rules, convertTo3dRepoIds);
				// eslint-disable-next-line no-underscore-dangle
				return objs._ids?.length || objs.revit_ids?.length || objs.ifc_guids?.length ? objs : [];
			}),
		)).flat();
	} else if (convertTo3dRepoIds) {
		group.objects = await convertToInternalIds(teamspace, project, rev, group.objects);
	}

	return group;
};

module.exports = TicketGroups;
