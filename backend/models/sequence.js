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
const yup = require("yup");

const { update: updateGroup } = require("./group");
const History = require("./history");
const FileRef = require("./fileRef");
const { getRefNodes } = require("./ref");
const { getDefaultLegendId } = require("./modelSetting");
const View = new (require("./view"))();
const { cleanViewpoint, createViewpoint } = require("./viewpoint");

const sequenceCol = (modelId) => `${modelId}.sequences`;
const legendCol = (modelId) => `${modelId}.sequences.legends`;

const sequenceSchema = yup.object().shape({
	_id: yup.object().required(),
	name: yup.string().required(),
	customSequence: yup.bool(),
	startDate: yup.date().required(),
	endDate: yup.date().required(),
	rev_id: yup.object(),
	frames: yup.array().min(1).required()
}).noUnknown();

const sequenceEditSchema = yup.object().shape({
	name: yup.string(),
	rev_id: yup.string(),
	frames: yup.array().min(1)
}).noUnknown();

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

const cleanSequence = (account, model, toClean) => {
	const keys = ["_id", "rev_id", "model"];

	toClean.teamspace = account;
	toClean.model = model;

	toClean.startDate = new Date(toClean.startDate).getTime();
	toClean.endDate = new Date(toClean.endDate).getTime();

	for (let i = 0; toClean["frames"] && i < toClean["frames"].length; i++) {
		toClean["frames"][i] = cleanSequenceFrame(toClean["frames"][i]);
	}

	return clean(toClean, keys);
};

const cleanSequenceFrame = (toClean) => {
	if (toClean.dateTime && utils.isDate(toClean.dateTime)) {
		toClean.dateTime = new Date(toClean.dateTime).getTime();
	}

	if (toClean.viewpoint) {
		toClean.viewpoint = cleanViewpoint(undefined, toClean.viewpoint);
	}

	return toClean;
};

