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

const { UUIDToString, generateUUID, stringToUUID } = require('../../../../../utils/helper/uuids');
const { addGroups, deleteGroups, getGroupById, getGroupsByIds, updateGroup } = require('../../../../../models/tickets.groups');
const { createResponseCode, templates } = require('../../../../../utils/responseCodes');
const { getArrayDifference, getCommonElements } = require('../../../../../utils/helper/arrays');
const {
	getExternalIdsFromMetadata,
	getMeshesWithParentIds,
	sharedIdsToExternalIds,
} = require('./scenes');
const { getLatestRevision, getRevisionByIdOrTag } = require('../../../../../models/revisions');
const { getMetadataByRules, getMetadataWithMatchingData } = require('../../../../../models/metadata');
const { idTypes, idTypesToKeys } = require('../../../../../models/metadata.constants');
const { removeFiles, storeFiles } = require('../../../../../services/filesManager');
const { TICKETS_RESOURCES_COL } = require('../../../../../models/tickets.constants');
const { getNestedProperty } = require('../../../../../utils/helper/objects');
const { getNodesByIds } = require('../../../../../models/scenes');
const { isUUID } = require('../../../../../utils/helper/typeCheck');
const { modelTypes } = require('../../../../../models/modelSettings.constants');

const TicketGroups = {};

const getObjectArrayFromRules = async (teamspace, project, model, revId, rules, returnMeshIds) => {
	let revision = revId;

	if (revision) {
		const rev = await getRevisionByIdOrTag(teamspace, model, modelTypes.CONTAINER, revision, { _id: 1 });
		revision = rev._id;
	} else {
		try {
			const rev = await getLatestRevision(teamspace, model, modelTypes.CONTAINER, { _id: 1 });
			revision = rev._id;
		} catch (err) {
			return { container: model, _ids: [] };
		}
	}

	const externalKeys = Object.values(idTypesToKeys).flat().map((n) => ({ key: n }));
	const projection = { parents: 1, ...(returnMeshIds ? {} : { metadata: { $elemMatch: { $or: externalKeys } } }) };

	const { matched, unwanted } = await getMetadataByRules(teamspace, project, model, revision, rules, projection);

	if (returnMeshIds) {
		const [
			matchedMeshIds,
			unwantedMeshIds,
		] = await Promise.all([
			matched.length ? getMeshesWithParentIds(teamspace, project, model, revision,
				matched.flatMap(({ parents }) => parents), true) : Promise.resolve([]),
			unwanted.length ? getMeshesWithParentIds(teamspace, project, model, revision,
				unwanted.flatMap(({ parents }) => parents), true) : Promise.resolve([]),
		]);

		return { container: model, _ids: getArrayDifference(unwantedMeshIds, matchedMeshIds).map(stringToUUID) };
	}

	const defaultType = Object.keys(idTypes)[0];
	let res = { container: model, [defaultType]: [] };

	if (!matched.length) return res;

	const wantedIds = getExternalIdsFromMetadata(matched);

	if (wantedIds) {
		if (unwanted.length) {
			const unwantedIds = getExternalIdsFromMetadata(unwanted, wantedIds.key);
			if (unwantedIds) {
				wantedIds.values = getArrayDifference(unwantedIds.values, wantedIds.values);
			}
		}
		res = { container: model, [wantedIds.key]: wantedIds.values };
	}

	return res;
};

const convertToExternalIds = async (teamspace, project, containerEntries) => {
	const convertedEntries = await Promise.all(containerEntries.map(async (entry) => {
		// eslint-disable-next-line no-underscore-dangle
		if (!entry._ids) {
			return entry;
		}

		// eslint-disable-next-line no-underscore-dangle
		const nodes = await getNodesByIds(teamspace, project, entry.container, entry._ids,
			{ _id: 0, shared_id: 1, rev_id: 1 });

		if (!nodes.length) {
			return entry;
		}
		const res = await sharedIdsToExternalIds(teamspace, entry.container, nodes[0].rev_id,
			nodes.map(({ shared_id }) => shared_id));

		const convertedObject = { ...entry };
		if (res) {
			// eslint-disable-next-line no-underscore-dangle
			delete convertedObject._ids;
			convertedObject[res.key] = res.values;
		}
		return convertedObject;
	}));

	return convertedEntries;
};

const convertToMeshIds = async (teamspace, project, revId, containerEntry) => {
	// eslint-disable-next-line no-underscore-dangle
	if (containerEntry._ids) {
		return containerEntry;
	}

	const { container } = containerEntry;

	let revision = revId;
	if (revision) {
		const rev = await getRevisionByIdOrTag(teamspace, container, modelTypes.CONTAINER, revision, { _id: 1 });
		revision = rev._id;
	} else {
		try {
			const rev = await getLatestRevision(teamspace, container, modelTypes.CONTAINER, { _id: 1 });
			revision = rev._id;
		} catch (err) {
			return undefined;
		}
	}

	const formattedEntry = { ...containerEntry };

	const idType = getCommonElements(Object.keys(containerEntry), Object.keys(idTypesToKeys))[0];
	const metadata = await getMetadataWithMatchingData(teamspace, container, revision,
		idTypesToKeys[idType], containerEntry[idType], { parents: 1 });

	const meshIds = await getMeshesWithParentIds(teamspace, project, container, revision,
		metadata.flatMap(({ parents }) => parents));

	delete formattedEntry[idType];
	return { ...formattedEntry, _ids: meshIds };
};

