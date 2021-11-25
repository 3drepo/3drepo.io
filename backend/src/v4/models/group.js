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

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const Meta = require("./meta");
const { checkRulesValidity } = require("./helper/rule");
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
	"objects" : ["account", "model", "shared_ids", "ifc_guids"],
	"rules" : ["field", "operator", "values"]
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
		cleanArray(groupData.objects[i], "ifc_guids");
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

function getObjectIds(account, model, branch, revId, groupData, convertSharedIDsToString, showIfcGuids = false, profile = {}) {
	if (groupData.rules && groupData.rules.length > 0) {
		return Meta.findObjectIdsByRules(account, model, groupData.rules, branch, revId, convertSharedIDsToString, showIfcGuids, profile);
	} else {
		return getObjectsArray(model, branch, revId, groupData, convertSharedIDsToString, showIfcGuids);
	}
}

/**
 * Converts all IFC Guids to shared IDs if applicable and return the objects array.
 */
function getObjectsArray(model, branch, revId, groupData, convertSharedIDsToString, showIfcGuids = false) {
	const objectIdPromises = [];

	for (let i = 0; i < groupData.objects.length; i++) {
		const objectId = {};
		objectId.account = groupData.objects[i].account;
		objectId.model = groupData.objects[i].model;

		const _branch = (model === objectId.model) ? branch : "master";
		const _revId = (model === objectId.model) ? revId : null;

		const ifcGuids = groupData.objects[i].ifc_guids || [];

		const objectIdsSet = groupData.objects[i].shared_ids ? new Set(groupData.objects[i].shared_ids.map(utils.uuidToString)) : new Set();

		if (showIfcGuids) {
			objectId.ifc_guids = ifcGuids;
			objectIdPromises.push(objectId);
		} else {
			objectIdPromises.push(Meta.ifcGuidsToUUIDs(
				objectId.account,
				objectId.model,
				_branch,
				_revId,
				ifcGuids
			).then(sharedIdResults => {
				for (let j = 0; j < sharedIdResults.length; j++) {
					objectIdsSet.add(utils.uuidToString(sharedIdResults[j].shared_id));
				}

				if (objectIdsSet.size > 0) {
					objectId.shared_ids = [];
					objectIdsSet.forEach(id => {
						if (!convertSharedIDsToString) {
							id = utils.stringToUUID(id);
						}
						objectId.shared_ids.push(id);
					});
				}

				return objectId;
			}));
		}
	}

	return Promise.all(objectIdPromises);
}

/**
 * Converts all shared IDs to IFC Guids if applicable and return the objects array.
 */
function getObjectsArrayAsIfcGuids(data) {
	const ifcGuidPromises = [];

	for (let i = 0; data && data.objects && i < data.objects.length; i++) {
		const account = data.objects[i].account;
		const model = data.objects[i].model;

		if (!(account && model) || (!data.objects[i].ifc_guids && !data.objects[i].shared_ids)) {
			return Promise.reject(responseCodes.INVALID_GROUP);
		}

		const sharedIdsSet = new Set();
		const ifcGuidsSet = new Set();

		const objectList = data.objects[i].shared_ids ? data.objects[i].shared_ids : [];
		const sharedIds = [];

		for (let j = 0; j < objectList.length; j++) {
			if (utils.isString(objectList[j])) {
				sharedIds.push(utils.stringToUUID(objectList[j]));
			}

			sharedIdsSet.add(utils.uuidToString(sharedIds[j]));
		}

		if (data.objects[i].ifc_guids) {
			data.objects[i].ifc_guids.forEach(ifcGuid => {
				ifcGuidsSet.add(ifcGuid);
			});
		}

		ifcGuidPromises.push(
			Meta.uuidsToIfcGuids(account, model, sharedIds).then(ifcGuids => {
				if (ifcGuids && ifcGuids.length > 0) {
					for (let j = 0; j < ifcGuids.length; j++) {
						ifcGuidsSet.add(ifcGuids[j].metadata[0].value);

						for (let k = 0; k < ifcGuids[j].parents.length; k++) {
							sharedIdsSet.delete(utils.uuidToString(ifcGuids[j].parents[k]));
						}
					}
				}

				const convertedObjectsResponse = {
					account,
					model
				};

				if (sharedIdsSet.size > 0) {
					convertedObjectsResponse.shared_ids = [];
					sharedIdsSet.forEach(id => {
						convertedObjectsResponse.shared_ids.push(utils.stringToUUID(id));
					});
				}

				if (ifcGuidsSet.size > 0) {
					convertedObjectsResponse.ifc_guids = [];
					ifcGuidsSet.forEach(id => {
						convertedObjectsResponse.ifc_guids.push(id);
					});
				}

				return convertedObjectsResponse;
			})
		);
	}

	return Promise.all(ifcGuidPromises).then(ifcObjects => {
		return ifcObjects;
	});
}

const Group = {};

Group.create = async function (account, model, branch = "master", rid = null, sessionId, creator = "", data) {
	const newGroup = {};

	const convertedObjects = await getObjectsArrayAsIfcGuids(data, false);

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
						if (data.rules && !checkRulesValidity(data.rules)) {
							typeCorrect = false;
						}
						newGroup[key] = cleanEmbeddedObject(key, data[key]);
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
		foundGroup.objects = await getObjectsArrayAsIfcGuids(foundGroup, false);
	} else {
		try {
			foundGroup.objects = await getObjectIds(account, model, branch, revId, foundGroup, showIfcGuids);
		} catch (err) {
			// This can happen if there's no revisions
		}
	}

	return (noClean) ? foundGroup : clean(foundGroup);
};

Group.getList = async function (account, model, branch, revId, ids, queryParams, showIfcGuids, profile) {
	profile.getList = { start: Date.now()};
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

	profile.dbQuery = { start: Date.now()};
	const results = await db.find(account, getGroupCollectionName(model), query);
	profile.dbQuery.end = Date.now();
	const sharedIdConversionPromises = [];

	profile.conversion = { start: Date.now()};
	results.forEach(result => {
		sharedIdConversionPromises.push(
			getObjectIds(account, model, branch, revId, result, true, showIfcGuids, profile).then((sharedIdObjects) => {
				result.objects = sharedIdObjects;
				return clean(result);
			}).catch(() => clean(result))
		);
	});

	const res = await Promise.all(sharedIdConversionPromises);
	profile.conversion.end = Date.now();
	profile.getList.end = Date.now();
	return res;
};

Group.update = async function (account, model, branch = "master", revId = null, sessionId, user = "", groupId, data) {
	const group = await Group.findByUID(account, model, branch, revId, groupId);

	const convertedObjects = await getObjectsArrayAsIfcGuids(data, false);
	const toUpdate = {};
	const toUnset = {};

	let typeCorrect = !(data.rules && data.objects);

	typeCorrect && Object.keys(data).forEach((key) => {
		if (data[key]) {
			if (utils.typeMatch(data[key], fieldTypes[key])) {
				switch (key) {
					case "rules":
						if (!checkRulesValidity(data.rules)) {
							typeCorrect = false;
							toUnset.objects = 1;
							group.objects = undefined;
						}

						toUpdate[key] = cleanEmbeddedObject(key, data[key]);
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
