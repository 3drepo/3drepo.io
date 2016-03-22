// generic stash function
var ModelFactory = require('../factory/modelFactory');
var stream = require('stream');
var GridFSBucket = require('mongodb').GridFSBucket;

function _getGridFSBucket (dbCol, format){
	'use strict';

	return new GridFSBucket(
		ModelFactory.db.db(dbCol.account), 
		{ bucketName:  `${dbCol.project}.stash.${format}`}
	);
}

function findStashByFilename(dbCol, format, filename){
	'use strict';

	let bucket = _getGridFSBucket(dbCol, format);
	
	return bucket.find({ filename }).toArray().then(files => {
		if(!files.length){
			//console.log('no stash found');
			dbCol.logger.logInfo(filename + " - Attempt to retrieved from stash but not found");
			return Promise.resolve(false);
		} else {
			//console.log('stash found!');
			dbCol.logger.logInfo(filename + " - Retrieved from stash");
			return new Promise((resolve) => {

				let downloadStream = bucket.openDownloadStreamByName(filename);
				let bufs = [];

				downloadStream.on('data', function(d){ bufs.push(d); });
				downloadStream.on('end', function(){
					resolve(Buffer.concat(bufs));
				});

			});

		}
	});
}

function saveStashByFileName(dbCol, format, filename, buffer){
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
	saveStashByFileName: saveStashByFileName
};