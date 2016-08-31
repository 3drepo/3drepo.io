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


// generic stash function
var ModelFactory = require('../factory/modelFactory');
var stream = require('stream');
var GridFSBucket = require('mongodb').GridFSBucket;
var systemLogger = require("../../logger.js").systemLogger;


function getGridFSBucket (account, bucketName){
	'use strict';

	return new GridFSBucket(
		ModelFactory.db.db(account),
		{ bucketName:  bucketName}
	);
}


function _getGridFSBucket (dbCol, format){
	'use strict';

	return new GridFSBucket(
		ModelFactory.db.db(dbCol.account),
		{ bucketName:  `${dbCol.project}.stash.${format}`}
	);
}

function findStashByFilename(dbCol, format, filename, getStreamOnly){
	'use strict';

	let bucket = _getGridFSBucket(dbCol, format);

	return bucket.find({ filename }).toArray().then(files => {
		if(!files.length){
			systemLogger.logInfo(filename + " - Attempt to retrieved from stash but not found");
			return Promise.resolve(false);
			
		} else {
			systemLogger.logInfo(filename + " - Retrieved from stash");

			return new Promise((resolve) => {

				let downloadStream = bucket.openDownloadStreamByName(filename);

				if(getStreamOnly){
					
					resolve(downloadStream);

				} else { 

					let bufs = [];

					downloadStream.on('data', function(d){ bufs.push(d); });
					downloadStream.on('end', function(){
						resolve(Buffer.concat(bufs));
					});

				}

			});

		}
	});
}

function saveStashByFilename(dbCol, format, filename, buffer){
	'use strict';

	let bucket = _getGridFSBucket(dbCol, format);
	let uploadStream = bucket.openUploadStream(filename);

	let bufferStream = new stream.PassThrough();
	bufferStream.end(buffer);

	bufferStream.pipe(uploadStream);

	return new Promise((resolve, reject) => {
		uploadStream.once('finish', function(fileMeta) {
			resolve(fileMeta);
		});

		uploadStream.once('error', function(err) {
			reject(err);
		});
	});
}

module.exports = {
	findStashByFilename: findStashByFilename,
	saveStashByFilename: saveStashByFilename,
	getGridFSBucket: getGridFSBucket

};
