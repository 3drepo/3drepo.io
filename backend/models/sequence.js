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

const History = require("./history");

class Sequence {

	clean(toClean, targetType = "[object String]") {
		const keys = ["_id", "rev_id"];

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

		for (let i = 0; toClean["frames"] && i < toClean["frames"].length; i++) {
			for (let j = 0; toClean["frames"][i]["tasks"] && j < toClean["frames"][i]["tasks"].length; j++) {
				toClean["frames"][i]["tasks"][j] = this.clean(toClean["frames"][i]["tasks"][j]);
			}
		}

		return toClean;
	}

	async getList(account, model, branch, revision, cleanResponse = false) {

		const history = await History.getHistory({account, model}, branch, revision);

		if (!history) {
			return Promise.reject(responseCodes.INVALID_TAG_NAME);
		}

		return db.getCollection(account, model + ".sequences").then(_dbCol => {
			return _dbCol.find({"rev_id": history._id}).toArray().then(sequences => {
				sequences.forEach((sequence) => {
					if (cleanResponse) {
						this.clean(sequence);
					}
				});

				return sequences;
			});
		});
	}
}

module.exports = new Sequence();
