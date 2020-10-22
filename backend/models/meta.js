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
const ModelSetting = require("./modelSetting");
const Ref = require("./ref");
const Scene = require("./scene");
const Schema = mongoose.Schema;
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const { batchPromises } = require("./helper/promises");
const { positiveRulesToQueries, negativeRulesToQueries } = require("./helper/rule");
const {union, intersection, difference} = require("./helper/set");
const C = require("../constants");
const utils = require("../utils");
const systemLogger = require("../logger").systemLogger;

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
	const ids = await findModelMeshIdsByRulesQueries(account, model, posRuleQueries, negRuleQueries, branch, revId);

	return await idsToSharedIds(account, model, ids, convertSharedIDsToString) ;
}

async function findModelMeshIdsByRulesQueries(account, model, posRuleQueries, negRuleQueries, branch, revId, toString = false) {
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
		if (toString) {
			ids.push(id);
		} else {
			ids.push(utils.stringToUUID(id));
		}
	}

	return ids;
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
	// eslint-disable-next-line no-use-before-define
	console.log("getRuleQueryResults");
	const metaResults = await findObjectsByQuery(account, model, {type:"meta", ...query});
	if (metaResults.length === 0) {
		return new Set();
	}

	const sceneCol = await db.getCollection(account, model + ".scene");
	const parents = metaResults.reduce((acc, val) => {
		Array.prototype.push.apply(acc, val.parents);
		return acc;
	} ,[]);

	// eslint-disable-next-line no-use-before-define
	console.log("getRuleQueryResults: 2");
	const res = await batchPromises((parentsForQuery) => {
		const meshQuery = { _id: { $in: revisionElementsIds }, shared_id: { $in: parentsForQuery }, type: { $in: ["transformation", "mesh"]}};
		const meshProject = { _id: 1, type: 1 };
		return sceneCol.find(meshQuery, meshProject).toArray();
	}, parents, 7000);

	let ids = new Set();

	// eslint-disable-next-line no-use-before-define
	console.log("getRuleQueryResults: 3");
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

Meta.getMetadata = function(account, model, id) {
	const projection = {
		shared_id: 0,
		paths: 0,
		type: 0,
		api: 0,
		parents: 0
	};

	return Scene.findOne({account, model}, { _id: utils.stringToUUID(id) }, projection).then(obj => {
		if(obj) {
			return obj;
		} else {
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}
	});
};

Meta.getAllIdsWithMetadataField = function(account, model, branch, rev, fieldName) {
	// Get the revision object to find all relevant IDs
	let history;
	let fullFieldName = "metadata";

	if (fieldName && fieldName.length > 0) {
		fullFieldName += "." + fieldName;
	}

	return History.getHistory({ account, model }, branch, rev).then(_history => {
		history = _history;
		if(!history) {
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}
		// Check for submodel references
		const filter = {
			type: "ref",
			_id: { $in: history.current }
		};
		return Ref.find({ account, model }, filter);
	}).then(refs =>{

		// for all refs get their tree
		const getMeta = [];

		refs.forEach(ref => {

			let refBranch, refRev;

			if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH) {
				refBranch = C.MASTER_BRANCH_NAME;
			} else {
				refRev = utils.uuidToString(ref._rid);
			}

			getMeta.push(
				this.getAllIdsWithMetadataField(ref.owner, ref.project, refBranch, refRev, fieldName)
					.then(obj => {
						return Promise.resolve({
							data: obj.data,
							account: ref.owner,
							model: ref.project
						});
					})
					.catch(() => {
					// Just because a sub model fails doesn't mean everything failed. Resolve the promise.
						return Promise.resolve();
					})
			);
		});

		return Promise.all(getMeta);

	}).then(_subMeta => {

		const match = {
			_id: {"$in": history.current}
		};
		match[fullFieldName] =  {"$exists" : true};

		const projection = {
			parents: 1
		};
		projection[fullFieldName] = 1;

		return Scene.find({account, model}, match, projection).then(obj => {
			if(obj) {
				// rename fieldName to "value"
				const parsedObj = {data: obj};
				if(obj.length > 0 && fieldName && fieldName.length > 0) {
					const objStr = JSON.stringify(obj);
					parsedObj.data = JSON.parse(objStr.replace(new RegExp(fieldName, "g"), "value"));
				}
				if(_subMeta.length > 0) {
					parsedObj.subModels = _subMeta;
				}
				return parsedObj;
			} else {
				return Promise.reject(responseCodes.METADATA_NOT_FOUND);
			}
		});

	});
};

Meta.getMeshIdsByRules = async function(account, model, branch, revId, username, rules) {
	// eslint-disable-next-line no-use-before-define
	console.log("getMeshIdsByRules");
	const objectIdPromises = [];

	const positiveQueries = positiveRulesToQueries(rules);
	const negativeQueries = negativeRulesToQueries(rules);

	const models = new Set();
	models.add(model);

	// Check submodels
	// eslint-disable-next-line no-use-before-define
	console.log("getMeshIdsByRules: check submodels");
	return Ref.find({account, model}, {type: "ref"}).then((refs) => {
		refs.forEach((ref) => {
			models.add(ref.project);
		});

		const modelsIter = models.values();

		for (const submodel of modelsIter) {
			const _branch = (model === submodel) ? branch : "master";
			const _revId = (model === submodel) ? revId : null;

			objectIdPromises.push(findModelMeshIdsByRulesQueries(
				account,
				submodel,
				positiveQueries,
				negativeQueries,
				_branch,
				_revId,
				true
			).then(mesh_ids => {
				// eslint-disable-next-line no-use-before-define
				console.log("getMeshIdsByRules: mesh ID results");
				// eslint-disable-next-line no-use-before-define
				console.log(mesh_ids);
				if(!mesh_ids.length) {
					return undefined;
				}

				return {
					account,
					model: submodel,
					mesh_ids
				};
			}).catch(() => {
				// If search on a submodel failed (usually due to no revision in the submodel), it should not
				// fail the whole API request.
				return undefined;
			}));
		}

		return Promise.all(objectIdPromises).then(objectIds => {
			return objectIds
				.filter((entry) => !!entry)
				.reduce((acc, val) => acc.concat(val), []);
		});
	});
};

Meta.getAllMetadata = function(account, model, branch, rev) {
	return this.getAllIdsWithMetadataField(account, model, branch, rev, "");
};

Meta.getAllIdsWith4DSequenceTag = function(account, model, branch, rev) {
	// Get sequence tag then call the generic getAllIdsWithMetadataField
	return ModelSetting.findOne({account : account}, {_id : model}).then(settings => {
		if(!settings) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}
		if(!settings.fourDSequenceTag) {
			return Promise.reject(responseCodes.SEQ_TAG_NOT_FOUND);
		}
		return this.getAllIdsWithMetadataField(account, model,  branch, rev, settings.fourDSequenceTag);
	});
};

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

module.exports = Meta;
