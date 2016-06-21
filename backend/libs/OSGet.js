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

var httpsGet = require('./httpsReq').get;
var buildQueryString = require('./buildQueryString');

module.exports = function(osConfig){
	return {
		radius: queries => {
			queries = queries || {};
			queries.key = osConfig.keys.place;
			return httpsGet(osConfig.endpoints.radius, buildQueryString(queries));
		},

		dimensions: (params, queries) => {
			
			params = params || {};
			queries = queries || {};
			queries.key = osConfig.keys.property;
			return httpsGet(osConfig.endpoints.dimensions(params), buildQueryString(queries));

		},

		bbox: queries => {
			queries = queries || {};
			queries.key = osConfig.keys.place;
			return httpsGet(osConfig.endpoints.bbox, buildQueryString(queries));
		},

		map: (params, queries) => {
			params = params || {};
			queries = queries || {};
			queries.key = osConfig.keys.map;
			//console.log(buildQueryString(queries));
			return httpsGet(osConfig.endpoints.map(params), buildQueryString(queries));
		},

		uprn: queries => {
			queries = queries || {};
			queries.key = osConfig.keys.place;
			return httpsGet(osConfig.endpoints.uprn, buildQueryString(queries));
		}

	};
};