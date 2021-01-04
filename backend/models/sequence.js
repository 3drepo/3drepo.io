/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const FileRef = require("./fileRef");
const History = require("./history");
const { findRef } = require("./ref");

class Sequence {

	clean(toClean, keys) {
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
	}

	cleanActivityDetail(toClean) {
		const keys = ["_id", "parents"];

		return this.clean(toClean, keys);
	}

	cleanSequenceList(toClean) {
		const keys = ["_id", "rev_id", "model"];

		for (let i = 0; toClean["frames"] && i < toClean["frames"].length; i++) {
			toClean["frames"][i] = this.cleanSequenceFrame(toClean["frames"][i]);
		}

		return this.clean(toClean, keys);
	}

	cleanSequenceFrame(toClean) {
		const key = "dateTime";

		if (toClean[key] && utils.isDate(toClean[key])) {
			toClean[key] = new Date(toClean[key]).getTime();
		}

		return toClean;
	}

	async getSequenceActivityDetail(account, model, activityId) {
		const dbCol = await db.getCollection(account, model + ".activities");
		const activity = await dbCol.findOne({"_id": utils.stringToUUID(activityId)});

		if (!activity) {
			return Promise.reject(responseCodes.ACTIVITY_NOT_FOUND);
		}

		this.cleanActivityDetail(activity);

		return activity;
	}

	async getSequenceActivities(account, model, sequenceId) {
		return FileRef.getSequenceActivitiesFile(account, model, utils.uuidToString(sequenceId));
	}

	getSequenceState(account, model, stateId) {
		return FileRef.getSequenceStateFile(account, model, stateId);
	}

	async getList(account, model, branch, revision, cleanResponse = false) {
		const history = await History.getHistory({account, model}, branch, revision);
		let submodels = [];

		if (history.current) {
			submodels = await findRef(account, model, {type: "ref", _id: {"$in": history.current}}, {project:1});
			submodels = submodels.map(r => r.project);
		}

		const submodelSequencesPromises = Promise.all(submodels.map((submodel) => this.getList(account, submodel, "master", null, cleanResponse)));

		const dbCol = await db.getCollection(account, model + ".sequences");

		const sequences = await (dbCol.find({"rev_id": history._id}).toArray());
		sequences.forEach((sequence) => {
			sequence.teamspace = account;
			sequence.model = model;

			if (cleanResponse) {
				this.cleanSequenceList(sequence);
			}
		});

		const submodelSequences = await submodelSequencesPromises;
		submodelSequences.forEach((s) => sequences.push(...s));

		return sequences;
	}
}

module.exports = new Sequence();
