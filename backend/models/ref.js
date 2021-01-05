/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const ModelSettings = require("./modelSetting");

function getRefCollectionName(model) {
	return model + ".scene";
}

const Ref = {};

Ref.findRef = async function(account, model, query, projection) {
	return db.find(account, getRefCollectionName(model), query, projection);
};

Ref.getRefNodes = async function(account, model, ids) {
	const settings = await ModelSettings.findById({account}, model);

	if (settings.federate) {
		const filter = {
			type: "ref"
		};

		if (ids && ids.length > 0) {
			filter._id = { $in: ids };
		}

		return Ref.findRef(account, model, filter);
	}

	return [];
};

module.exports = Ref;
