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


var repoGraphScene = require("../../repo/repoGraphScene.js");
var GridFSBucket = require('mongodb').GridFSBucket;
var ModelFactory = require('../factory/modelFactory');
var Revision = require('../revision');
var utils = require("../../utils");
var responseCodes = require('../../response_codes.js');
var mongoose = require('mongoose');
var _ = require('lodash');

var stringToUUID = utils.stringToUUID;
var uuidToString = utils.uuidToString;

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
			return Promise.resolve(false);
		} else {
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

statics.getSharedId = function(dbCol, uid){
	'use strict';

	let projection = { shared_id: 1 };

	return ModelFactory.db.db(dbCol.account).collection(`${dbCol.project}.stash.3drepo`).find({_id: stringToUUID(uid)}).limit(1).next().then(obj => {
		if(!obj) {
			return this.findById(dbCol, stringToUUID(uid), projection);
		}

		//from3DRepoStash = true;
		obj.toObject = () => obj;
		return Promise.resolve(obj);

	}).then(obj => {

		obj = obj && obj.toObject();
		return Promise.resolve(obj && uuidToString(obj.shared_id));

	});

};

statics.findByUID = function(dbCol, uid, options){
	'use strict';

	//let from3DRepoStash = false;

	let projection = options && options.projection || {};

	let _find = () => ModelFactory.db.db(dbCol.account).collection(`${dbCol.project}.stash.3drepo`).find({_id: stringToUUID(uid)}).limit(1).next().then(obj => {
		if(!obj) {
			return this.findById(dbCol, stringToUUID(uid), projection);
		}

		//from3DRepoStash = true;
		obj.toObject = () => obj;

		return Promise.resolve(obj);

	}).then(obj =>{

		if(!obj){
			return Promise.reject({resCode: responseCodes.OBJECT_NOT_FOUND});
		}
		// load extRef if _.extRef is defined
		if(obj.type === 'mesh' && obj._extRef){

			let promises = [];

			obj = obj.toObject();

			Object.keys(obj._extRef).forEach(type => {
				let filename = obj._extRef[type];
				promises.push(
					this.findStashByFilename(dbCol, '3drepo', filename).then(data => {
						obj[type] = { buffer: data };
					})
				);
			});

			return Promise.all(promises).then( () => {
				return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj]));
			});

		} else {
			return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj.toObject()]));
		}
	});

	return _find();

	// if(options && options.stash){
	// 	//find obj from stash
	// 	return this.findStashByFilename(dbCol, options.stash.format, options.stash.filename).then(buffer => {
	// 		if(!buffer){
	// 			return _find();
	// 		} else {
	// 			return Promise.resolve(buffer);
	// 		}
	// 	});

	// } else {
	//	return _find();
	//}

};

methods.clean = function(){
	'use strict';

	let cleaned = this.toObject();
	cleaned._id = uuidToString(cleaned._id);
	cleaned.shared_id = uuidToString(cleaned.shared_id);
	cleaned.parents.forEach((parent, i) => {
		cleaned.parents[i] = uuidToString(parent);
	});

	return cleaned;
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

			// load extRef if _.extRef is defined
			if(obj.type === 'mesh' && obj._extRef){

				let promises = [];

				obj = obj.toObject();

				Object.keys(obj._extRef).forEach(type => {
					let filename = obj._extRef[type];
					promises.push(
						this.findStashByFilename(dbCol, '3drepo', filename).then(data => {
							obj[type] = { buffer: data };
						})
					);
				});

				return Promise.all(promises).then( () => {
					return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj]));
				});

			} else {
				return Promise.resolve(repoGraphScene(dbCol.logger).decode([obj.toObject()]));
			}
		});
	});

	return _find();

	// if(options && options.stash){
	// 	//find obj from stash
	// 	return this.findStashByFilename(dbCol, options.stash.format, options.stash.filename).then(buffer => {
	// 		if(!buffer){
	// 			return _find();
	// 		} else {
	// 			return Promise.resolve(buffer);
	// 		}
	// 	});

	// } else {
	// 	return _find();
	// }
};

// genericObject for anything in .scene
var Schema = mongoose.Schema;

var genericObjectSchema = Schema(
	_.extend({}, attrs)
);

_.extend(genericObjectSchema.statics, statics);
_.extend(genericObjectSchema.methods, methods);

var GenericObject = ModelFactory.createClass(
	'GenericObject', 
	genericObjectSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);

module.exports = {attrs, statics, methods, GenericObject};
