var httpsGet = require('./httpsGet');
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
		}

	};
};