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

const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const yup = require("yup");

const { update: updateGroup } = require("./group");
const History = require("./history");
const FileRef = require("./fileRef");
const { getSubModels } = require("./ref");
const { getDefaultLegendId } = require("./modelSetting");
const View = new (require("./view"))();
const { cleanViewpoint, createViewpoint } = require("./viewpoint");

const sequenceCol = (modelId) => `${modelId}.sequences`;
const legendCol = (modelId) => `${modelId}.sequences.legends`;

// Viewpoint checks
const viewpointSchema = yup.object().test((viewpoint) => {
	if (!viewpoint) {
		return true;
	}

	const {transformation_group_ids, transformation_groups } = viewpoint;

	// The viewpoints for sequences CANT have transformations groups
	return !(transformation_group_ids || transformation_groups);
});

const frameSchema = yup.object().shape({
	dateTime: yup.number().required(),
	viewpoint: viewpointSchema,
	viewId: yup.string()
}).noUnknown().test(({viewId, viewpoint}) => {
	// The frame must have either viewpoint or viewId, not both
	return (viewId && !viewpoint) || (!viewId && viewpoint);
});

const nameSchema = yup.string().min(1).max(30);

const sequenceSchema = yup.object().shape({
	name: nameSchema.required(),
	rev_id: yup.string(),
	frames: yup.array().of(frameSchema).min(1).required()
}).noUnknown();

const sequenceEditSchema = sequenceSchema.shape({
	name: nameSchema,
	rev_id: yup.string().nullable(),
	frames: yup.array().of(frameSchema).min(1)
}).noUnknown().test(utils.notEmpty);

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

		if (frame.viewpoint) {
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
		} else {
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
			} else {
				throw responseCodes.INVALID_ARGUMENTS;
			}
		}

		processedFrames.push({
			dateTime,
			viewpoint
		});
	}

	processedFrames.sort((frameA, frameB) => frameA.dateTime - frameB.dateTime);

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

Sequence.createSequence = async (account, model, sequenceData) => {
	if (!sequenceSchema.isValidSync(sequenceData, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	sequenceData = {...sequenceData, "_id": utils.generateUUID(), "customSequence": true};

	if (sequenceData.rev_id) {
		const history = await History.getHistory(account, model, undefined, sequenceData.rev_id, {_id: 1});

		if (!history) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		sequenceData.rev_id = history._id;
	}

	sequenceData.frames = await handleFrames(account, model, sequenceData._id, sequenceData.frames);

	sequenceData.startDate = new Date(sequenceData.frames[0].dateTime);
	sequenceData.endDate = new Date(sequenceData.frames[sequenceData.frames.length - 1].dateTime);

	await db.insertOne(account, sequenceCol(model), sequenceData);

	return { _id: utils.uuidToString(sequenceData._id) };
};

Sequence.deleteSequence = async (account, model, sequenceId) => {
	await Sequence.sequenceExists(account, model, sequenceId);
	const { result } = await db.deleteOne(account, sequenceCol(model), {
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
	await Sequence.getSequenceById(account, model, utils.stringToUUID(sequenceId), {_id: 1});
};

Sequence.getSequenceState = async (account, model, stateId) => {
	return FileRef.getSequenceStateFile(account, model, stateId);
};

Sequence.getList = async (account, model, branch, revision, cleanResponse = false) => {
	let submodelBranch;
	const sequencesQuery = {};

	const submodels = await getSubModels(account, model);

	const isFed = submodels.length > 0;
	if (!isFed && (branch || revision)) {
		const history = await History.getHistory(account, model, branch, revision, {_id: 1});

		submodelBranch = "master";
		sequencesQuery["$or"] = [{"rev_id": history._id}, {"rev_id": {"$exists": false}}];
	}

	const submodelSequencesPromises = Promise.all(submodels.map((submodel) => Sequence.getList(account, submodel.model, submodelBranch, undefined, cleanResponse).catch(() => [])));

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

	if (!sequenceEditSchema.isValidSync(data, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	if (data.name) {
		toSet.name = data.name;
	}

	// Name field can be updated for any sequence
	if (data.name && Object.keys(data).length === 1) {
		await Sequence.sequenceExists(account, model, sequenceId);
	} else {

		// Rest of properties can be updated only for custom sequences
		const customSequence = await db.findOne(account, sequenceCol(model), {_id: utils.stringToUUID(sequenceId), customSequence: true}, {_id: 1});

		if (!customSequence) {
			throw responseCodes.SEQUENCE_READ_ONLY;
		}

		if (data.rev_id) {
			const history = await History.getHistory(account, model, undefined, data.rev_id, {_id: 1});

			if (!history) {
				throw responseCodes.INVALID_ARGUMENTS;
			}

			toSet.rev_id = history._id;
		} else if (data.rev_id === null) {
			toUnset.rev_id = 1;
		}

		if (data.frames) {
			toSet.frames = await handleFrames(account, model, sequenceId, data.frames);
			const framesStartDate = new Date((toSet.frames[0] || {}).dateTime);
			const framesEndDate = new Date((toSet.frames[toSet.frames.length - 1] || {}).dateTime);

			toSet.startDate = framesStartDate;
			toSet.endDate = framesEndDate;
		}
	}

	if (utils.notEmpty(toSet)) {
		toUpdate.$set = toSet;
	}

	if (utils.notEmpty(toUnset)) {
		toUpdate.$unset = toUnset;
	}

	await db.updateOne(account, sequenceCol(model), {_id: utils.stringToUUID(sequenceId)}, toUpdate);
};

Sequence.deleteLegend = async (account, model, sequenceId) => {
	await Sequence.sequenceExists(account, model, sequenceId);
	await db.deleteOne(account, legendCol(model), { _id: utils.stringToUUID(sequenceId) });
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
