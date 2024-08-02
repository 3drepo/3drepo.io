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
const C = require("../constants");
const db = require("../handler/db");
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const FileRef = require("./fileRef");
const yup = require("yup");
const {pick} = require("lodash");
const Sequence = require("./sequence");

const keyValueSchema = yup.object().shape({
	key: yup.string().required(),
	value: yup.mixed().required()
}).noUnknown();

const activityEditSchema = yup.object().shape({
	name: yup.string(),
	startDate: yup.number().min(C.MIN_MS_TIMESTAMP),
	endDate: yup.number().min(C.MIN_MS_TIMESTAMP),
	parent: yup.string(),
	resources: yup.object(),
	data: yup.array().of(keyValueSchema)
}).noUnknown();

const activitySchema = yup.object().shape({
	_id: yup.object(),
	name: yup.string().required(),
	startDate: yup.number().min(C.MIN_MS_TIMESTAMP).required(),
	endDate: yup.number().min(C.MIN_MS_TIMESTAMP).required(),
	parent: yup.object(),
	resources: yup.object(),
	data: yup.array().of(keyValueSchema),
	subActivities: yup.array()
}).noUnknown();

const activityCol = (modelId) => `${modelId}.activities`;

const cleanActivityDetail = (activity) => {
	activity._id = utils.uuidToString(activity._id);
	activity.sequenceId = utils.uuidToString(activity.sequenceId);

	if (activity.parent) {
		activity.parent = utils.uuidToString(activity.parent);
	}

	if (activity?.resources?.shared_ids) {
		activity.resources.shared_ids = activity.resources.shared_ids.map(utils.uuidToString);
	}

	return activity;
};

const clearActivityListCache = async (account, model, sequenceId)  =>
	await FileRef.removeFile(account, model, "activities", sequenceId);

const findActivityInsertionIndex = (activityList, newActivity) => {
	return activityList.findIndex(activity => {
		return activity.startDate > newActivity.startDate;
	});
};

const traverseActivities = (activities, callback) => {
	const stack = [...activities];
	const generatedIDs = new Set();

	while (stack.length > 0) {
		const currentActivity = stack.pop();
		let _id = utils.generateUUID({string: true});

		while (generatedIDs.has(_id)) { // guarantee uniqueness
			_id = utils.generateUUID({string: true});
		}

		generatedIDs.add(_id);
		currentActivity._id = utils.stringToUUID(_id);

		callback(currentActivity);
		if(currentActivity.subActivities) {
			currentActivity.subActivities.forEach((child) => {
				child.parent = currentActivity._id;
				stack.push(child);
			});
		}
	}
};

const simplifyActivity = (activity) => {
	const id = activity._id ? utils.uuidToString(activity._id) : null;
	return  { id, ...pick(activity, "name", "startDate", "endDate") };
};

const getDescendantsIds = async (account, model, sequenceId, parent) => {
	let parents = [utils.stringToUUID(parent)];
	sequenceId = utils.stringToUUID(sequenceId);

	const ids = [utils.stringToUUID(parent)];
	let currentDescendants = [];

	do {
		currentDescendants = await db.find(account,activityCol(model), {sequenceId, parent: {$in: parents}} , {_id:1});
		parents = [];
		(currentDescendants || []).forEach(({_id}) => {
			parents.push(_id);
			ids.push(_id);
		});
	} while(currentDescendants.length);

	return ids;
};

const addToActivityTree = (activity, treeFile, treeFileDictionary) => {
	// The treeFileDictionary is being use for quick access to the activity,
	// in particular to add the subactivities to its parents
	const parentId =  activity.parent ? utils.uuidToString(activity.parent) : null;

	const id = utils.uuidToString(activity._id);

	if (parentId && !treeFileDictionary[parentId]) {
		treeFileDictionary[parentId] = {subActivities:[]};
	}

	const simpleActivity = simplifyActivity(activity);
	treeFileDictionary[id] = {...simpleActivity, ...(treeFileDictionary[id] || {})};

	if (parentId) {
		if (!treeFileDictionary[parentId].subActivities) {
			treeFileDictionary[parentId].subActivities = [];
		}

		const insertIndex = findActivityInsertionIndex(treeFileDictionary[parentId].subActivities, treeFileDictionary[id]);
		treeFileDictionary[parentId].subActivities.splice(insertIndex, 0, treeFileDictionary[id]);
	} else {
		const insertIndex = findActivityInsertionIndex(treeFile, treeFileDictionary[id]);
		treeFile.splice(insertIndex, 0, treeFileDictionary[id]);
	}
};

