var https = require('https');

module.exports = function httpsGet(url, qs){
	'use strict';
	
	qs = '?' + qs || '';
	console.log(url + qs);

	return new Promise((resolve, reject) => {
		https.get(url + qs, result => {
			// Buffer the body entirely for processing as a whole.

			var bodyChunks = [];
			result.on('data', function(chunk) {
				bodyChunks.push(chunk);
			}).on('end', function() {
				var body = Buffer.concat(bodyChunks);
				var json = JSON.parse(body);

				if([200, 201].indexOf(result.statusCode) === -1){
					reject(json);
				} else {
					resolve(json);
				}
				
			});

		}).on('error', function(e) {
			reject(e);
		});
	});

};
