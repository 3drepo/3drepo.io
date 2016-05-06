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


var https = require('https');

module.exports = function httpsGet(url, qs){
	'use strict';
	
	qs = '?' + qs || '';
	//console.log(url + qs);

	return new Promise((resolve, reject) => {
		https.get(url + qs, result => {
			//console.log(url + qs);
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
