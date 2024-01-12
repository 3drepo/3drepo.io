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

"use strict";

const { v5Path } = require("../../interop");

const { getCommonElements } = require(`${v5Path}/utils/helper/arrays`);
const { idTypes, idTypesToKeys } = require(`${v5Path}/models/metadata.constants`);
const { getMetadataWithMatchingData } = require(`${v5Path}/models/metadata`);
const { sharedIdsToExternalIds, getMeshesWithParentIds } = require(`${v5Path}/processors/teamspaces/projects/models/commons/scene`);
const { findProjectByModelId } = require(`${v5Path}/models/projectSettings.js`);

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const Meta = require("./meta");
const { findNodes } = require("./scene");
const { getHistory } = require("./history");
const { validateRules } = require("./helper/rule");
const db = require("../handler/db");
const ChatEvent = require("./chatEvent");

const { systemLogger } = require("../logger.js");

const fieldTypes = {
	"description": "[object String]",
	"name": "[object String]",
	"author": "[object String]",
	"createdAt": "[object Number]",
	"updatedBy": "[object String]",
	"updatedAt": "[object Number]",
	"objects": "[object Array]",
	"rules": "[object Array]",
	"color": "[object Array]",
	"transformation": "[object Array]",
	"issue_id": "[object Object]",
	"risk_id": "[object Object]",
	"sequence_id": "[object Object]",
	"view_id": "[object Object]"
};

const embeddedObjectFields = {
	"objects" : ["account", "model", "shared_ids", ...Object.values(idTypes)],
	"rules" : ["name", "field", "operator", "values"]
};

function cleanEmbeddedObject(field, data) {
	if(embeddedObjectFields[field]) {
		const filtered =  data.map((entry) => {
			const cleaned  = {};
			embeddedObjectFields[field].forEach((allowedField) => {
				if(utils.hasField(entry, allowedField)) {
					cleaned[allowedField] = entry[allowedField];
				}
			});
			return cleaned;
		});
		return filtered;
	}
	return data;
}

function cleanArray(obj, prop) {
	if (obj[prop] && 0 === obj[prop].length) {
		delete obj[prop];
	}

	return obj;
}

function clean(groupData) {
	groupData._id = utils.uuidToString(groupData._id);
	groupData.issue_id = groupData.issue_id && utils.uuidToString(groupData.issue_id);
	groupData.risk_id = groupData.risk_id && utils.uuidToString(groupData.risk_id);
	groupData.sequence_id = groupData.sequence_id && utils.uuidToString(groupData.sequence_id);
	groupData.view_id = groupData.view_id && utils.uuidToString(groupData.view_id);

	if (utils.isDate(groupData.createdAt)) {
		groupData.createdAt = groupData.createdAt.getTime();
	}

	if (utils.isDate(groupData.updatedAt)) {
		groupData.updatedAt = groupData.updatedAt.getTime();
	}

	cleanArray(groupData, "rules");
	cleanArray(groupData, "transformation");

	for (let i = 0; groupData.objects && i < groupData.objects.length; i++) {
		if (groupData.objects[i][idTypes.IFC]) {
			cleanArray(groupData.objects[i], idTypes.IFC);
		}
		if (groupData.objects[i].shared_ids) {
			cleanArray(groupData.objects[i], "shared_ids");
			groupData.objects[i].shared_ids = groupData.objects[i].shared_ids.map(x => utils.uuidToString(x));
		}
	}

	if(groupData.objects) {
		groupData.objects = groupData.objects.filter(obj => obj.ifc_guids || obj.shared_ids);
	}

	delete groupData.__v;

	return groupData;
}

function getGroupCollectionName(model) {
	return model + ".groups";
}

function getObjectIds(account, model, branch, revId, groupData, convertSharedIDsToString, showIfcGuids = false) {
	if (groupData.rules && groupData.rules.length > 0) {
		return Meta.findObjectIdsByRules(account, model, groupData.rules, branch, revId, convertSharedIDsToString, showIfcGuids);
	} else {
		return getObjectsArray(model, branch, revId, groupData, convertSharedIDsToString, showIfcGuids);
	}
}

