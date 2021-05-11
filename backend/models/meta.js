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
const FileRef = require("./fileRef");
const History = require("./history");
const { findModelSettingById } = require("./modelSetting");
const { getRefNodes } = require("./ref");
const { findNodesByField, getNodeById, findNodesByType } = require("./scene");
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const { batchPromises } = require("./helper/promises");
const { positiveRulesToQueries, negativeRulesToQueries } = require("./helper/rule");
const {union, intersection, difference} = require("./helper/set");
const C = require("../constants");
const utils = require("../utils");
const systemLogger = require("../logger").systemLogger;
const Stream = require("stream");

function clean(metadataToClean) {
	if (metadataToClean._id) {
		metadataToClean._id = utils.uuidToString(metadataToClean._id);
	}

	if (metadataToClean.parents) {
		metadataToClean.parents = metadataToClean.parents.map(p => utils.uuidToString(p));
	}

	return metadataToClean;
}

function cleanAll(metaListToClean) {
	return metaListToClean.map(clean);
}

async function getIdToMeshesDict(account, model, revId) {
	const treeFileName = `${revId}/idToMeshes.json`;
	return JSON.parse(await FileRef.getJSONFile(account, model, treeFileName));
}

function getSceneCollectionName(model) {
	return model + ".scene";
}

class Meta {
	async getMetadataById(account, model, id) {
		const projection = {
			shared_id: 0,
			paths: 0,
			type: 0,
			api: 0,
			parents: 0
		};

		const metadata = await getNodeById(account, model, utils.stringToUUID(id), projection);

		if (!metadata) {
			throw responseCodes.METADATA_NOT_FOUND;
		}

		return metadata;
	}