const createActivitiesTree = async(account, model, sequenceId) => {
	const foundActivities = await db.find(account, model + ".activities", {sequenceId: utils.stringToUUID(sequenceId)}, { metadata: 0, resources: 0 });

	const activities = [];
	const activitiesDictionary = {};

	foundActivities.forEach((activity) => addToActivityTree(activity, activities, activitiesDictionary));

	return { activities };
};

// This function is used for validation the receive data from the request,
// add an activity to a plain array and create the treefile for saving afterwards
const addToActivityListAndCreateTreeFile = (activitiesList, sequenceIdUUID, treeFile, createFile) => {
	const treeFileDictionary = {};

	return (activity) => {
		if (!activitySchema.isValidSync(activity, { strict: true }) || (activity.parent && !utils.isUUIDObject(activity.parent))) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		const plainActivity = pick(activity, "_id", "parent", "name", "startDate", "endDate", "data", "resources");
		plainActivity.sequenceId = sequenceIdUUID;

		activitiesList.push(plainActivity);

		if (createFile) {
			addToActivityTree(activity, treeFile, treeFileDictionary);
		}
	};
};

const SequenceActivities = {};

SequenceActivities.getSequenceActivityDetail = async (account, model, sequenceId, activityId) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	const activity = await db.findOne(account, activityCol(model), {"_id": utils.stringToUUID(activityId)});

	if (!activity) {
		throw responseCodes.ACTIVITY_NOT_FOUND;
	}

	return cleanActivityDetail(activity);
};

SequenceActivities.edit = async (account, model, sequenceId, activityId, activity) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	if (!activityEditSchema.isValidSync(activity, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	if (activity.parent && !await db.findOne(account, activityCol(model), { _id: utils.stringToUUID(activity.parent)})) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const query =  {_id: utils.stringToUUID(activityId), sequenceId: utils.stringToUUID(sequenceId)};
	const {result} = await db.updateOne(account, activityCol(model), query, {$set: activity});

	if (!result.n) {
		throw responseCodes.ACTIVITY_NOT_FOUND;
	}

	await clearActivityListCache(account, model, sequenceId);
};

SequenceActivities.remove = async (account, model, sequenceId, activityId) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	const idsToDelete = await getDescendantsIds(account, model, sequenceId, activityId);

	const query = {_id:{ $in: idsToDelete}, sequenceId: utils.stringToUUID(sequenceId)};
	const {result} = await db.deleteMany(account, activityCol(model), query);

	if (!result.n) {
		throw responseCodes.ACTIVITY_NOT_FOUND;
	}

	await clearActivityListCache(account, model, sequenceId);

	return { _id: activityId};
};

SequenceActivities.get = async (account, model, sequenceId) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	let activities = {};

	try {
		activities = await FileRef.getSequenceActivitiesFile(account, model, utils.uuidToString(sequenceId));
	} catch(e) {
		activities = await createActivitiesTree(account, model, sequenceId);
		await FileRef.storeFile(account, activityCol(model) + ".ref", account, utils.generateUUID({string: true}), JSON.stringify(activities),  {"_id": sequenceId}).catch(() => {});
	}

	return activities;
};

SequenceActivities.createActivities = async (account, model, sequenceId, activities, overwrite) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	if (!yup.array().isValidSync(activities, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const activitiesList = [];
	const treeFile = [];
	traverseActivities(activities, addToActivityListAndCreateTreeFile(activitiesList, utils.stringToUUID(sequenceId), treeFile, overwrite));

	await clearActivityListCache(account, model, sequenceId);

	if(overwrite) {
		const activityTreeFile = JSON.stringify({activities: treeFile});

		await Promise.all([
			db.deleteMany(account, activityCol(model),{}),
			FileRef.storeFile(account, activityCol(model) + ".ref", account, utils.generateUUID({string: true}), activityTreeFile, {"_id": sequenceId})
		]);
	}

	await db.insertMany(account, activityCol(model), activitiesList);
};

module.exports =  SequenceActivities;
