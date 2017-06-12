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
	const json2csv = require('json2csv');

	function getField(field){
		try {
			return require(`./aggregate_fields/issue/${field}`);
		} catch (e) {
			return `$$CURRENT.${field}`;
		}
	}

	module.exports = {
		
		groupBy: (account, project, groups, sort, format) => {

			const collection = ModelFactory.db.db(account).collection(`${model}.issues`);

			let fields = {};

			groups.forEach(group => {
				fields[group] = getField(group);
			});

			const field = `_id.${groups[0]}`;

			const pipeline = [
				{ '$group' : { _id: fields, 'count': { '$sum': 1 } }},
				{ '$sort': {'count': sort, [field]: sort}}
			];

			if(!pipeline){
				return Promise.reject(responseCodes.GROUP_BY_FIELD_NOT_SUPPORTED);
			}

			const promise = collection.aggregate(pipeline).toArray();

			if(format === 'csv'){

				let csvFields = [];
				let csvFieldNames = [];

				groups.forEach(group => {
					csvFields.push(`_id.${group}`);
					csvFieldNames.push(group);
				});

				csvFieldNames.push('count');
				csvFields.push('count');

				return promise.then(data => {
					return json2csv({ data, fields: csvFields, fieldNames: csvFieldNames });
				});
			}

			return promise;

		}
	};

})();