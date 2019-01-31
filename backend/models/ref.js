/**
 *  Copyright (C) 2014 3D Repo Ltd
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
const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const ModelSettings = require("./modelSetting");

const Schema = mongoose.Schema;

const refSchema = Schema({
	_id: Object,
	shared_id: Object,
	type: { type: String, default: "ref"},
	project: String,
	owner: String,
	_rid: Object,
	parents: [],
	name: String
});

refSchema.statics.getRefNodes = function(account, model, ids) {
	return ModelSettings.findById({account}, model).then((settings) => {
		if(settings.federate) {
			const filter = {
				type: "ref"
			};

			if (ids && ids.length > 0) {
				filter._id = { $in: ids };
			}

			return Ref.find({ account, model }, filter);
		}
		return [];
	});
};

refSchema.methods = {};

const Ref = ModelFactory.createClass(
	"Ref",
	refSchema,
	arg => {
		return `${arg.model}.scene`;
	}
);

module.exports = Ref;