TicketGroups.processGroupsUpdate = (oldData, newData, fields, groupsState) => {
	fields.forEach((fieldName) => {
		const oldProp = getNestedProperty(oldData, fieldName) ?? [];
		const newProp = getNestedProperty(newData, fieldName) ?? [];

		oldProp.forEach(({ group }) => {
			groupsState.old.add(UUIDToString(group));

			if (newData === undefined || (newData && newData.state === undefined)) {
				// New data is not specified so we are preserving the old ones
				groupsState.stillUsed.add(UUIDToString(group));
			}
		});

		newProp.forEach((propData) => {
			const { group } = propData;
			if (isUUID(group)) {
				groupsState.stillUsed.add(UUIDToString(group));
			} else {
				const groupId = generateUUID();
				groupsState.toAdd.push({ ...group, _id: groupId });
				// eslint-disable-next-line no-param-reassign
				propData.group = groupId;
			}
		});
	});
};

TicketGroups.processExternalData = async (teamspace, project, model, ticketIds, data) => {
	const refsToRemove = [];
	const binariesToSave = [];

	await Promise.all(ticketIds.map(async (ticketId, i) => {
		const { binaries, groups } = data[i];

		if (groups.stillUsed.size) {
			const stillUsed = Array.from(groups.stillUsed);
			const existingGroups = await getGroupsByIds(teamspace, project, model, ticketId,
				stillUsed.map(stringToUUID), { _id: 1 });

			if (existingGroups.length !== stillUsed.length) {
				const notFoundGroups = getArrayDifference(existingGroups.map(({ _id }) => UUIDToString(_id)),
					stillUsed);
				throw createResponseCode(templates.invalidArguments, `The following groups are not found: ${notFoundGroups.join(',')}`);
			}
		}

		refsToRemove.push(...binaries.toRemove);

		binariesToSave.push(...binaries.toAdd.map(({ ref, data: bin }) => ({
			id: ref, data: bin, meta: { teamspace, project, model, ticket: ticketId },
		})));

		await Promise.all([
			groups.toAdd.length ? addGroups(teamspace, project, model, ticketId, groups.toAdd) : Promise.resolve(),
			groups.toRemove.length ? deleteGroups(teamspace, project, model, ticketId,
				groups.toRemove) : Promise.resolve(),
		]);
	}));

	const promsToWait = [];

	if (refsToRemove.length) promsToWait.push(removeFiles(teamspace, TICKETS_RESOURCES_COL, refsToRemove));
	if (binariesToSave.length) promsToWait.push(storeFiles(teamspace, TICKETS_RESOURCES_COL, binariesToSave));

	await Promise.all(promsToWait);
};

TicketGroups.addGroups = async (teamspace, project, model, ticket, groups) => {
	const convertedGroups = await Promise.all(groups.map(
		async (group) => {
			if (group.objects) {
				const objects = await convertToExternalIds(teamspace, project, group.objects);
				return { ...group, objects };
			}

			return group;
		}));

	await addGroups(teamspace, project, model, ticket, convertedGroups);
};

TicketGroups.deleteGroups = deleteGroups;

TicketGroups.getGroupsByIds = getGroupsByIds;

TicketGroups.updateTicketGroup = async (teamspace, project, model, ticket, groupId, data, author) => {
	const convertedData = { ...data };

	if (data.objects) {
		convertedData.objects = await convertToExternalIds(teamspace, project, data.objects);
	}

	await updateGroup(teamspace, project, model, ticket, groupId, convertedData, author);
};

TicketGroups.getTicketGroupById = async (teamspace, project, model, revId, ticket, groupId, returnMeshIds,
	containers) => {
	const group = await getGroupById(teamspace, project, model, ticket, groupId);

	const rev = containers ? undefined : revId;
	const modelsToQuery = containers || [model];

	if (group.rules) {
		group.objects = (await Promise.all(
			modelsToQuery.map(async (con) => {
				const objs = await getObjectArrayFromRules(teamspace, project, con, rev, group.rules, returnMeshIds);
				// eslint-disable-next-line no-underscore-dangle
				return objs._ids?.length || objs.revit_ids?.length || objs.ifc_guids?.length ? objs : [];
			}),
		)).flat();
	} else if (returnMeshIds) {
		group.objects = (await Promise.all(
			group.objects.map((obj) => (modelsToQuery.includes(obj.container)
				? convertToMeshIds(teamspace, project, rev, obj)
				: undefined))))
			.filter((ids) => ids);
	}

	return group;
};

module.exports = TicketGroups;