	async getAllMetadataByRules(account, model, branch, rev, rules) {
		// Get the revision object to find all relevant IDs
		const history = await  History.getHistory(account, model, branch, rev);

		// Check for submodel references
		const refs = await getRefNodes(account, model, branch, rev);

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
				this.getAllMetadataByRules(ref.owner, ref.project, refBranch, refRev, rules)
					.then(obj => {
						return {
							data: obj.data,
							account: ref.owner,
							model: ref.project
						};
					})
					.catch(() => {
						// Just because a sub model fails doesn't mean everything failed - do nothing
					})
			);
		});

		const subMeta = await Promise.all(getMeta);

		const positiveQueries = positiveRulesToQueries(rules);
		const negativeQueries = negativeRulesToQueries(rules);

		let allRulesResults = null;

		if (positiveQueries.length !== 0) {
			const eachPosRuleResults = await Promise.all(positiveQueries.map(ruleQuery => getMetadataRuleQueryResults(account, model, {_id: { $in: history.current }, type:"meta", ...ruleQuery}, { "metadata": 1, "parents": 1 })));
			allRulesResults = intersection(eachPosRuleResults);
		} else {
			const rootQuery =  { _id: { $in: history.current }, "type": "meta" };
			allRulesResults = (await getMetadataRuleQueryResults(account, model, rootQuery, { "metadata": 1, "parents": 1 }));
		}

		const eachNegRuleResults = await Promise.all(negativeQueries.map(ruleQuery => getMetadataRuleQueryResults(account, model, {_id: { $in: history.current }, type:"meta", ...ruleQuery}, { "metadata": 1, "parents": 1 })));
		allRulesResults = difference(allRulesResults, eachNegRuleResults);

		if(allRulesResults) {
			allRulesResults = [...allRulesResults].map(res => JSON.parse(res));
			const parsedObj = {data: [...cleanAll(allRulesResults)]};
			if(subMeta.length > 0) {
				parsedObj.subModels = subMeta;
			}
			return parsedObj;
		} else {
			throw responseCodes.METADATA_NOT_FOUND;
		}
	}

	async getMetadataFields(account, model) {
		const subModelRefs = await getRefNodes(account, model, "master");
		const subModelMetadataFieldsPromises = [];

		subModelRefs.forEach((ref) => {
			subModelMetadataFieldsPromises.push(
				this.getMetadataFields(ref.owner, ref.project).catch(() => {
					// Suppress submodel metadata failure
				})
			);
		});

		const subModels = await Promise.all(subModelMetadataFieldsPromises);
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

		return db.getCollection(account, getSceneCollectionName(model)).then((sceneCollection) => {
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
	}

	async getIfcGuids(account, model) {
		return await db.find(account, getSceneCollectionName(model), { type: "meta" }, { "metadata.IFC GUID": 1 });
	}

	async ifcGuidsToUUIDs(account, model, branch, revId, ifcGuids) {
		if (!ifcGuids || ifcGuids.length === 0) {
			return Promise.resolve([]);
		}

		const query = {"metadata.IFC GUID": { $in: ifcGuids } };
		const project = { parents: 1, _id: 0 };

		const results = await db.find(account, getSceneCollectionName(model), query, project);

		if (results.length === 0) {
			return [];
		}

		const history = await  History.getHistory(account, model, branch, revId);
		const parents = results.map(x => x = x.parents).reduce((acc, val) => acc.concat(val), []);

		const meshQuery = { _id: { $in: history.current }, shared_id: { $in: parents }, type: "mesh" };
		const meshProject = { shared_id: 1, _id: 0 };

		return db.find(account, getSceneCollectionName(model), meshQuery, meshProject);
	}

	async uuidsToIfcGuids(account, model, ids) {
		const query = { type: "meta", parents: { $in: ids }, "metadata.IFC GUID": { $exists: true } };
		const project = { "metadata.IFC GUID": 1, parents: 1 };

		return await db.find(account, getSceneCollectionName(model), query, project);
	}

	async findObjectIdsByRules(account, model, rules, branch, revId, convertSharedIDsToString, showIfcGuids = false) {
		const objectIdPromises = [];

		const positiveQueries = positiveRulesToQueries(rules);
		const negativeQueries = negativeRulesToQueries(rules);

		const models = new Set();
		models.add(model);

		// Check submodels
		const refs = await getRefNodes(account, model, branch, revId);

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

		const objectIds = await Promise.all(objectIdPromises);

		return objectIds.filter((entry) => !!entry);
	}

	async getAllIdsWithMetadataField(account, model, branch, rev, fieldName) {
		// Get the revision object to find all relevant IDs
		let fullFieldName = "metadata";

		if (fieldName && fieldName.length > 0) {
			fullFieldName += "." + fieldName;
		}

		// Check for submodel references
		const refs = await getRefNodes(account, model, branch, rev);

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
						return {
							data: obj.data,
							account: ref.owner,
							model: ref.project
						};
					})
					.catch(() => {
						// Just because a sub model fails doesn't mean everything failed - do nothing
					})
			);
		});

		const subMeta = await Promise.all(getMeta);

		const obj = await findNodesByField(account, model, branch, rev, fullFieldName);

		if (!obj) {
			return Promise.reject(responseCodes.METADATA_NOT_FOUND);
		}

		// rename fieldName to "value"
		const parsedObj = {data: obj};
		if (obj.length > 0 && fieldName && fieldName.length > 0) {
			const objStr = JSON.stringify(obj);
			parsedObj.data = JSON.parse(objStr.replace(new RegExp(fieldName, "g"), "value"));
		}
		if (subMeta.length > 0) {
			parsedObj.subModels = subMeta;
		}

		return parsedObj;
	}

	async getAllIdsWith4DSequenceTag(account, model, branch, rev) {
		// Get sequence tag then call the generic getAllIdsWithMetadataField
		const settings = await findModelSettingById(account, model);

		if (!settings) {
			return Promise.reject(responseCodes.MODEL_NOT_FOUND);
		}

		if (!settings.fourDSequenceTag) {
			return Promise.reject(responseCodes.SEQ_TAG_NOT_FOUND);
		}

		return this.getAllIdsWithMetadataField(account, model,  branch, rev, settings.fourDSequenceTag);
	}

	async _getAllMetadata(account, model, branch, rev, stream) {
		const subModelPromise = getRefNodes(account, model, branch, rev).then((refs) => {
			const subMetaPromise = [];
			refs.forEach((ref) => {
				let refBranch, refRev;
				if (utils.uuidToString(ref._rid) === C.MASTER_BRANCH) {
					refBranch = C.MASTER_BRANCH_NAME;
				} else {
					refRev = utils.uuidToString(ref._rid);
				}

				const metaProm = findNodesByType(ref.owner, ref.project, refBranch, refRev,
					"meta", undefined, {_id: 1, parents: 1, metadata: 1}).then((data) =>
					({
						data,
						account: ref.owner,
						model: ref.project
					})
				).catch(); // doesn't matter if the sub model fails.
				subMetaPromise.push(metaProm);
			});
			return Promise.all(subMetaPromise);
		});

		const data = await findNodesByType(account, model, branch, rev, "meta", undefined, {_id: 1, parents: 1, metadata: 1});

		stream.write("{\"data\":");
		stream.write(JSON.stringify(data));

		const subModelMeta = await subModelPromise;

		if (subModelMeta && subModelMeta.length) {
			stream.write(",\"subModels\":[");

			for(let i = 0; i < subModelMeta.length; ++i) {
				if (i > 0) {
					stream.write(",");
				}
				stream.write(JSON.stringify(subModelMeta[i]));
			}

			stream.write("]");
		}
		stream.write("}");
		stream.end();

	}

	async getAllMetadata(account, model, branch, rev) {
		const stream = Stream.PassThrough();
		try {
			this._getAllMetadata(account, model, branch, rev, stream);
		} catch(err) {
			stream.emit("error", err);
			stream.end();
		}

		return stream;
	}

	async getMeshIdsByRules(account, model, branch, revId, rules) {
		const objectIdPromises = [];

		const positiveQueries = positiveRulesToQueries(rules);
		const negativeQueries = negativeRulesToQueries(rules);

		const models = new Set();
		models.add(model);

		// Check submodels
		const refs = await getRefNodes(account, model, branch, revId);

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

		const objectIds = await Promise.all(objectIdPromises);

		return objectIds
			.filter((entry) => !!entry)
			.reduce((acc, val) => acc.concat(val), []);
	}
}

