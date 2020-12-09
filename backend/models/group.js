/**
 *  Copyright (C) 2014 3D Repo Ltd
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

const _ = require("lodash");
const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const utils = require("../utils");
const nodeuuid = require("uuid/v1");
const Schema = mongoose.Schema;
const responseCodes = require("../response_codes.js");
const Meta = require("./meta");
const History = require("./history");
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
	"view_id": "[object Object]"
};

const embeddedObjectFields = {
	"objects" : ["account", "model", "shared_ids", "ifc_guids"],
	"rules" : ["field", "operator", "values"]
};

const groupSchema = new Schema({
	_id: Object,
	name: String,
	author: String,
	description: String,
	createdAt: Date,
	updatedAt: Number,
	updatedBy: String,
	objects: {
		type: [{
			_id: false,
			account: String,
			model: String,
			shared_ids: {
				type: [],
				required: false
			},
			ifc_guids: {
				type: [String],
				required: false
			}
		}],
		required: false
	},
	rules: {
		type: [{
			_id: false,
			field: String,
			operator: String,
			values: []
		}],
		required: false
	},
	issue_id: {
		type: Object,
		required: false
	},
	risk_id: {
		type: Object,
		required: false
	},
	view_id: {
		type: Object,
		required: false
	},
	color: [Number],
	transformation: [Number]
});

groupSchema.statics.ifcGuidsToUUIDs = function (account, model, ifcGuids, branch, revId) {
	if(!ifcGuids || ifcGuids.length === 0) {
		return Promise.resolve([]);
	}

	const query = {"metadata.IFC GUID": { $in: ifcGuids } };
	const project = { parents: 1, _id: 0 };

	return db.getCollection(account, model + ".scene").then(dbCol => {
		return dbCol.find(query, project).toArray().then(results => {
			if(results.length === 0) {
				return [];
			}
			return History.getHistory({ account, model }, branch, revId).then(history => {
				if (!history) {
					return Promise.reject(responseCodes.INVALID_TAG_NAME);
				} else {

					const parents = results.map(x => x = x.parents).reduce((acc, val) => acc.concat(val), []);

					const meshQuery = { _id: { $in: history.current }, shared_id: { $in: parents }, type: "mesh" };
					const meshProject = { shared_id: 1, _id: 0 };

					return dbCol.find(meshQuery, meshProject).toArray();
				}
			});
		});
	});

};

groupSchema.statics.uuidToIfcGuids = function (obj) {
	const account = obj.account;
	const model = obj.model;

	const uid = ("[object String]" !== Object.prototype.toString.call(uid)) ? utils.uuidToString(uid) : obj.shared_id;
	const parent = utils.stringToUUID(uid);

	return Meta.find({ account, model }, { type: "meta", parents: parent, "metadata.IFC GUID": { $exists: true } }, { "parents": 1, "metadata.IFC GUID": 1 })
		.then(results => {
			const ifcGuids = [];
			results.forEach(res => {
				if (this.isIfcGuid(res.metadata["IFC GUID"])) {
					ifcGuids.push(res.metadata["IFC GUID"]);
				}
			});
			return ifcGuids;
		});
};

function uuidsToIfcGuids(account, model, ids) {
	const query = { type: "meta", parents: { $in: ids }, "metadata.IFC GUID": { $exists: true } };
	const project = { "metadata.IFC GUID": 1, parents: 1 };
	return db.getCollection(account, model + ".scene").then(dbCol => {
		return dbCol.find(query, project).toArray().then(results => {
			return results;
		});
	});
}

/**
 * IFC Guid definition: [0-9,A-Z,a-z,_$]* (length = 22)
 */
groupSchema.statics.isIfcGuid = function (value) {
	return value && 22 === value.length;
};

/**
 * Converts all shared IDs to IFC Guids if applicable and return the objects array.
 */
