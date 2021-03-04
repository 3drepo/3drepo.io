/**
 *  Copyright (C) 2019 3D Repo Ltd
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
const nodeuuid = require("uuid/v1");
const FileRef = require("./fileRef");
const yup = require("yup");
const {pick} = require("lodash");

const keyValueSchema = yup.object().shape({
	key: yup.string().required(),
	value: yup.mixed().required()
});

const activityEditSchema = yup.object().shape({
	name: yup.string(),
	startDate: yup.number(),
	endDate: yup.number(),
	parent: yup.array().of(yup.string()),
	resources: yup.object(),
	data: yup.array().of(keyValueSchema)
}).noUnknown();

const activitySchema = yup.object().shape({
	name: yup.string().required(),
	startDate: yup.number().required(),
	endDate: yup.number().required(),
	parent: yup.array().of(yup.string()),
	resources: yup.object(),
	data: yup.array().of(keyValueSchema).required()
}).noUnknown();

/**
 * @typedef {{_id: string, parents: Array<string>}} Activity
 * @param {string} parentId
 * @param {Array<Activity>} activities;
 * @return {Array<Activity>}
 */
const getSubtasks = (parentId, activities) => {
	return activities.filter(activity => {
		const parent = activity.parent;

		if (parentId) {
			return parent && utils.uuidToString(parent) === parentId;
		} else {
			return !parent;
		}
	}).map(activity => {
		const id = utils.uuidToString(activity._id);
		let subTasks = getSubtasks(id, activities);

		if (subTasks.length) {
			subTasks = { subTasks };
		} else {
			subTasks = {};
		}

		return  { id, ...pick(activity, "name", "startDate", "endDate"), ...subTasks };
	});
};

const createActivitiesTree = async(account, model, sequenceId) => {
	const activities = await db.find(account, model + ".activities",{sequenceId: utils.stringToUUID(sequenceId)}); // filter by sequenceId
	const tasks = getSubtasks(null, activities);

	return {tasks};
};

const SequenceActivities = {};

SequenceActivities.create = async (account, model, sequenceId, activity) => {
	const sequence = await db.findOne(account, model + ".sequences", { _id: utils.stringToUUID(sequenceId)});

	if (!sequence) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}

	if (!activitySchema.isValidSync(activity, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const _id = nodeuuid();
	activity = {...activity, sequence_id:  utils.stringToUUID(sequenceId), _id: utils.stringToUUID(_id)};

	await Promise.all([
		db.insert(account, model + ".activities", activity),
		FileRef.removeFile(account, model, "activities", sequenceId)
	]);

	return {...activity, _id, sequence_id: sequenceId};
};

SequenceActivities.edit = async (account, model, sequenceId, activityId, activity) => {
	const sequence = await db.findOne(account, model + ".sequences", { _id: utils.stringToUUID(sequenceId)});

	if (!sequence) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}

	if (!activityEditSchema.isValidSync(activity, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const query =  {_id: utils.stringToUUID(activityId), sequence_id: utils.stringToUUID(sequenceId)};
	const {result} = await db.update(account, model + ".activities", query, {$set: activity});

	if (!result.n) {
		throw responseCodes.ACTIVITY_NOT_FOUND;
	}

	await FileRef.removeFile(account, model, "activities", sequenceId);

	return {...activity, _id: activityId, sequence_id: sequenceId};
};

SequenceActivities.remove = async (account, model, sequenceId, activityId) => {
	const sequence = await db.findOne(account, model + ".sequences", { _id: utils.stringToUUID(sequenceId)});

	if (!sequence) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}

	const query =  {_id: utils.stringToUUID(activityId), sequence_id: utils.stringToUUID(sequenceId)};
	const {result} = await db.remove(account, model + ".activities", query);

	if (!result.n) {
		throw responseCodes.ACTIVITY_NOT_FOUND;
	}

	await FileRef.removeFile(account, model, "activities", sequenceId);

	return { _id: activityId};
};

SequenceActivities.get = async (account, model, sequenceId) => {
	return await createActivitiesTree(account, model, sequenceId);
};

module.exports =  SequenceActivities;