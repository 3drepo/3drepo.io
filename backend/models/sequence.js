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
const View = new (require("./view"))();
const { cleanViewpoint, createViewpoint } = require("./viewpoint");

const activityCol = (modelId) => `${modelId}.activities`;
const sequenceCol = (modelId) => `${modelId}.sequences`;
const legendCol = (modelId) => `${modelId}.sequences.legends`;

const fieldTypes = {
	"name": "[object String]",
	"rev_id": "[object Object]",
	"frames": "[object Array]"
};

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

const cleanActivityDetail = (toClean) => {
	const keys = ["_id", "parents"];

	return clean(toClean, keys);
};

const cleanSequence = (account, model, toClean) => {
	const keys = ["_id", "rev_id", "model"];

	toClean.teamspace = account;
	toClean.model = model;

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
		let viewpoint;

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
			dateTime: new Date(frame.dateTime),
			viewpoint
		});
	}

	return processedFrames;
};

const sequenceExists = async (account, model, sequenceId) => {
	if(!(await Sequence.getSequenceById(account, model, sequenceId, {_id: 1}))) {
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

Sequence.createSequence = async (account, model, data) => {
	const newSequence = {
		"_id": utils.generateUUID(),
		"customSequence": true,
		"frames": []
	};

	if (!data ||
		!data.name || !utils.typeMatch(data.name, fieldTypes["name"]) ||
		!data.frames || !utils.typeMatch(data.frames, fieldTypes["frames"])) {
		throw responseCodes.INVALID_ARGUMENTS;
	} else {
		newSequence.name = data.name;
	}

	if (data.revId) {
		const history = await History.getHistory(account, model, undefined, data.revId);

		if (!history) {
			throw responseCodes.INVALID_TAG_NAME;
		}

		newSequence.rev_id = history._id;
	}

	newSequence.frames = await handleFrames(account, model, newSequence._id, data.frames);

	await db.insert(account, sequenceCol(model), newSequence);

	return clean(newSequence, ["_id", "rev_id"]);
};

Sequence.deleteSequence = async (account, model, sequenceId) => {
	await sequenceExists(account, model, sequenceId);
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

Sequence.getSequenceActivityDetail = async (account, model, activityId) => {
	const activity = await db.findOne(account, activityCol(model), {"_id": utils.stringToUUID(activityId)});

	if (!activity) {
		throw responseCodes.ACTIVITY_NOT_FOUND;
	}

	return cleanActivityDetail(activity);
};

Sequence.getSequenceActivities = async (account, model, sequenceId) => {
	return FileRef.getSequenceActivitiesFile(account, model, utils.uuidToString(sequenceId));
};

Sequence.getSequenceState = async (account, model, stateId) => {
	return FileRef.getSequenceStateFile(account, model, stateId);
};

Sequence.getList = async (account, model, branch, revision, cleanResponse = false) => {
	let submodelBranch;
	let sequencesQuery = {};

	if (branch || revision) {
		const history = await History.getHistory(account, model, branch, revision);

		if (!history) {
			throw responseCodes.INVALID_TAG_NAME;
		}

		submodelBranch = "master";
		sequencesQuery = {"$or":[{"rev_id": history._id}, {"rev_id": {"$exists": false}}]};
	}

	const refNodesBranch = revision ? undefined : "master";
	const refNodes = await getRefNodes(account, model, refNodesBranch, revision, {project:1});
	const submodels = refNodes.map(r => r.project);

	const submodelSequencesPromises = Promise.all(submodels.map((submodel) => Sequence.getList(account, submodel, submodelBranch, undefined, cleanResponse)));

	const sequences = await db.find(account, sequenceCol(model), sequencesQuery);

	sequences.forEach((sequence) => {
		sequence.startDate = new Date((sequence.frames[0] || {}).dateTime).getTime();
		sequence.endDate = new Date((sequence.frames[sequence.frames.length - 1] || {}).dateTime).getTime();

		delete sequence.frames;

		if (cleanResponse) {
			cleanSequence(account, model, sequence);
		}
	});

	const submodelSequences = await submodelSequencesPromises;
	submodelSequences.forEach((s) => sequences.push(...s));

	return sequences;
};

Sequence.updateSequence = async (account, model, sequenceId, data) => {
	const toSet = {};

	if (!data) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	if (data.name) {
		if (!utils.isString(data.name) || data.name === "" || data.name.length >= 30) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		toSet.name = data.name;
	}

	if (data.revId) {
		const history = await History.getHistory(account, model, undefined, data.revId);

		if (!history) {
			throw responseCodes.INVALID_TAG_NAME;
		}

		toSet.rev_id = history._id;
	}

	if (data.frames) {
		const customSequence = await db.findOne(account, sequenceCol(model),
			{_id: utils.stringToUUID(sequenceId), customSequence: true});

		if (!customSequence) {
			throw responseCodes.SEQUENCE_READ_ONLY;
		}

		toSet.frames = await handleFrames(account, model, sequenceId, data.frames);
	}

	const { result } = await db.update(account, sequenceCol(model),
		{_id: utils.stringToUUID(sequenceId)}, {$set: toSet});
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
