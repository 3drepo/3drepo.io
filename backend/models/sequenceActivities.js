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
const {pick, last} = require("lodash");
const Sequence = require("./sequence");

const keyValueSchema = yup.object().shape({
	key: yup.string().required(),
	value: yup.mixed().required()
}).noUnknown();

const activityEditSchema = yup.object().shape({
	name: yup.string(),
	startDate: yup.number(),
	endDate: yup.number(),
	parent: yup.string(),
	resources: yup.object(),
	data: yup.array().of(keyValueSchema)
}).noUnknown();

const activitySchema = yup.object().shape({
	_id: yup.object(),
	name: yup.string().required(),
	startDate: yup.number().required(),
	endDate: yup.number().required(),
	parent: yup.string(),
	resources: yup.object(),
	data: yup.array().of(keyValueSchema),
	subActivities: yup.array()
}).noUnknown();

// const activityTreeSchema = yup.array().of(activitySchema).required();

const activityCol = (modelId) => `${modelId}.activities`;

const cleanActivityDetail = (activity) => {
	activity._id = utils.uuidToString(activity._id);
	activity.sequenceId = utils.uuidToString(activity.sequenceId);

	if (activity.parent) {
		activity.parent = utils.uuidToString(activity.parent);
	}

	return activity;
};

const clearActivityListCache = async (account, model, sequenceId)  =>
	await FileRef.removeFile(account, model, "activities", sequenceId);

const traverseActivities = (activities, callback) => {
	const visited = [];
	const indexArr = [0];

	let actual = activities[0];

	do {
		while(actual) {
			visited.push(actual);
			indexArr.push(0);
			actual = (actual.subActivities || [])[0];
		}

		if (visited.length > 0) {
			const temp = visited.pop();
			indexArr.pop(); //  Get rid of leaf index;

			const index = last(indexArr) + 1;
			indexArr[indexArr.length - 1] = index; // Set index for sibling

			const parent = last(visited);

			if (visited.length > 0) {
				actual = parent.subActivities[index];
			} else {
				actual = activities[index];
			}

			callback(temp, parent);
		}
	} while (visited.length > 0 || actual);
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

const addToActivityTree = (activity, parent, treeFile, treeFileDictionary) => {
	// The treeFileDictionary is being use for quick access to the activity,
	// in particular to add the subactivities to its parents
	const parentId = parent ? utils.uuidToString(parent._id || parent.id) : null ;
	const id = utils.uuidToString(activity._id || activity.id);

	if (parent && !treeFileDictionary[parentId]) {
		treeFileDictionary[parentId] = simplifyActivity(parent);
	}

	if (!treeFileDictionary[id]) {
		treeFileDictionary[id] = simplifyActivity(activity);
	}

	if (parent) {
		if (!treeFileDictionary[parentId].subActivities) {
			treeFileDictionary[parentId].subActivities = [];
		}

		treeFileDictionary[parentId].subActivities.push(treeFileDictionary[id]);
	} else {
		treeFile.push(treeFileDictionary[id]);
	}
};

const createActivitiesTree = async(account, model, sequenceId) => {
	const foundActivities = await db.find(account, model + ".activities", {sequenceId: utils.stringToUUID(sequenceId)}, { metadata: 0, resources: 0 });

	const activities = [];
	const activitiesDictionary = {};

	foundActivities.forEach((activity) => {
		activitiesDictionary[utils.uuidToString(activity._id)] = simplifyActivity(activity);
	});

	foundActivities.forEach((activity) => {
		const parent = activity.parent ? activitiesDictionary[utils.uuidToString(activity.parent)] : null;
		addToActivityTree(activity, parent, activities, activitiesDictionary);
	});

	return { activities };
};

// This function is used for validation the receive data from the request,
// add an activity to a plain array and create the treefile for saving afterwards
const addToActivityListAndCreateTreeFile = (activitiesList, sequenceIdUUID, treeFile, createFile) => {
	const treeFileDictionary = {};

	let id = null;
	const idsDictionary = {};

	return (activity, parent) => {
		// TODO: test that _id is a bson object
		if (!activitySchema.isValidSync(activity, { strict: true })) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		if (parent && !parent._id) {
			id = utils.stringToUUID(nodeuuid());

			while (idsDictionary[id]) { // if the id is already there, create a new one
				id = utils.stringToUUID(nodeuuid());
			}

			idsDictionary[id] = true;

			parent._id = id ;
		}

		if (!activity._id) {
			id = utils.stringToUUID(nodeuuid());

			while (idsDictionary[id]) { // if the id is already there, create a new one
				id = utils.stringToUUID(nodeuuid());
			}

			idsDictionary[id] = true;
			activity._id =  id;
		}

		const plainActivity = pick(activity,"_id", "name", "startDate", "endDate", "data", "resources");
		plainActivity.sequenceId = sequenceIdUUID;

		if (parent) {
			plainActivity.parent = parent._id;
		}

		activitiesList.push(plainActivity);

		if (createFile) {
			addToActivityTree(activity, parent, treeFile, treeFileDictionary);
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

SequenceActivities.create = async (account, model, sequenceId, activity) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	if (!activitySchema.isValidSync(activity, { strict: true })) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	if (activity.parent && !await db.findOne(account,  activityCol(model), { _id: utils.stringToUUID(activity.parent)})) {
		throw responseCodes.INVALID_ARGUMENTS;
	}

	const _id = nodeuuid();
	activity = {...activity, sequenceId:  utils.stringToUUID(sequenceId), _id: utils.stringToUUID(_id)};

	await Promise.all([
		db.insert(account,  activityCol(model), activity),
		await clearActivityListCache(account, model, sequenceId)
	]);

	return {...activity, _id, sequenceId: sequenceId};
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
	const {result} = await db.update(account, activityCol(model), query, {$set: activity});

	if (!result.n) {
		throw responseCodes.ACTIVITY_NOT_FOUND;
	}

	await clearActivityListCache(account, model, sequenceId);
};

SequenceActivities.remove = async (account, model, sequenceId, activityId) => {
	await Sequence.sequenceExists(account, model, sequenceId);

	const idsToDelete = await getDescendantsIds(account, model, sequenceId, activityId);

	const query = {_id:{ $in: idsToDelete}, sequenceId: utils.stringToUUID(sequenceId)};
	const {result} = await db.remove(account,  activityCol(model), query);

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
		FileRef.storeFile(account, activityCol(model) + ".ref", account, utils.uuidToString(nodeuuid()), JSON.stringify(activities),  {"_id": sequenceId});
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
			FileRef.storeFile(account, activityCol(model) + ".ref", account, utils.uuidToString(nodeuuid()), activityTreeFile, {"_id": sequenceId})
		]);
	}

	await db.insertMany(account, activityCol(model), activitiesList);
};

module.exports =  SequenceActivities;