var https = require('https');

module.exports = function httpsGet(url, qs){
	'use strict';
	
	qs = '?' + qs || '';
	//console.log(url + qs);

	return new Promise((resolve, reject) => {
		https.get(url + qs, result => {
			console.log(url + qs);
			// Buffer the body entirely for processing as a whole.

			//console.log(result.headers);

			var bodyChunks = [];
			result.on('data', function(chunk) {
				bodyChunks.push(chunk);
			}).on('end', function() {
				var body = Buffer.concat(bodyChunks);

				// console.log(result.headers['content-type']);
				if(result.headers['content-type'].startsWith('application/json')){
					body = JSON.parse(body);
				}

				if([200, 201].indexOf(result.statusCode) === -1){
					reject(body);
				} else {
					resolve(body);
				}
				
			});

		}).on('error', function(e) {
			reject(e);
		});
	});

};
