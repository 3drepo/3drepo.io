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

	function getField(field){
		try {
			return require(`./aggregate_fields/issue/${field}`);
		} catch (e) {
			return `$$CURRENT.${field}`;
		}
	}

	module.exports = {
		
		groupBy: (account, project, firstField, secondField, sort) => {

			const collection = ModelFactory.db.db(account).collection(`${project}.issues`);

			const fields = secondField ? {firstField: getField(firstField), secondField: getField(secondField)} : getField(firstField);

			const pipeline = [
				{ '$group' : { _id: fields, 'count': { '$sum': 1 } }},
				{ '$sort': {'count': sort }}
			];

			if(!pipeline){
				return Promise.reject(responseCodes.GROUP_BY_FIELD_NOT_SUPPORTED);
			}

			return collection.aggregate(pipeline).toArray();

		}
	};

})();