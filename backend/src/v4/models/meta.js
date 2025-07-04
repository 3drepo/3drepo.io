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
const History = require("./history");
const {v5Path} = require("../../interop.js");
const { findModelSettingById } = require("./modelSetting");
const { getSubModels } = require("./ref");
const { findNodesByField, getNodeById, findMetadataNodesByFields } = require("./scene");
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const { batchPromises } = require("./helper/promises");
const { positiveRulesToQueries, negativeRulesToQueries } = require("./helper/rule");
const {intersection, difference} = require("./helper/set");
const utils = require("../utils");
const Stream = require("stream");
const { getMetadataByRules } = require(`${v5Path}/models/metadata.js`);
const { getArrayDifference } = require(`${v5Path}/utils/helper/arrays.js`);
const { getMeshesWithParentIds } = require(`${v5Path}/processors/teamspaces/projects/models/commons/scenes.js`);
const { stringToUUID } = require(`${v5Path}/utils/helper/uuids.js`);

const clean = (metadataToClean) => {
	if (metadataToClean._id) {
		metadataToClean._id = utils.uuidToString(metadataToClean._id);
	}

	if (metadataToClean.parents) {
		metadataToClean.parents = metadataToClean.parents.map(p => utils.uuidToString(p));
	}

	if(Array.isArray(metadataToClean.metadata)) {
		const legacyMeta = {};
		metadataToClean.metadata.forEach(({key, value}) => {
			legacyMeta[key] = value;
		});

		metadataToClean.metadata = legacyMeta;
	}

	return metadataToClean;
};

const cleanAll = (metaListToClean) => {
	return metaListToClean.map(clean);
};

const getSceneCollectionName = (model) => `${model}.scene`;

const Meta = {};

Meta.getMetadataById = async (account, model, id) => {
	const projection = {
		shared_id: 0,
		paths: 0,
		type: 0,
		api: 0,
		parents: 0,
		rev_id: 0
	};

	const metadata = await getNodeById(account, model, utils.stringToUUID(id), projection);

	if (!metadata) {
		throw responseCodes.METADATA_NOT_FOUND;
	}

	return clean(metadata);
};

Meta.getAllMetadataByRules = async (account, model, branch, rev, fieldNames = [], rules) => {
	// Get the revision object to find all relevant IDs
	const history = await  History.getHistory(account, model, branch, rev);

	// for all refs get their tree
	const getMeta = [];

	// Check for submodel references
	await getSubModels(account, model, branch, rev, (subTS, subModel, subBranch, subRev) => {
		getMeta.push(
			Meta.getAllMetadataByRules(subTS, subModel, subBranch, subRev, fieldNames, rules)
				.then(({data}) => {
					return {
						data,
						account: subTS,
						model: subModel
					};
				})
				.catch(() => {
					// Just because a sub model fails doesn't mean everything failed - do nothing
				})
		);
	});

	const subMeta = await Promise.all(getMeta);

	const query = { rev_id: history._id, type: "meta" };
	const projection = { $project: { metadata: 1, parents: 1 } };

	if (fieldNames.length) {
		query["metadata.key"] = { $in: fieldNames };
		projection.$project.metadata = { $filter: { input: "$metadata", as: "metadata", cond: { $in: ["$$metadata.key", fieldNames] } } };
	}
	const positiveQueries = positiveRulesToQueries(rules);
	const negativeQueries = negativeRulesToQueries(rules);

	let allRulesResults = null;

	if (positiveQueries.length !== 0) {
		const eachPosRuleResults = await Promise.all(positiveQueries.map(ruleQuery => getMetadataRuleQueryResults(account, model,
			{ $match: { ...query, ...ruleQuery }}, projection)));
		allRulesResults = intersection(eachPosRuleResults);
	} else {
		allRulesResults = (await getMetadataRuleQueryResults(account, model, { $match: { ...query}}, projection));
	}

	const eachNegRuleResults = await Promise.all(negativeQueries.map(ruleQuery => getMetadataRuleQueryResults(account, model, { $match: { ...query, ...ruleQuery }}, projection)));
	allRulesResults = difference(allRulesResults, eachNegRuleResults);

	if (allRulesResults) {
		allRulesResults = [...allRulesResults].map(res => JSON.parse(res));
		const parsedObj = {data: [...cleanAll(allRulesResults)]};
		if(subMeta.length > 0) {
			parsedObj.subModels = subMeta;
		}
		return parsedObj;
	}

	throw responseCodes.METADATA_NOT_FOUND;

};