const handleFrames = async (account, model, sequenceId, sequenceFrames) => {
	const processedFrames = [];

	for (let i = 0; i < sequenceFrames.length; i++) {
		const frame = sequenceFrames[i];
		const dateTime = new Date(frame.dateTime);
		let viewpoint;

		if (!utils.isDate(dateTime)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		if (frame.viewpoint && utils.isObject(frame.viewpoint)) {
			viewpoint = await createViewpoint(
				account,
				model,
				undefined,
				undefined,
				sequenceId,
				frame.viewpoint,
				false,
				"sequence"
			);
		} else if (frame.viewId && utils.isString(frame.viewId)) {
			const view = await View.findByUID(account, model, frame.viewId, {});

			if (view) {
				viewpoint = view.viewpoint;

				["highlighted_group_id",
					"hidden_group_id",
					"shown_group_id"
				].forEach(async (groupIDName) => {
					if (viewpoint[groupIDName]) {
						await updateGroup(
							account,
							model,
							undefined,
							undefined,
							undefined,
							undefined,
							viewpoint[groupIDName],
							{ sequence_id: sequenceId }
						);
					}
				});

				if (viewpoint["override_group_ids"]) {
					viewpoint["override_group_ids"].forEach(async (overrideGroupId) => {
						await updateGroup(
							account,
							model,
							undefined,
							undefined,
							undefined,
							undefined,
							overrideGroupId,
							{ sequence_id: sequenceId }
						);
					});
				}
			}
		}

		if (!viewpoint) {
			// frame missing viewpoint
			throw responseCodes.INVALID_ARGUMENTS;
		}

		if (viewpoint.transformation_group_ids || viewpoint.transformation_groups) {
			// sequence viewpoints do not accept transformations
			throw responseCodes.INVALID_ARGUMENTS;
		}

		processedFrames.push({
			dateTime,
			viewpoint
		});
	}

	return processedFrames;
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

Sequence.createSequence = async (account, model, data) => {
	const newSequence = {
		"_id": utils.generateUUID(),
		"customSequence": true,
		"frames": []
	};

	if (!data || !data.name || !data.frames) {
		throw responseCodes.INVALID_ARGUMENTS;
	} else {
		newSequence.name = data.name;
	}

	if (data.rev_id) {
		const history = await History.getHistory(account, model, undefined, data.rev_id, {_id: 1});
		newSequence.rev_id = history._id;
	}

	newSequence.frames = await handleFrames(account, model, newSequence._id, data.frames);

	newSequence.startDate = new Date((newSequence.frames[0] || {}).dateTime);
	newSequence.endDate = new Date((newSequence.frames[newSequence.frames.length - 1] || {}).dateTime);

	if (!sequenceSchema.isValidSync(newSequence, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	await db.insert(account, sequenceCol(model), newSequence);

	return { _id: utils.uuidToString(newSequence._id) };
};

Sequence.deleteSequence = async (account, model, sequenceId) => {
	await Sequence.sequenceExists(account, model, sequenceId);
	const { result } = await db.remove(account, sequenceCol(model), {
		_id: utils.stringToUUID(sequenceId),
		customSequence: true
	});

	if (result.n === 0) {
		throw responseCodes.SEQUENCE_READ_ONLY;
	}
};

Sequence.getSequenceById = async (account, model, sequenceId, projection = {}, noClean = true) => {
	const sequence = await db.findOne(account, sequenceCol(model), { _id: utils.stringToUUID(sequenceId)}, projection);

	if (!sequence) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}

	return noClean ? sequence : cleanSequence(account, model, sequence);
};

Sequence.sequenceExists = async (account, model, sequenceId) => {
	if(!(await Sequence.getSequenceById(account, model, utils.stringToUUID(sequenceId), {_id: 1}))) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}
};

Sequence.getSequenceState = async (account, model, stateId) => {
	return FileRef.getSequenceStateFile(account, model, stateId);
};

Sequence.getList = async (account, model, branch, revision, cleanResponse = false) => {
	let submodelBranch;
	let sequencesQuery = {};

	if (branch || revision) {
		const history = await History.getHistory(account, model, branch, revision, {_id: 1});

		submodelBranch = "master";
		sequencesQuery = {"$or":[{"rev_id": history._id}, {"rev_id": {"$exists": false}}]};
	}

	const refNodesBranch = revision ? undefined : "master";
	const refNodes = await getRefNodes(account, model, refNodesBranch, revision, {project:1});
	const submodels = refNodes.map(r => r.project);

	const submodelSequencesPromises = Promise.all(submodels.map((submodel) => Sequence.getList(account, submodel, submodelBranch, undefined, cleanResponse)));

	const sequences = await db.find(account, sequenceCol(model), sequencesQuery, {frames: 0});

	if (cleanResponse) {
		sequences.forEach((sequence) => cleanSequence(account, model, sequence));
	}

	const submodelSequences = await submodelSequencesPromises;
	submodelSequences.forEach((s) => sequences.push(...s));

	return sequences;
};

Sequence.updateSequence = async (account, model, sequenceId, data) => {
	const toUpdate = {};
	const toSet = {};
	const toUnset = {};

	if (!data || !sequenceEditSchema.isValidSync(data, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	await Sequence.sequenceExists(account, model, sequenceId);

	if (data.name) {
		if (!utils.isString(data.name) || data.name === "" || data.name.length >= 30) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		toSet.name = data.name;
	}

	if (data.rev_id || data.rev_id === null || data.frames) {
		const customSequence = await db.findOne(account, sequenceCol(model),
			{_id: utils.stringToUUID(sequenceId), customSequence: true});

		if (!customSequence) {
			throw responseCodes.SEQUENCE_READ_ONLY;
		}

		if (data.rev_id) {
			const history = await History.getHistory(account, model, undefined, data.rev_id, {_id: 1});

			toSet.rev_id = history._id;
		} else if (data.rev_id === null) {
			toUnset.rev_id = 1;
		}

		if (data.frames) {
			toSet.frames = await handleFrames(account, model, sequenceId, data.frames);

			toSet.startDate = new Date((toSet.frames[0] || {}).dateTime);
			toSet.endDate = new Date((toSet.frames[toSet.frames.length - 1] || {}).dateTime);
		}
	}

	if (Object.keys(toSet).length > 0) {
		toUpdate.$set = toSet;
	}

	if (Object.keys(toUnset).length > 0) {
		toUpdate.$unset = toUnset;
	}

	if (Object.keys(toUpdate).length === 0) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	await db.update(account, sequenceCol(model), {_id: utils.stringToUUID(sequenceId)}, toUpdate);
};

Sequence.deleteLegend = async (account, model, sequenceId) => {
	await Sequence.sequenceExists(account, model, sequenceId);
	await db.remove(account, legendCol(model), { _id: utils.stringToUUID(sequenceId) });
};

Sequence.getLegend = async (account, model, sequenceId) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	const legend = await getLegendById(account, model, sequenceId);

	return legend ? legend : getDefaultLegend(account, model);
};

Sequence.updateLegend = async (account, model, sequenceId, data) => {
	const id = utils.stringToUUID(sequenceId);
	await Sequence.sequenceExists(account, model, id);
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
