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
const { groupBy } = require("lodash");

const keyValueSchema = yup.object().shape({
	key: yup.string().required(),
	value: yup.mixed().required()
});

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
 * @param {string} id
 * @param {Array<Activity>} activities;
 * @return {Array<Activity>}
 */
const getSubtasks = (id, activities) => {
	// console.log("getSubtasks");
	return activities.filter(activity => {
		const parents = (activity.parents ||  []);

		if (id) {
			return parents.includes(id);
		} else {
			return !parents.length;
		}
	}).map(activity => {
		// console.log(activity);
		// console.log(getSubtasks);

		const subTasks = getSubtasks(activity._id, activities);

		//	console.log("llego a subtasks");
		if (subTasks.length) {
			activity.subTasks = subTasks;
		}

		return activity;
	});
};

const createActivitiesTree = async(account, model, sequenceId) => {
	// try{
	// console.log("llegamos");
	const activities = await db.find(account, model + ".activities",{}); // filter by sequenceId
	activities.forEach(activity => {
		activity._id = utils.uuidToString(activity._id);

		activity.resources = [];

		if (activity.parents) {
			activity.parents = activity.parents.map(utils.uuidToString);
		}

	});

	const tasks = getSubtasks(null, activities);
	// } catch(e) {
	// 	console.log(e);
	// }

	return {tasks};
};

const SequenceActivities = {};

SequenceActivities.create = async (account, model, sequenceId, activity) => {
	const sequence = await db.findOne(account, model + ".sequences", { _id: utils.stringToUUID(sequenceId)});

	if (!sequence) {
		throw responseCodes.SEQUENCE_NOT_FOUND;
	}

	if (!activitySchema.isValidSync(activity)) {
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

SequenceActivities.get = async (account, model, sequenceId) => {
	return await createActivitiesTree(account, model, sequenceId);
};

module.exports =  SequenceActivities;