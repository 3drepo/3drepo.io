/**
 *  Copyright (C) 2017 3D Repo Ltd
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

(() => {
	"use strict";

	const mongoose = require("mongoose");
	const jobSchema = mongoose.Schema({
		_id: String,
		color: String
	});


	jobSchema.statics.add = function(user, job){

		if(!user){
			throw new Error('Arg user is missing');
		}

		user.customData.jobs.push(job);
		
		return user.save();

	}

	jobSchema.statics.remove = function(user, name){

		if(!user){
			throw new Error('Arg user is missing');
		}

		let job = user.customData.jobs.id(name);
		job && job.remove();

		return user.save();

	};

	module.exports = jobSchema;

})();