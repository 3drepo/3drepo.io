/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.ap
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

	const ModelFactory = require('./factory/modelFactory');
	const responseCodes = require('../response_codes.js');
	//const mongodb = require('mongodb');
	function getPipeline(field, sort){
		try {
			return require(`./pipelines/issue/${field}`)(sort);
		} catch (e) {
			if (e.code !== 'MODULE_NOT_FOUND') {
				throw e;
			} else {
				return;
			}
		}
	}

	module.exports = {
		
		groupBy: (account, project, field, sort) => {

			const collection = ModelFactory.db.db(account).collection(`${project}.issues`);
			const pipeline = getPipeline(field, sort);
			
			console.log(JSON.stringify(pipeline, null , 2));

			if(!pipeline){
				return Promise.reject(responseCodes.GROUP_BY_FIELD_NOT_SUPPORTED);
			}

			return collection.aggregate(pipeline).toArray();

		}
	};

})();