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


var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var C = require('../constants.js');
var GridFSBucket = require('mongodb').GridFSBucket;
var ObjectID  = require('mongodb').ObjectID;
var responseCodes = require('../response_codes');
var DB = require('../db/db');


var schema = mongoose.Schema({
	name: { type: String, required: true },
	site: { type: String, required: true },
	code: String,
	contact: String,
	area: String,
	budget: Number,
	completedBy: Date,
	user: String,
	attachments: [mongoose.Schema.Types.ObjectId],
	// termsAndConds: [mongoose.Schema({
	// 	title: String,
	// 	content: String,
	// })]
});

var _ = require('lodash');

schema.plugin(require('mongoose-timestamp'));

schema.pre('save', function(next){
	'use strict';

	ProjectPackage.count(this._dbcolOptions, {name: this.name, _id: {'$ne': this._id}}).then(count => {
		if(count > 0) {

			let err = new Error('This package name has been taken');
			err.name = 'ValidationError';
			next(err);
		} else {
			next();
		}
	});
});

schema.post('save', function(doc){
	'use strict';

	// add to customData.bids for quick lookup
	DB({}).dbCallback("admin", function(err, db) {
		// let database = 'admin';
		// let collection = 'system.users';
		let bid = {
			role: C.REPO_ROLE_MAINCONTRACTOR,
			account: doc._dbcolOptions.account,
			project : doc._dbcolOptions.project,
			package: doc.name,
		};

		// console.log('post save')
		// db.db(database)
		// .collection(collection)
		// .findOneAndUpdate({
		// 	user: doc.user
		// },{'$addToSet':{
		// 	'customData.bids': bid
		// }}).then().catch(err => { console.log(err)});
		db.collection('system.users').findOne({ user: doc.user}).then(user => {

			let customData = {};

			if (user.customData){
				customData = user.customData;
			}

			if (customData && customData.bids && _.findIndex(customData.bids, bid) === -1){
				customData.bids.push(bid);
			} else if (!customData) {
				customData = {
					bids: [bid]
				};
			} else if (!customData.bids){
				customData.bids = [bid];
			}

			var updateUserCmd = {
				updateUser: doc.user,
				customData: customData
			};

			return db.command(updateUserCmd);

		}).catch(err => {
			console.log(err);
		});
	});


});

var defaultProjection = { __v: 0 };

schema.statics.defaultProjection = defaultProjection;


// Model statics method
schema.statics.findByName = function(dbColOptions, name){
	return ProjectPackage.findOne(dbColOptions, {name}, defaultProjection);
};



var collectionName = arg => {
	return `${arg.project}.packages`;
};

schema.methods._getGridFSBucket = function(){
	return new GridFSBucket(
		ModelFactory.db.db(this._dbcolOptions.account),
		{ bucketName:  collectionName(this._dbcolOptions) + '.attachments'}
	);
};

schema.methods.getAttachmentMeta = function(){
	'use strict';

	let bucket =  this._getGridFSBucket();
	return bucket.find({ _id: { '$in': this.attachments }}).toArray();
};

schema.methods._deleteAtth = function(id){
	'use strict';

	let bucket =  this._getGridFSBucket();

	this.attachments.pull(id);
	return bucket.delete(id);

};

schema.methods.deleteAttachment = function(ids, options){
	'use strict';

	options = options || {};
	let promiseList = [];

	if(Array.isArray(ids)){
		ids.forEach(id => {
			promiseList.push(this._deleteAtth(new ObjectID(id)));
		});
	} else {
		let id = ids;
		promiseList.push(this._deleteAtth(new ObjectID(id)));
	}

	return Promise.all(promiseList).then(() => {
		if(!options.skipSave){
			return this.save();
		} else {
			return Promise.resolve();
		}
	});

};

schema.methods.getAttachmentReadStream = function(id){
	'use strict';

	id = new ObjectID(id);

	let bucket =  this._getGridFSBucket();
	//check existence and get metadata
	return bucket.find({ _id: id}).toArray().then(files => {
		if(files.length <= 0 ){
			return Promise.reject({ resCode: responseCodes.ATTACHMENT_NOT_FOUND});
		} else {
			return Promise.resolve({
				readStream: bucket.openDownloadStream(id),
				meta: files[0]
			});
		}
	});

};

schema.methods.uploadAttachment = function(readStream, meta){
	'use strict';

	let bucket =  this._getGridFSBucket();

	let uploadStream = bucket.openUploadStream(meta.filename, meta);

	let fileMeta, files;

	readStream.pipe(uploadStream);

	//check dup name and remove the old file id in attachments array
	return bucket.find({filename: meta.filename}).toArray()
	.then(_files => {

		files = _files;

		//upload new file
		return new Promise((resolve, reject) => {
			uploadStream.once('finish', function(fileMeta) {
				resolve(fileMeta);
			});

			uploadStream.once('error', function(err) {
				reject(err);
			});
		});

	}).then(_fileMeta => {

		fileMeta = _fileMeta;
		//delete all attachments with the same filename
		return this.deleteAttachment(_.map(files, '_id'), { skipSave: true });

	}).then(() => {
		// push new file id into array
		this.attachments.push(uploadStream.id);
		return this.save().then(() => {
			return Promise.resolve(fileMeta);
		});
	});
};

schema.methods.getTermsAndCondsHTML = function(){
	'use strict';

	let rowTemplate = require('./templates/html/termsAndConds');
	let html = "";

	this.termsAndConds.forEach(row => {
		html += rowTemplate(row);
	});

	return html;
};

var ProjectPackage = ModelFactory.createClass(
	'Package',
	schema,
	collectionName
);

module.exports = ProjectPackage;
