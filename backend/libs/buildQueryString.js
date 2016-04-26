module.exports = function buildQueryString(params){
	'use strict';
	
	let qs = [];
	
	Object.keys(params).forEach(key => {
		qs.push(key + '=' + encodeURIComponent(params[key]));
	});

	return qs.join('&');
};