groupSchema.methods.getObjectsArrayAsIfcGuids = function (data) {
	const ifcGuidPromises = [];

	if (!data) {
		data = this;
	}

	for (let i = 0; data.objects && i < data.objects.length; i++) {
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
			if ("[object String]" === Object.prototype.toString.call(objectList[j])) {
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
			uuidsToIfcGuids(account, model, sharedIds).then(ifcGuids => {
				if (ifcGuids && ifcGuids.length > 0) {
					for (let j = 0; j < ifcGuids.length; j++) {
						ifcGuidsSet.add(ifcGuids[j].metadata["IFC GUID"]);

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
};

groupSchema.statics.findIfcGroupByUID = function (dbCol, uid) {

	// Extract a unique list of IDs only
	return this.findOne(dbCol, { _id: uid })
		.then(group => {

			if (!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

			return group.getObjectsArrayAsIfcGuids(null, false).then(ifcObjects => {
				group.objects = ifcObjects;
				return group;
			});
		});
};

/**
 * Converts all IFC Guids to shared IDs if applicable and return the objects array.
 */
groupSchema.methods.getObjectsArray = function (model, branch, revId, convertSharedIDsToString, showIfcGuids = false) {
	const objectIdPromises = [];

	for (let i = 0; i < this.objects.length; i++) {

		const objectIdsSet = new Set();

		const objectId = {};
		objectId.account = this.objects[i].account;
		objectId.model = this.objects[i].model;

		const _branch = (model === objectId.model) ? branch : "master";
		const _revId = (model === objectId.model) ? revId : null;

		const ifcGuids = this.objects[i].ifc_guids ? this.objects[i].ifc_guids : [];

		for (let j = 0; this.objects[i].shared_ids && j < this.objects[i].shared_ids.length; j++) {
			let sharedId = this.objects[i].shared_ids[j];
			if ("[object String]" !== Object.prototype.toString.call(sharedId)) {
				sharedId = utils.uuidToString(sharedId);
			}
			objectIdsSet.add(sharedId);
		}

		if (showIfcGuids) {
			objectId.ifc_guids = ifcGuids;
			objectIdPromises.push(objectId);
		} else {
			objectIdPromises.push(Group.ifcGuidsToUUIDs(
				objectId.account,
				objectId.model,
				ifcGuids,
				_branch,
				_revId
			).then(sharedIdResults => {
				for (let j = 0; j < sharedIdResults.length; j++) {
					if ("[object String]" !== Object.prototype.toString.call(sharedIdResults[j].shared_id)) {
						sharedIdResults[j].shared_id = utils.uuidToString(sharedIdResults[j].shared_id);
					}
					objectIdsSet.add(sharedIdResults[j].shared_id);
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

	return Promise.all(objectIdPromises).then(objectIds => {
		return objectIds;
	});
};

// FIXME: Why do we have findByUID and findByUIDSerialised? - charence
groupSchema.statics.findByUID = function (dbCol, uid, branch, revId, convertObjects = true) {

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {

			if (!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

			if (convertObjects) {
				return getObjectIds(dbCol, group, branch, revId, false).then((sharedIdObjects) => {
					group.objects = sharedIdObjects;
					return group;
				});
			}

			return group;
		});

};

// FIXME: Why do we have findByUID and findByUIDSerialised? - charence
groupSchema.statics.findByUIDSerialised = function (dbCol, uid, branch, revId, showIfcGuids = false) {

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {

			if (!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

			return getObjectIds(dbCol, group, branch, revId, true, showIfcGuids).then((sharedIdObjects) => {

				group.objects = sharedIdObjects;
				return clean(group);
			});
		});
};

groupSchema.statics.listGroups = function (dbCol, queryParams, branch, revId, ids, showIfcGuids) {

	const query = {};

	// If we want groups that aren't from issues
	if (queryParams.noIssues) {
		query.issue_id = { $exists: false };
	}

	// If we want groups that aren't from risks
	if (queryParams.noRisks) {
		query.risk_id = { $exists: false };
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

	return this.find(dbCol, query).then(results => {
		const sharedIdConversionPromises = [];

		results.forEach(result => {
			sharedIdConversionPromises.push(
				getObjectIds(dbCol, result, branch, revId, true, showIfcGuids).then((sharedIdObjects) => {
					result.objects = sharedIdObjects;
					return result;
				})
			);
		});

		return Promise.all(sharedIdConversionPromises).then((sharedIdGroups) => {
			sharedIdGroups.forEach((group, i) => {
				sharedIdGroups[i] = clean(group);
			});

			return sharedIdGroups;
		});
	});
};

groupSchema.statics.updateIssueId = function (dbCol, uid, issueId) {

	if ("[object String]" === Object.prototype.toString.call(uid)) {
		uid = utils.stringToUUID(uid);
	}

	return this.findOne(dbCol, { _id: uid }).then(group => {
		if (group) {
			const issueIdData = {
				issue_id: issueId
			};

			return group.updateAttrs(dbCol, issueIdData);
		} else {
			return Promise.reject(responseCodes.GROUP_NOT_FOUND);
		}
	});
};

// Group Update with Event
groupSchema.methods.updateGroup = function (dbCol, sessionId, data, user = "", branch = "master", rid = null) {
	return this.updateAttrs(dbCol, _.cloneDeep(data), user).then((savedGroup) => {
		return getObjectIds(dbCol, this, branch, rid, true, false).then((objects) => {
			savedGroup.objects = objects;
			ChatEvent.groupChanged(sessionId, dbCol.account, dbCol.model, savedGroup);
			return savedGroup;
		});
	});
};

groupSchema.methods.updateAttrs = function (dbCol, data, user) {
	return this.getObjectsArrayAsIfcGuids(data, false).then(convertedObjects => {
		const toUpdate = {};
		const toUnset = {};
		const fieldsCanBeUpdated = ["description", "name", "rules", "objects", "color", "transformation", "issue_id", "risk_id"];

		let typeCorrect = !(data.rules && data.objects);
		typeCorrect && fieldsCanBeUpdated.forEach((key) => {
			if (data[key]) {
				if (Object.prototype.toString.call(data[key]) === fieldTypes[key]) {
					if (key === "objects" && data.objects) {
						toUpdate.objects = cleanEmbeddedObject(key, convertedObjects);
						toUnset.rules = 1;
						this.rules = undefined;
					} else if (key === "color" || key === "transformation") {
						toUpdate[key] = data[key].map((c) => parseInt(c, 10));
					} else {
						if (key === "rules"
							&& data.rules
							&& !checkRulesValidity(data.rules)) {
							typeCorrect = false;
							toUnset.objects = 1;
							this.objects = undefined;
						}

						toUpdate[key] = cleanEmbeddedObject(key, data[key]);
					}
					this[key] = toUpdate[key];
				} else {
					typeCorrect = false;
				}
			}

		});

		if (typeCorrect) {
			if (Object.keys(toUpdate).length !== 0) {
				toUpdate.updatedBy = user;
				toUpdate.updatedAt = Date.now();
				return db.getCollection(dbCol.account, dbCol.model + ".groups").then(_dbCol => {
					const updateBson = {$set: toUpdate};
					if(Object.keys(toUnset).length > 0) {
						updateBson.$unset = toUnset;
					}
					return _dbCol.update({ _id: this._id }, updateBson).then(() => {
						const updatedGroup = clean(this);
						return updatedGroup;
					});
				});
			} else {
				const updatedGroup = clean(this);
				return updatedGroup;
			}
		} else {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}
	});
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

groupSchema.statics.createGroup = function (dbCol, sessionId, data, creator = "", branch = "master", rid = null) {
	const model = dbCol.model;

	const newGroup = this.model("Group").createInstance({
		account: dbCol.account,
		model: model
	});

	return newGroup.getObjectsArrayAsIfcGuids(data, false).then(convertedObjects => {

		let typeCorrect = (!data.objects !== !data.rules);

		const allowedFields = ["description", "name", "objects","rules","color","transformation","issue_id","risk_id","view_id"];

		allowedFields.forEach((key) => {
			if (fieldTypes[key] && utils.hasField(data, key)) {
				if (utils.typeMatch(data[key], fieldTypes[key])) {
					if (key === "objects" && data.objects) {
						newGroup.objects = cleanEmbeddedObject(key, convertedObjects);
					} else if (key === "color") {
						newGroup[key] = data[key].map((c) => parseInt(c, 10));
					} else if (key === "transformation") {
						newGroup[key] = data[key];
					} else {
						if (key === "rules"
							&& data.rules
							&& !checkRulesValidity(data.rules)) {
							typeCorrect = false;
						}
						newGroup[key] = cleanEmbeddedObject(key, data[key]);
					}
				} else {
					systemLogger.logError(`Type mismatch ${key} ${data[key]}`);
					typeCorrect = false;
				}
			}

		});

		newGroup._id = utils.stringToUUID(nodeuuid());
		newGroup.author = creator;
		newGroup.createdAt = Date.now();

		if (typeCorrect) {
			return newGroup.save().then((savedGroup) => {
				savedGroup._id = utils.uuidToString(savedGroup._id);
				return getObjectIds(dbCol, savedGroup, branch, rid, true, false).then((objects) => {
					savedGroup.objects = objects;
					if (!data.isIssueGroup && !data.isRiskGroup && sessionId) {
						ChatEvent.newGroups(sessionId, dbCol.account, model, savedGroup);
					}
					return savedGroup;
				});
			});
		} else {
			return Promise.reject(responseCodes.INVALID_ARGUMENTS);
		}
	});
};

function cleanArray(obj, prop) {
	if (obj[prop] && 0 === obj[prop].length) {
		delete obj[prop];
	}

	return obj;
}

function clean(groupData) {
	const cleaned = groupData.toObject();
	cleaned._id = utils.uuidToString(cleaned._id);
	cleaned.issue_id = cleaned.issue_id && utils.uuidToString(cleaned.issue_id);
	cleaned.risk_id = cleaned.risk_id && utils.uuidToString(cleaned.risk_id);
	cleaned.view_id = cleaned.view_id && utils.uuidToString(cleaned.view_id);

	if (utils.isDate(cleaned.createdAt)) {
		cleaned.createdAt = cleaned.createdAt.getTime();
	}

	if (utils.isDate(cleaned.updatedAt)) {
		cleaned.updatedAt = cleaned.updatedAt.getTime();
	}

	cleanArray(cleaned, "rules");
	cleanArray(cleaned, "transformation");

	for (let i = 0; cleaned.objects && i < cleaned.objects.length; i++) {
		cleanArray(cleaned.objects[i], "ifc_guids");
		cleanArray(cleaned.objects[i], "shared_ids");
	}

	cleaned.objects = cleaned.objects.filter(obj => obj.ifc_guids || obj.shared_ids);

	delete cleaned.__v;

	return cleaned;
}

function getObjectIds(dbCol, groupData, branch, revId, convertSharedIDsToString, showIfcGuids = false) {
	if (groupData.rules && groupData.rules.length > 0) {
		return Meta.findObjectIdsByRules(dbCol.account, dbCol.model, groupData.rules, branch, revId, convertSharedIDsToString, showIfcGuids);
	} else {
		return groupData.getObjectsArray(dbCol.model, branch, revId, convertSharedIDsToString, showIfcGuids);
	}
}

const Group = ModelFactory.createClass(
	"Group",
	groupSchema,
	arg => {
		return `${arg.model}.groups`;
	}
);

Group.deleteGroups = function (dbCol, sessionId, ids) {
	const groupsIds = [].concat(ids);

	for (let i = 0; i < ids.length; i++) {
		if ("[object String]" === Object.prototype.toString.call(ids[i])) {
			ids[i] = utils.stringToUUID(ids[i]);
		}
	}

	return db.getCollection(dbCol.account, dbCol.model + ".groups").then((_dbCol) => {
		return _dbCol.remove({ _id: { $in: ids } }).then((deleteResponse) => {
			if (!deleteResponse.result.ok) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

			// Success!
			ChatEvent.groupsDeleted(sessionId, dbCol.account, dbCol.model, groupsIds);
		});
	});
};

Group.deleteGroupsByViewId = async function (account, model, view_id) {
	const _dbCol = await db.getCollection(account, model + ".groups");
	return await _dbCol.remove({ view_id });
};

module.exports = Group;
