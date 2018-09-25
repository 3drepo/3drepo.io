/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const db = require("../db/db");
const utils = require("../utils");
const uuid = require("node-uuid");

module.exports = {
	constants:{
		ISSUE_ASSIGNED : "ISSUE_ASSIGNED",
		ISSUE_CREATED : "ISSUE_CREATED"
	},

	createNotification(username, teamSpace, modelId, type, data) {
		const _id = uuid.v1();

		return db.getCollection("notifications", username).then((collection) => {
			const notification = {teamSpace, modelId, type, data, _id:utils.stringToUUID(_id)};
			return collection.insertOne(notification);
		}).then((o) => Object.assign(o.ops[0], {_id}));
	}

};