function getObjectsArray(model, branch, revId, groupData, convertSharedIDsToString, showIfcGuids = false) {

	return Promise.all(groupData.objects.map(async({account, model:container, shared_ids, ...extIds}) => {

		if (showIfcGuids) {
			if (extIds[idTypes.IFC]) {
				return {account, model: container, [idTypes.IFC]: extIds[idTypes.IFC]};
			}
			return {account, model: container, [idTypes.IFC]: []};
		} else if(shared_ids) {
			return {account, model: container, shared_ids: convertSharedIDsToString ? shared_ids.map(utils.uuidToString) : shared_ids.map(utils.stringToUUID)};
		}

		// At this point, we're either trying to convert shared Ids to ifcGuids, or external ids to shared ids
		const {_id: conRevId} = await getHistory(
			account, container,
			model === container ? branch : "master",
			model === container && !branch ? revId : undefined,
			{_id: 1}
		);

		if(shared_ids) {

			const res = await sharedIdsToExternalIds(account, container, conRevId, shared_ids.map(utils.stringToUUID));

			if(res) {
				return {account, model: container, [res.key]: res.value};
			}

			return {account, model: container, [idTypes.IFC]: extIds[idTypes.IFC]};
		}

		const idType = getCommonElements(Object.keys(extIds), Object.keys(idTypesToKeys))[0];
		const metadata = await getMetadataWithMatchingData(account, container, conRevId,
			idTypesToKeys[idType], extIds[idType], { parents: 1 });

		if(metadata.length) {
			const {_id: project}  = await findProjectByModelId(account, container, {_id: 1});
			const meshIds = await getMeshesWithParentIds(account, project, container, conRevId,
				metadata.flatMap(({ parents }) => parents));

			const meshNodes = await findNodes(account, container, undefined, conRevId, {_id: {$in: meshIds}}, {shared_id: 1});
			return { account, model:container, shared_ids: meshNodes.map(({shared_id}) => convertSharedIDsToString ? utils.uuidToString(shared_id) : shared_id)};
		} else {
			return { account, model:container, shared_ids: []};
		}

	}));
}

/**
 * Converts all shared IDs to external ids if applicable and return the objects array.
 */
function getObjectsArrayAsExternalIds(account, model, branch, rId, data) {
	return Promise.all(data.objects.map(async (containerEntry) => {
		if (!(containerEntry.account && containerEntry.model)) {
			return Promise.reject(responseCodes.INVALID_GROUP);
		}

		// have to have shared_ids, IFC or RVT ids, but not more than one
		if (
			(!containerEntry[idTypes.IFC] && !containerEntry[idTypes.RVT] && !containerEntry.shared_ids) &&
			!(containerEntry[idTypes.IFC] && !containerEntry[idTypes.RVT] && !containerEntry.shared_ids) &&
			!(!containerEntry[idTypes.IFC] && containerEntry[idTypes.RVT] && !containerEntry.shared_ids) &&
			!(!containerEntry[idTypes.IFC] && !containerEntry[idTypes.RVT] && containerEntry.shared_ids)
		) {
			return Promise.reject(responseCodes.INVALID_GROUP);
		}

		if(!containerEntry.shared_ids) {
			return data;
		}

		const {_id: conRevId} = await getHistory(
			account, containerEntry.model,
			model === containerEntry.model ? branch : "master",
			model === containerEntry.model && !branch ? rId : undefined,
			{_id: 1}
		);

		const sharedIds = containerEntry.shared_ids.map(utils.stringToUUID);

		const externalIds = await sharedIdsToExternalIds(containerEntry.account, containerEntry.model, conRevId, sharedIds);

		if(externalIds) {
			return {account, model, [externalIds.key] : externalIds.values};
		}

		return containerEntry;

	}));

}

const Group = {};

Group.create = async function (account, model, branch = "master", rid = null, sessionId, creator = "", data) {
	const newGroup = {};

	const convertedObjects = Array.isArray(data.objects) ? await getObjectsArrayAsExternalIds(account, model, branch, rid, data, false) : undefined;

	let typeCorrect = (!data.objects !== !data.rules);

	Object.keys(data).forEach((key) => {
		if (fieldTypes[key]) {
			if (utils.typeMatch(data[key], fieldTypes[key])) {
				switch (key) {
					case "objects":
						if (data.objects) {
							newGroup.objects = cleanEmbeddedObject(key, convertedObjects);
						}
						break;
					case "rules":
						try{
							newGroup.rules = validateRules(data.rules);
						} catch{
							typeCorrect = false;
						}

						break;
					case "color":
						newGroup[key] = data[key].map((c) => parseInt(c, 10));
						break;
					default:
						newGroup[key] = data[key];
				}
			} else {
				systemLogger.logError(`Type mismatch ${key} ${data[key]}`);
				typeCorrect = false;
			}
		}
	});

	if (typeCorrect) {
		newGroup._id = utils.generateUUID();
		newGroup.author = creator;
		newGroup.createdAt = Date.now();

		await db.insertOne(account, getGroupCollectionName(model), newGroup);

		newGroup._id = utils.uuidToString(newGroup._id);
		newGroup.objects = await getObjectIds(account, model, branch, rid, newGroup, true, false);
		if (sessionId) {
			ChatEvent.newGroups(sessionId, account, model, newGroup);
		}

		return newGroup;
	} else {
		throw responseCodes.INVALID_ARGUMENTS;
	}
};

