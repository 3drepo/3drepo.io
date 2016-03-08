var repoGraphScene = require("../../repo/repoGraphScene.js");
var GridFSBucket = require('mongodb').GridFSBucket;
var ModelFactory = require('../factory/modelFactory');

var attrs = {
	_id: Buffer,
	shared_id: Buffer,
	paths: [],
	type: String,
	api: Number,
	parents: [],
	name: String
};

var statics = {};
var methods = {};

statics._getGridFSBucket = function(dbCol, format){
	return new GridFSBucket(
		ModelFactory.db.db(dbCol.account), 
		{ bucketName:  `${dbCol.project}.stash.${format}`}
	);
};

statics.findStashByFilename = function(dbCol, format, filename){
	'use strict';

	let bucket = this._getGridFSBucket(dbCol, format);
	
	//console.log(filename)
	return bucket.find({ filename }).toArray().then(files => {
		if(!files.length){
			console.log('no stash found');
			return Promise.resolve(false);
		} else {
			console.log('stash found!');
			return new Promise((resolve, reject) => {

				let downloadStream = bucket.openDownloadStreamByName(filename);
				let bufs = [];

				downloadStream.on('data', function(d){ bufs.push(d); });
				downloadStream.on('end', function(){
					resolve(Buffer.concat(bufs));
				});

			});

		}
	})
	
}

statics.findByUID = function(dbCol, uid, options){
	'use strict';

	let projection = options && options.projection || {};

	let _find = () => {
		let filter = { _id: stringToUUID(uid) };
		return this.findById(dbCol, stringToUUID(uid), projection).then(obj => {
			return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj.toObject()]));
		});
	}

	if(options && options.stash){
		//find obj from stash
		return this.findStashByFilename(dbCol, options.stash.format, options.stash.filename).then(buffer => {
			if(!buffer){
				return _find();
			} else {
				return Promise.resolve(buffer);
			}
		});

	} else {
		return _find();
	}
}


module.exports = {attrs, statics};
