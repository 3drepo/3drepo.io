var repoGraphScene = require("../../repo/repoGraphScene.js");
var GridFSBucket = require('mongodb').GridFSBucket;
var ModelFactory = require('../factory/modelFactory');
var Revision = require('../revision');
var utils = require("../../utils");
var responseCodes = require('../../response_codes.js');

stringToUUID = utils.stringToUUID;
uuidToString = utils.uuidToString;

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
//var methods = {};

statics._getGridFSBucket = function(dbCol, format){

	return new GridFSBucket(
		ModelFactory.db.db(dbCol.account), 
		{ bucketName:  `${dbCol.project}.stash.${format}`}
	);
};

statics.findStashByFilename = function(dbCol, format, filename){
	'use strict';

	let bucket = this._getGridFSBucket(dbCol, format);
	
	return bucket.find({ filename }).toArray().then(files => {
		if(!files.length){
			//console.log('no stash found');
			return Promise.resolve(false);
		} else {
			//console.log('stash found!');
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
	
};

statics.findByUID = function(dbCol, uid, options){
	'use strict';

	let projection = options && options.projection || {};

	let _find = () => ModelFactory.db.db(dbCol.account).collection(`${dbCol.project}.stash.3drepo`).find({_id: stringToUUID(uid)}).limit(1).next().then(obj => {

		if(!obj) {
			return this.findById(dbCol, stringToUUID(uid), projection);
		}

		obj.toObject = () => obj;
		return Promise.resolve(obj);

	}).then(obj =>{
		
		if(!obj){
			return Promise.reject({resCode: responseCodes.OBJECT_NOT_FOUND});
		}

		return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj.toObject()]));
	});



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
};

statics.findByRevision = function(dbCol, rid, sid, options){
	'use strict';

	let projection = options && options.projection || {};

	let _find = () => Revision.findById(dbCol, stringToUUID(rid)).then( rev => {
		rev = rev.toObject();
		return this.findOne(dbCol, { _id: { '$in': rev.current }, shared_id: stringToUUID(sid) }, projection).then(obj => {

			if(!obj){
				return Promise.reject({resCode: responseCodes.OBJECT_NOT_FOUND});
			}

			return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj.toObject()]));
		});
	});

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
};


module.exports = {attrs, statics};