Group.deleteGroups = async function (account, model, sessionId, ids) {
	const groupIds = ids.map(utils.stringToUUID);
	await db.deleteMany(account, getGroupCollectionName(model), { _id: { $in: groupIds } });

	ChatEvent.groupsDeleted(sessionId, account, model, ids);
};

Group.deleteGroupsByViewId = async function (account, model, view_id) {
	return await db.deleteMany(account, getGroupCollectionName(model), { view_id });
};

Group.findByUID = async function (account, model, branch, revId, uid, showIfcGuids = false, noClean = true, convertToIfcGuids = false) {
	const foundGroup = await db.findOne(account, getGroupCollectionName(model), { _id: utils.stringToUUID(uid) });

	if (!foundGroup) {
		throw responseCodes.GROUP_NOT_FOUND;
	}

	if (convertToIfcGuids) {
		foundGroup.objects = await getObjectsArrayAsExternalIds(account, model, branch, revId, foundGroup);
	} else {
		try {
			foundGroup.objects = await getObjectIds(account, model, branch, revId, foundGroup, showIfcGuids);
		} catch (err) {
			// This can happen if there's no revisions
		}
	}

	return (noClean) ? foundGroup : clean(foundGroup);
};

Group.getList = async function (account, model, branch, revId, ids, queryParams, showIfcGuids) {
	const query = {};

	// If we want groups that aren't from issues
	if (queryParams.noIssues) {
		query.issue_id = { $exists: false };
	}

	// If we want groups that aren't from risks
	if (queryParams.noRisks) {
		query.risk_id = { $exists: false };
	}

	// If we want groups that aren't from sequences
	if (queryParams.noSequences) {
		query.sequence_id = { $exists: false };
	}

	// If we want groups that aren't from views
	if (queryParams.noViews) {
		query.view_id = { $exists: false };
	}

	if (queryParams.updatedSince) {
		const updatedSince = parseFloat(queryParams.updatedSince);

		query.$or = [
			{
				createdAt: { $gte: new Date(updatedSince) },  updatedAt: { $exists: false}
			},
			{
				updatedAt: { $gte: updatedSince }
			}
		];
	}

	if (ids) {
		query._id = {$in: utils.stringsToUUIDs(ids)};
	}

	const results = await db.find(account, getGroupCollectionName(model), query);

	const sharedIdConversionPromises = [];

	results.forEach(result => {
		const getObjIdProm = getObjectIds(account, model, branch, revId, result, true, showIfcGuids)
			.then((sharedIdObjects) => {
				result.objects = sharedIdObjects;
				return clean(result);
			}).catch(() => clean(result));
		sharedIdConversionPromises.push(getObjIdProm);
	});

	return Promise.all(sharedIdConversionPromises);
};

Group.update = async function (account, model, branch = "master", revId = null, sessionId, user = "", groupId, data) {
	const group = await Group.findByUID(account, model, branch, revId, groupId);

	const convertedObjects = Array.isArray(data.objects) ? await getObjectsArrayAsExternalIds(account, model, branch, revId, data, false) : undefined;
	const toUpdate = {};
	const toUnset = {};

	let typeCorrect = !(data.rules && data.objects);

	typeCorrect && Object.keys(data).forEach((key) => {
		if (data[key]) {
			if (utils.typeMatch(data[key], fieldTypes[key])) {
				switch (key) {
					case "rules":
						try{
							toUpdate.rules = validateRules(data.rules);
						} catch{
							typeCorrect = false;
							toUnset.objects = 1;
							group.objects = undefined;
						}

						break;
					case "objects":
						toUpdate.objects = cleanEmbeddedObject(key, convertedObjects);
						toUnset.rules = 1;
						group.rules = undefined;
						break;
					case "color":
						toUpdate[key] = data[key].map((c) => parseInt(c, 10));
						break;
					default:
						toUpdate[key] = data[key];
				}
				group[key] = toUpdate[key];
			} else {
				typeCorrect = false;
			}
		}
	});

	if (typeCorrect) {
		if (Object.keys(toUpdate).length !== 0) {
			toUpdate.updatedBy = user;
			toUpdate.updatedAt = Date.now();

			const updateBson = {$set: toUpdate};

			if (Object.keys(toUnset).length > 0) {
				updateBson.$unset = toUnset;
			}

			await db.updateOne(account, getGroupCollectionName(model), { _id: group._id }, updateBson);
		}

		clean(group);
	} else {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	try {
		group.objects = await getObjectIds(account, model, branch, revId, group, true, false);
	} catch (err) {
		// if we failed to get the object Ids it shouldn't represent itself as an error.
		// This is possible if there's no revisions.:

	}

	if (sessionId) {
		ChatEvent.groupChanged(sessionId, account, model, group);
	}

	return group;
};

module.exports = Group;
