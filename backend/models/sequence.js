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
const utils = require("../utils");
const History = require("./history");
const Task = require("./task");

class Sequence {

	clean(toClean, targetType = "[object String]") {
		const keys = ["_id", "revId"];

		keys.forEach((key) => {
			if (toClean[key] && "[object String]" === targetType) {
				if ("[object Object]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = utils.uuidToString(toClean[key]);
				} else if ("[object Array]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = toClean[key].map((elem) => utils.uuidToString(elem));
				}
			} else if (toClean[key] && "[object Object]" === targetType) {
				if ("[object String]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = utils.stringToUUID(toClean[key]);
				} else if ("[object Array]" === Object.prototype.toString.call(toClean[key])) {
					toClean[key] = toClean[key].map((elem) => utils.stringToUUID(elem));
				}
			}
		});

		return toClean;
	}

	async getList(account, model, branch, revision, cleanResponse = false) {
		
		const history = await History.getHistory({account, model}, branch, revision);

		if (!history) {
			return Promise.reject(responseCodes.INVALID_TAG_NAME);
		}
		
		return db.getCollection(account, model + ".sequences").then(_dbCol => {
			return _dbCol.find({"revId": history._id}).toArray().then(sequences => {
				let taskPromises = [];

				sequences.forEach((sequence) => {
					if (cleanResponse) {
						this.clean(sequence);
					}

					for (let i = 0; sequence["sequence"] && i < sequence["sequence"].length; i++) {
						for (let j = 0; sequence["sequence"][i]["tasks"] && j < sequence["sequence"][i]["tasks"].length; j++) {
							const taskPromise = Task.findByUID(
								account,
								model,
								sequence["sequence"][i]["tasks"][j],
								cleanResponse
							);

							taskPromises.push(taskPromise);
							
							taskPromise.then((task) => {
								sequence["sequence"][i]["tasks"][j] = task;
							});
						}
					}
				});

				return Promise.all(taskPromises).then(() => {
					return sequences;
				});
			});
		});
	}
}

module.exports = new Sequence();
