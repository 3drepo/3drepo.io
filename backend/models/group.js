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
const Ref = require("./ref");
const db = require("../handler/db");
const ChatEvent = require("./chatEvent");
const FileRef = require("./fileRef");
const {union, intersection, difference} = require("./helper/set");
const { batchPromises } = require("./helper/promises");

const ruleOperators = {
	"IS_EMPTY":	0,
	"IS_NOT_EMPTY":	0,
	"IS":		1,
	"IS_NOT":	1,
	"CONTAINS":	1,
	"NOT_CONTAINS":	1,
	"REGEX":	1,
	"EQUALS":	1,
	"NOT_EQUALS":	1,
	"GT":		1,
	"GTE":		1,
	"LT":		1,
	"LTE":		1,
	"IN_RANGE":	2,
	"NOT_IN_RANGE":	2
};

const notOperators = {
	"IS_NOT": "IS",
	"NOT_CONTAINS": "CONTAINS",
	"NOT_EQUALS": "EQUALS",
	"NOT_IN_RANGE": "IN_RANGE",
	"IS_EMPTY": "IS_NOT_EMPTY"
};

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
	"issue_id": "[object Object]",
	"risk_id": "[object Object]"
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
	updatedAt: Date,
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
	color: [Number]
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
		const fieldsCanBeUpdated = ["description", "name", "rules", "objects", "color", "issue_id", "risk_id"];

		let typeCorrect = !(data.rules && data.objects);
		typeCorrect && fieldsCanBeUpdated.forEach((key) => {
			if (data[key]) {
				if (Object.prototype.toString.call(data[key]) === fieldTypes[key]) {
					if (key === "objects" && data.objects) {
						toUpdate.objects = cleanEmbeddedObject(key, convertedObjects);
						toUnset.rules = 1;
						this.rules = undefined;
					} else if (key === "color") {
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
				if(entry.hasOwnProperty(allowedField)) {
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

		const allowedFields = ["description", "name", "objects","rules","color","issue_id","risk_id"];

		allowedFields.forEach((key) => {
			if (fieldTypes[key] && data.hasOwnProperty(key)) {
				if (Object.prototype.toString.call(data[key]) === fieldTypes[key]) {
					if (key === "objects" && data.objects) {
						newGroup.objects = cleanEmbeddedObject(key, convertedObjects);
					} else if (key === "color") {
						newGroup[key] = data[key].map((c) => parseInt(c, 10));
					} else {
						if (key === "rules"
							&& data.rules
							&& !checkRulesValidity(data.rules)) {
							typeCorrect = false;
						}
						newGroup[key] = cleanEmbeddedObject(key, data[key]);
					}
				} else {
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

	if (Date.prototype.isPrototypeOf(cleaned.createdAt)) {
		cleaned.createdAt = cleaned.createdAt.getTime();
	}

	if (Date.prototype.isPrototypeOf(cleaned.updatedAt)) {
		cleaned.updatedAt = cleaned.updatedAt.getTime();
	}

	cleanArray(cleaned, "rules");

	for (let i = 0; cleaned.objects && i < cleaned.objects.length; i++) {
		cleanArray(cleaned.objects[i], "ifc_guids");
		cleanArray(cleaned.objects[i], "shared_ids");
	}

	cleaned.objects = cleaned.objects.filter(obj => obj.ifc_guids || obj.shared_ids);

	delete cleaned.__v;

	return cleaned;
}

function checkRulesValidity(rules) {
	const fieldsWithRules = new Set();
	let valid = rules.length > 0;
	let it = 0;
	while (valid && it < rules.length) {

		const rule = rules[it];
		valid = rule &&
			isValidRule(rule) &&
			!fieldsWithRules.has(rule.field) ;

		if (valid) {
			fieldsWithRules.add(rule.field);
		}
		it++;
	}
	return valid;
}

/**
 * Returns true if given rule has:
 * - A field,
 * - A supported operator,
 * - The correct minimum/multiples of values if a value is required
 */
function isValidRule(rule) {
	return rule.field && rule.field.length > 0 &&
		Object.keys(ruleOperators).includes(rule.operator) &&
		(ruleOperators[rule.operator] === 0 ||
		(rule.values.length && ruleOperators[rule.operator] <= rule.values.length && !rule.values.some((x) => x === "")) &&
		rule.values.length % ruleOperators[rule.operator] === 0);
}

function buildQueryFromRule(rule) {
	const clauses = [];
	let expression = {};

	if (isValidRule(rule)) {
		const fieldName = "metadata." + rule.field;
		const operatorPerClause =  ruleOperators[rule.operator];
		const clausesCount = rule.values && rule.values.length > 0 && operatorPerClause > 0 ?
			rule.values.length / operatorPerClause :
			1;

		for (let i = 0; i < clausesCount; i++) {
			let operation;

			switch (rule.operator) {
				case "IS_NOT_EMPTY":
					operation = { $exists: true };
					break;
				case "IS":
					operation = rule.values[i];
					break;
				case "CONTAINS":
					operation = { $regex: new RegExp(utils.sanitizeString(rule.values[i])), $options: "i" };
					break;
				case "REGEX":
					operation = { $regex: new RegExp(rule.values[i]) };
					break;
				case "EQUALS":
					operation = { $eq: Number(rule.values[i]) };
					break;
				case "GT":
					operation = { $gt: Number(rule.values[i]) };
					break;
				case "GTE":
					operation = { $gte: Number(rule.values[i]) };
					break;
				case "LT":
					operation = { $lt: Number(rule.values[i]) };
					break;
				case "LTE":
					operation = { $lte: Number(rule.values[i]) };
					break;
				case "IN_RANGE":
					{
						const rangeVal1 = Number(rule.values[i * operatorPerClause]);
						const rangeVal2 = Number(rule.values[i * operatorPerClause + 1]);
						const rangeLowerOp = {};
						rangeLowerOp[fieldName] = { $gte: Math.min(rangeVal1, rangeVal2) };
						const rangeUpperOp = {};
						rangeUpperOp[fieldName] = { $lte: Math.max(rangeVal1, rangeVal2) };

						operation = undefined;
						clauses.push({ $and: [rangeLowerOp, rangeUpperOp]});
					}
					break;
			}

			if (operation) {
				const clause = {};
				clause[fieldName] = operation;
				clauses.push(clause);
			}
		}
	} else {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	if (clauses.length > 1) {
		expression = { $or: clauses };
	} else if (clauses.length === 1) {
		expression = clauses[0];
	}

	return expression;
}

function positiveRulesToQueries(rules) {
	const posRules = rules.filter(r=> !notOperators[r.operator]).map(buildQueryFromRule);

	// Except IS_EMPTY every neg rule needs that the field exists
	//
	rules.forEach(({field, operator})=> {
		if (notOperators[operator] && operator !== "IS_EMPTY") {
			const rule = { field, operator: "IS_NOT_EMPTY" };
			posRules.push(buildQueryFromRule(rule));
		}
	});

	return posRules;
}

function negativeRulesToQueries(rules) {
	return rules.filter(r=> notOperators[r.operator]).map(({field, values, operator}) => {
		const negRule = {
			field,
			values,
			operator: notOperators[operator]
		};

		return buildQueryFromRule(negRule);
	});
}

function findObjectsByQuery(account, model, query) {
	const project = { "metadata.IFC GUID": 1, parents: 1 };
	return db.getCollection(account, model + ".scene").then((dbCol) => {
		return dbCol.find(query, project).toArray();
	});
}

/**
 *
 * @param {string} account
 * @param {string} model
 * @param {string} revId
 */
async function getIdToMeshesDict(account, model, revId) {
	const treeFileName = `${revId}/idToMeshes.json`;
	return JSON.parse(await FileRef.getJSONFile(account, model, treeFileName));
}

/**
 *
 * @param {string} account
 * @param {string} model
 * @param {Array<object>} ids
 * @param {boolean} convertSharedIDsToString
 *
 * @returns {Promise<Array<string | object>>}
 */
async function idsToSharedIds(account, model, ids, convertSharedIDsToString) {
	const sceneCol = await db.getCollection(account, model + ".scene");

	const treeItems = await batchPromises((_idsForquery) => {
		return sceneCol.find({_id: {$in : _idsForquery}}, {shared_id:1 , _id:0}).toArray();
	}, ids , 7000);

	const shared_ids = [];

	for (let i = 0; i < treeItems.length ; i++) {
		const treeItemsBatch = treeItems[i];
		for (let j = 0; j < treeItemsBatch.length ; j++) {
			const { shared_id } = treeItemsBatch[j];
			if (convertSharedIDsToString) {
				shared_ids.push(utils.uuidToString(shared_id));
			} else {
				shared_ids.push(shared_id);
			}
		}
	}

	return shared_ids;
}

/**
 * Return shared ids resulted of applying all the queries at once
 * @param {string} account
 * @param {string} model
 * @param {Array<object>} posRuleQueries
 * @param {string} branch
 * @param {string} revId
 * @param {Boolean} revId
 *
 * @returns {Promise<Array<string | object>>}
 */
async function findModelSharedIDsByRulesQueries(account, model, posRuleQueries, negRuleQueries, branch, revId, convertSharedIDsToString) {
	const history = await History.getHistory({ account, model }, branch, revId);

	if (!history) {
		return Promise.reject(responseCodes.INVALID_TAG_NAME);
	}

	const idToMeshesDict = await getIdToMeshesDict(account, model, utils.uuidToString(history._id));
	let allRulesResults = null;

	if (posRuleQueries.length !== 0) {
		const eachPosRuleResults = await Promise.all(posRuleQueries.map(ruleQuery => getRuleQueryResults(account, model, idToMeshesDict, history.current, ruleQuery)));
		allRulesResults = intersection(eachPosRuleResults);
	} else {
		const rootQuery =  { _id: { $in: history.current }, "parents": {$exists: false} };
		const rootId = (await findObjectsByQuery(account, model, rootQuery))[0]._id;
		allRulesResults = idToMeshesDict[utils.uuidToString(rootId)];
	}

	const eachNegRuleResults = await Promise.all(negRuleQueries.map(ruleQuery => getRuleQueryResults(account, model, idToMeshesDict, history.current, ruleQuery)));
	allRulesResults = difference(allRulesResults, eachNegRuleResults);

	const ids = [];
	for (const id of allRulesResults) {
		ids.push(utils.stringToUUID(id));
	}

	return await idsToSharedIds(account, model, ids, convertSharedIDsToString) ;
}

/**
 *
 * @param {string} account
 * @param {string} model
 * @param {object} idToMeshesDict
 * @param {Array<object>} revisionElementsIds
 * @param {object} query
 *
 * @returns {Promise<Set<string>>} Is a set of the ids that that matches the particular query rule
 */
async function getRuleQueryResults(account, model, idToMeshesDict, revisionElementsIds, query) {
	const metaResults = await findObjectsByQuery(account, model, {type:"meta", ...query});
	if (metaResults.length === 0) {
		return new Set();
	}

	const sceneCol = await db.getCollection(account, model + ".scene");
	const parents = metaResults.reduce((acc, val) => {
		Array.prototype.push.apply(acc, val.parents);
		return acc;
	} ,[]);

	const res = await batchPromises((parentsForQuery) => {
		const meshQuery = { _id: { $in: revisionElementsIds }, shared_id: { $in: parentsForQuery }, type: { $in: ["transformation", "mesh"]}};
		const meshProject = { _id: 1, type: 1 };
		return sceneCol.find(meshQuery, meshProject).toArray();
	}, parents, 7000);

	let ids = new Set();

	for (let i = 0; i < res.length ; i++) {
		const resBatch = res[i];
		for (let j = 0; j < resBatch.length ; j++) {
			const element = resBatch[j];
			if (element.type === "transformation") {
				ids = union(ids, new Set(idToMeshesDict[utils.uuidToString(element._id)]));
			} else {
				ids.add(utils.uuidToString(element._id));
			}
		}
	}

	return ids;
}

async function getIFCGuids(account, model, shared_ids) {
	const sceneCol =  await db.getCollection(account, model + ".scene");
	const results = await sceneCol.find({ "parents":{ $in: shared_ids } , "type":"meta"}, {"metadata.IFC GUID":1, "_id":0}).toArray();
	return results.map(r => r.metadata["IFC GUID"]);
}

async function findObjectIDsByRules(account, model, rules, branch, revId, convertSharedIDsToString, showIfcGuids = false) {
	const objectIdPromises = [];

	const positiveQueries = positiveRulesToQueries(rules);
	const negativeQueries = negativeRulesToQueries(rules);

	const models = new Set();
	models.add(model);

	// Check submodels
	return Ref.find({account, model}, {type: "ref"}).then((refs) => {
		refs.forEach((ref) => {
			models.add(ref.project);
		});

		const modelsIter = models.values();

		for (const modelID of modelsIter) {
			const _branch = (model === modelID) ? branch : "master";
			const _revId = (model === modelID) ? revId : null;

			objectIdPromises.push(findModelSharedIDsByRulesQueries(
				account,
				modelID,
				positiveQueries,
				negativeQueries,
				_branch,
				_revId,
				convertSharedIDsToString && !showIfcGuids // in the case of ifcguids I need the uuid for querying and geting the ifcguids
			).then(shared_ids => {
				if(!shared_ids.length) {
					return undefined;
				}

				if (showIfcGuids) {
					return getIFCGuids(account, model, shared_ids).then(ifc_guids => {
						if(convertSharedIDsToString) {
							shared_ids = shared_ids.map(utils.uuidToString);
						}

						return {account, model, shared_ids, ifc_guids};
					});
				}

				return {account, model, shared_ids};
			}));
		}

		return Promise.all(objectIdPromises).then(objectIds => {
			return objectIds.filter((entry) => !!entry);
		});
	});
}

function getObjectIds(dbCol, groupData, branch, revId, convertSharedIDsToString, showIfcGuids = false) {
	if (groupData.rules && groupData.rules.length > 0) {
		return findObjectIDsByRules(dbCol.account, dbCol.model, groupData.rules, branch, revId, convertSharedIDsToString, showIfcGuids);
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

module.exports = Group;