Meta.getMetadataFields = async (account, model) => {
	const subModelMetadataFieldsPromises = [];
	await getSubModels(account, model, "master", undefined, (subModelTS, subModel) => {
		subModelMetadataFieldsPromises.push(
			Meta.getMetadataFields(subModelTS, subModel).catch(() => {
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

	const keys = await db.getAllValues(account, getSceneCollectionName(model), "metadata.key");
	keys.forEach((item) => {
		if(item !== null) {
			metaKeys.add(item);
		}
	});

	return Array.from(metaKeys);

};

const ifcGuidQuery = (ids) => ({"metadata": {$elemMatch:{key: "IFC GUID", value:{ $in: ids }} }});
const ifcGuidProjection = { "metadata": {$elemMatch:{key: "IFC GUID"} }};
const ifcGuidProjectionFilter = {
	metadata: {
		$filter: {
			input: "$metadata",
			as: "metadata",
			cond: { $eq: ["$$metadata.key", "IFC GUID"] }
		}
	}
};

Meta.getIfcGuids = async (account, model) => {
	return db.find(account, getSceneCollectionName(model), { type: "meta", "metadata.key": "IFC GUID" }, ifcGuidProjection);
};

Meta.ifcGuidsToUUIDs = async (account, model, branch, revId, ifcGuids) => {
	if (!ifcGuids || ifcGuids.length === 0) {
		return [];
	}

	const query = ifcGuidQuery(ifcGuids);
	const project = { parents: 1, _id: 0 };

	const results = await db.find(account, getSceneCollectionName(model), query, project);

	if (results.length === 0) {
		return [];
	}

	const history = await  History.getHistory(account, model, branch, revId);
	const parents = results.map(x => x = x.parents).reduce((acc, val) => acc.concat(val), []);

	const meshQuery = { rev_id: history._id, shared_id: { $in: parents }, type: "mesh" };
	const meshProject = { shared_id: 1, _id: 0 };

	return db.find(account, getSceneCollectionName(model), meshQuery, meshProject);
};

Meta.uuidsToIfcGuids = async (account, model, ids) => {
	const query = { type: "meta", parents: { $in: ids }, "metadata.key": "IFC GUID" };
	const project = { ...ifcGuidProjection, parents: 1 };

	return db.find(account, getSceneCollectionName(model), query, project);
};

Meta.findObjectIdsByRules = async (account, model, rules, branch, revId, convertSharedIDsToString, showIfcGuids = false, {skipSubModelCheck = false, skipRevCheck = false} = {}) => {

	const objectIdPromises = [];

	const models = new Set();
	models.add(model);

	if(!skipSubModelCheck) {
		// Check submodels
		await getSubModels(account, model, branch, revId, (ts, subModel) => models.add(subModel));
	}

	const modelsIter = models.values();

	for (const submodel of modelsIter) {
		const _branch = (model === submodel) ? branch : "master";
		const _revId = (model === submodel) ? revId : null;

		objectIdPromises.push(findModelSharedIdsByRulesQueries(
			account,
			submodel,
			rules,
			_branch,
			_revId,
			convertSharedIDsToString && !showIfcGuids, // in the case of ifcguids I need the uuid for querying and geting the ifcguids
			skipRevCheck
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
		}));
	}

	const objectIds = await Promise.all(objectIdPromises);

	return objectIds.filter((entry) => !!entry);
};

Meta.getAllIdsWithMetadataField = async (account, model, branch, rev, fieldName) => {
	const getMeta = [];

	await getSubModels(account, model, branch, rev, (subModelTS, subModel, subModelBranch, subModelRev) => {
		getMeta.push(
			Meta.getAllIdsWithMetadataField(subModelTS, subModel, subModelBranch, subModelRev, fieldName)
				.then(({data}) => {
					return {
						data,
						account: subModelTS,
						model: subModel
					};
				})
				.catch(() => {
					// Just because a sub model fails doesn't mean everything failed - do nothing
				})
		);
	});

	const subMeta = await Promise.all(getMeta);

	const obj = await findNodesByField(account, model, branch, rev, fieldName);

	if (!obj) {
		throw responseCodes.METADATA_NOT_FOUND;
	}

	const data = obj.map((entry) => {
		const metadata =  { value: entry.metadata[0].value };
		return {...entry, metadata};
	});

	const parsedObj = {data};
	if (subMeta.length > 0) {
		parsedObj.subModels = subMeta;
	}

	return parsedObj;
};

Meta.getAllIdsWith4DSequenceTag = async (account, model, branch, rev) => {
	// Get sequence tag then call the generic getAllIdsWithMetadataField
	const settings = await findModelSettingById(account, model);

	if (!settings) {
		throw responseCodes.MODEL_NOT_FOUND;
	}

	if (!settings.fourDSequenceTag) {
		throw responseCodes.SEQ_TAG_NOT_FOUND;
	}

	return Meta.getAllIdsWithMetadataField(account, model,  branch, rev, settings.fourDSequenceTag);
};

const _getAllMetadata = async (account, model, branch, rev, fieldNames, stream) => {
	const subModelPromise = getSubModels(account, model, branch, rev);

	const data = await findMetadataNodesByFields(account, model, branch, rev, fieldNames);

	stream.write("{\"data\":");
	stream.write(JSON.stringify(cleanAll(data)));

	const refs = await subModelPromise;
	if(refs.length) {
		stream.write(",\"subModels\":[");
		for(let i = 0; i < refs.length; ++i) {
			try {
				const {account: subModelTS, model: subModelId, branch: subModelBranch, revision: subModelRev} = refs[i];

				const subModelData = await findMetadataNodesByFields(subModelTS, subModelId, subModelBranch, subModelRev, fieldNames);
				const result =
					{
						data: cleanAll(subModelData),
						account: subModelTS,
						model: subModelId
					};

				if (i > 0) {
					stream.write(",");
				}
				stream.write(JSON.stringify(result));
			} catch {
				// doesn't matter if the sub model fails.
			}
		}
		stream.write("]");
	}

	stream.write("}");
	stream.end();
};

Meta.getAllMetadata = async (account, model, branch, rev, fieldNames) => {
	// Check revision exists
	await History.getHistory(account, model, branch, rev);
	const stream = Stream.PassThrough();
	try {
		_getAllMetadata(account, model, branch, rev, fieldNames, stream);
	} catch(err) {
		stream.emit("error", err);
		stream.end();
	}

	return stream;
};

Meta.getMeshIdsByRules = async (account, model, branch, revId, rules) => {
	const objectIdPromises = [];

	const positiveQueries = positiveRulesToQueries(rules);
	const negativeQueries = negativeRulesToQueries(rules);

	const models = new Set();
	models.add(model);

	// Check submodels
	await getSubModels(account, model, branch, revId, (subModelTS, subModel) =>
		models.add(subModel)
	);

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
};

const findObjectsByQuery = (account, model, query, projection = { $project: {...ifcGuidProjectionFilter, parents: 1 }}) => {
	return db.aggregate(account, getSceneCollectionName(model), [query, projection]);
};

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
const findModelSharedIdsByRulesQueries = async (account, model, rules, branch, revId, convertSharedIDsToString, skipRevCheck) => {
	const ids = await findModelMeshIdsByRulesQueries(account, model, rules, branch, revId, false, skipRevCheck);
	return idsToSharedIds(account, model, ids, convertSharedIDsToString) ;
};

const findModelMeshIdsByRulesQueries = async (account, model, rules, branch, revId, toString = false, skipRevCheck = false) => {
	if (!skipRevCheck) {
		const history = await  History.getHistory(account, model, branch, revId);
		revId = history._id; // Ensure revId is set to the history ID
	}

	const {matched, unwanted} = await getMetadataByRules(account, undefined, model, revId, rules);
	const project = undefined;

	const [
		matchedMeshIds,
		unwantedMeshIds
	] = await Promise.all([
		matched.length ? getMeshesWithParentIds(account, project, model, revId,
			matched.flatMap(({ parents }) => parents), true) : Promise.resolve([]),
		unwanted.length ? getMeshesWithParentIds(account, project, model,  revId,
			unwanted.flatMap(({ parents }) => parents), true) : Promise.resolve([])
	]);

	const meshes =  getArrayDifference(unwantedMeshIds, matchedMeshIds);

	return toString ? meshes : meshes.map(stringToUUID);

};

const getMetadataRuleQueryResults = async (account, model, query, projection) => {
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
};

const getIFCGuids = async (account, model, shared_ids) => {
	const results = await db.find(account,
		getSceneCollectionName(model),
		{ "parents":{ $in: shared_ids } , "type":"meta"},
		{...ifcGuidProjection, "_id":0});
	return results.map(r => r.metadata[0].value);
};

/**
 *
 * @param {string} account
 * @param {string} model
 * @param {Array<object>} ids
 * @param {boolean} convertSharedIDsToString
 *
 * @returns {Promise<Array<string | object>>}
 */
const idsToSharedIds = async (account, model, ids, convertSharedIDsToString) => {
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
};

module.exports = Meta;
