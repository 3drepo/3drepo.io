/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.ap
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const utils = require("../utils");

const History = require("./history");
const FileRef = require("./fileRef");
const { getRefNodes } = require("./ref");
const { getDefaultLegendId } = require("./modelSetting");

const sequenceCol = (modelId) => `${modelId}.sequences`;
const legendCol = (modelId) => `${modelId}.sequences.legends`;

const clean = (toClean, keys) => {
	keys.forEach((key) => {
		if (toClean[key]) {
			if (utils.isObject(toClean[key])) {
				toClean[key] = utils.uuidToString(toClean[key]);
			} else if (Array.isArray(toClean[key])) {
				toClean[key] = toClean[key].map((elem) => utils.uuidToString(elem));
			}
		}
	});

	return toClean;
};

const cleanSequenceList = (toClean) => {
	const keys = ["_id", "rev_id", "model"];

	for (let i = 0; toClean["frames"] && i < toClean["frames"].length; i++) {
		toClean["frames"][i] = cleanSequenceFrame(toClean["frames"][i]);
	}

	return clean(toClean, keys);
};

const cleanSequenceFrame = (toClean) => {
	const key = "dateTime";

	if (toClean[key] && utils.isDate(toClean[key])) {
		toClean[key] = new Date(toClean[key]).getTime();
	}

	return toClean;
};

const getSequenceById = async (account, model, sequenceId, projection) => {
	return db.findOne(account, sequenceCol(model), { _id: sequenceId}, projection);
};

const sequenceExists = async (account, model, sequenceId) => {
	if(!(await getSequenceById(account, model, utils.stringToUUID(sequenceId), {_id: 1}))) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}
};

const getLegendById = (account, model, sequenceId) => {
	return db.findOne(account, legendCol(model), { _id: utils.stringToUUID(sequenceId) });
};

const getDefaultLegend = async (account, model) => {
	const defaultLegendId = await getDefaultLegendId(account, model);
	if(defaultLegendId) {
		const defaultLegend = await getLegendById(account, model, defaultLegendId);
		if (defaultLegend) {
			return defaultLegend;
		}
	}

	return {legend: {}};
};

const Sequence = {};

Sequence.getSequenceState = async (account, model, stateId) => {
	return FileRef.getSequenceStateFile(account, model, stateId);
};

Sequence.getList = async (account, model, branch, revision, cleanResponse = false) => {
	const history = await History.getHistory(account, model, branch, revision);

	if(!history) {
		throw responseCodes.INVALID_TAG_NAME;
	}

	const refNodes = await getRefNodes(account, model, branch, revision, {project:1});
	const submodels = refNodes.map(r => r.project);

	const submodelSequencesPromises = Promise.all(submodels.map((submodel) => Sequence.getList(account, submodel, "master", null, cleanResponse)));

	const sequences = await db.find(account, sequenceCol(model), {"rev_id": history._id});
	sequences.forEach((sequence) => {
		sequence.teamspace = account;
		sequence.model = model;

		if (cleanResponse) {
			cleanSequenceList(sequence);
		}
	});

	const submodelSequences = await submodelSequencesPromises;
	submodelSequences.forEach((s) => sequences.push(...s));

	return sequences;
};

Sequence.updateSequence = async (account, model, sequenceId, data) => {
	if (!data || !data.name || !utils.isString(data.name) || data.name === ""  || data.name.length >= 30) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const { result } = await db.update(account, sequenceCol(model),
		{_id: utils.stringToUUID(sequenceId)}, {$set: {name: data.name}});
	if (result.nModified === 0) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}

};

Sequence.deleteLegend = async (account, model, sequenceId) => {
	await sequenceExists(account, model, sequenceId);
	await db.remove(account, legendCol(model), { _id: utils.stringToUUID(sequenceId) });
};

Sequence.getLegend = async (account, model, sequenceId) => {
	await sequenceExists(account, model, sequenceId);

	const legend = await getLegendById(account, model, sequenceId);

	return legend ? legend : getDefaultLegend(account, model);
};

Sequence.updateLegend = async (account, model, sequenceId, data) => {
	const id = utils.stringToUUID(sequenceId);
	await sequenceExists(account, model, id);
	const prunedData = {};
	for(const entry in data) {
		if(utils.hasField(data, entry)) {
			const value = data[entry];
			if(utils.isHexColor(value)) {
				prunedData[entry] = value;
			} else {
				throw responseCodes.INVALID_ARGUMENTS;
			}

		}
	}

	await db.updateOne(account,legendCol(model), { _id: id }, { $set: {legend: prunedData}}, true);

};

module.exports = Sequence;
