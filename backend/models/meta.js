/**
 *  Copyright (C) 2016 3D Repo Ltd
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
const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const FileRef = require("./fileRef");
const History = require("./history");
const Ref = require("./ref");
const Schema = mongoose.Schema;
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const { batchPromises } = require("./helper/promises");
const {union, intersection, difference} = require("./helper/set");
const utils = require("../utils");
const systemLogger = require("../logger").systemLogger;

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

const schema = Schema({
	_id: Object,
	parents: [],
	metadata: Object
});

if (!schema.options.toJSON) {
	schema.options.toJSON = {};
}

schema.options.toJSON.transform = function (doc, ret) {
	ret._id = utils.uuidToString(doc._id);
	if(doc.parents) {
		const newParents = [];
		doc.parents.forEach(function(parentId) {
			newParents.push(utils.uuidToString(parentId));
		});
		ret.parents = newParents;
	}
	return ret;
};

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
async function findModelSharedIdsByRulesQueries(account, model, posRuleQueries, negRuleQueries, branch, revId, convertSharedIDsToString) {
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

async function getIFCGuids(account, model, shared_ids) {
	const sceneCol =  await db.getCollection(account, model + ".scene");
	const results = await sceneCol.find({ "parents":{ $in: shared_ids } , "type":"meta"}, {"metadata.IFC GUID":1, "_id":0}).toArray();
	return results.map(r => r.metadata["IFC GUID"]);
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

const Meta = ModelFactory.createClass(
	"Meta",
	schema,
	arg => {
		return `${arg.model}.scene`;
	}
);

Meta.getMetadataFields = function(account, model) {

	return Ref.getRefNodes(account, model).then((subModelRefs) => {
		const subModelMetadataFieldsPromises = [];

		subModelRefs.forEach((ref) => {
			subModelMetadataFieldsPromises.push(
				this.getMetadataFields(ref.owner, ref.project).catch(() => {
					// Suppress submodel metadata failure
				})
			);
		});

		return Promise.all(subModelMetadataFieldsPromises).then((subModels) => {
			const metaKeys = new Set();

			if (subModels) {
				subModels.forEach((subModelMetadataFields) => {
					if (subModelMetadataFields) {
						subModelMetadataFields.forEach((field) => {
							metaKeys.add(field);
						});
					}
				});
			}

			return db.getCollection(account, model + ".scene").then((sceneCollection) => {
				return sceneCollection.mapReduce(
					/* eslint-disable */
					function() {
						for (var key in this.metadata) {
							emit(key, null);
						}
					},
					function(key, value) {
						return null;
					},
					{
						"out": {inline:1},
						"query" : {type: "meta"},
						"limit": 10000
					}
					/* eslint-enable */
				).then((uniqueKeys) => {
					uniqueKeys.forEach((key) => {
						metaKeys.add(key._id);
					});

					return Array.from(metaKeys);
				});
			}).catch((err) => {
				// We may fail to get the scene collection if the collection doesn't exist yet.
				systemLogger.logError("Failed to fetch metaKeys: ", err);
				return Array.from(metaKeys);
			});
		});
	});
};

Meta.getIfcGuids = function(account, model) {
	return this.find({ account, model }, { type: "meta" }, { "metadata.IFC GUID": 1 });
};

Meta.findObjectIdsByRules = async function(account, model, rules, branch, revId, convertSharedIDsToString, showIfcGuids = false) {
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

		for (const submodel of modelsIter) {
			const _branch = (model === submodel) ? branch : "master";
			const _revId = (model === submodel) ? revId : null;

			objectIdPromises.push(findModelSharedIdsByRulesQueries(
				account,
				submodel,
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
					return getIFCGuids(account, submodel, shared_ids).then(ifc_guids => {
						return {
							account,
							model: submodel,
							ifc_guids
						};
					});
				}

				return {
					account,
					model: submodel,
					shared_ids
				};
			}).catch(() => {
				// If search on a submodel failed (usually due to no revision in the submodel), it should not
				// fail the whole API request.
				return undefined;
			}));
		}

		return Promise.all(objectIdPromises).then(objectIds => {
			return objectIds.filter((entry) => !!entry);
		});
	});
};

Meta.checkRulesValidity = function(rules) {
	const fieldsWithRules = new Set();
	let valid = rules.length > 0;
	let it = 0;
	while (valid && it < rules.length) {

		const rule = rules[it];
		const hasDuplicate = fieldsWithRules.has(rule.field);
		valid = rule &&
			isValidRule(rule) &&
			!hasDuplicate;

		if (valid) {
			fieldsWithRules.add(rule.field);
		} else if (hasDuplicate) {
			throw responseCodes.MULTIPLE_RULES_PER_FIELD_NOT_ALLOWED;
		}
		it++;
	}
	return valid;
};

module.exports = Meta;