function findObjectsByQuery(account, model, query, project = { "metadata.IFC GUID": 1, parents: 1 }) {
	return db.find(account, getSceneCollectionName(model), query, project);
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
	const history = await  History.getHistory(account, model, branch, revId);

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
	const metaResults = await findObjectsByQuery(account, model, {type:"meta", ...query});
	if (metaResults.length === 0) {
		return new Set();
	}

	const parents = metaResults.reduce((acc, val) => {
		Array.prototype.push.apply(acc, val.parents);
		return acc;
	} ,[]);

	const res = await batchPromises((parentsForQuery) => {
		const meshQuery = { _id: { $in: revisionElementsIds }, shared_id: { $in: parentsForQuery }, type: { $in: ["transformation", "mesh"]}};
		const meshProject = { _id: 1, type: 1 };
		return db.find(account, getSceneCollectionName(model), meshQuery, meshProject);
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

async function getMetadataRuleQueryResults(account, model, query, projection) {
	const metaResults = await findObjectsByQuery(account, model, query, projection);
	if (metaResults.length === 0) {
		return new Set();
	}

	const results = new Set();

	cleanAll(metaResults);

	for (let i = 0; i < metaResults.length; i++) {
		results.add(JSON.stringify(metaResults[i]));
	}

	return results;
}

async function getIFCGuids(account, model, shared_ids) {
	const results = await db.find(account,
		getSceneCollectionName(model),
		{ "parents":{ $in: shared_ids } , "type":"meta"},
		{"metadata.IFC GUID":1, "_id":0});
	return results.map(r => r.metadata["IFC GUID"]);
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
	const treeItems = await batchPromises((_idsForquery) => {
		return db.find(account, getSceneCollectionName(model), {_id: {$in : _idsForquery}}, {shared_id:1 , _id:0});
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

module.exports = new Meta();
