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

module.exports =  SequenceActivities;

