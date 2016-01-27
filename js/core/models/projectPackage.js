var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var C = require('../constants.js');
var GridFSBucket = require('mongodb').GridFSBucket;
var ObjectID  = require('mongodb').ObjectID;
var responseCodes = require('../response_codes');
var schema = mongoose.Schema({
	name: { type: String, required: true },
	site: { type: String, required: true },
	code: String,
	contact: String,
	area: String,
	budget: Number, 
	completedBy: Date,
	user: String,
	attachments: [mongoose.Schema.Types.ObjectId]
});

schema.plugin(require('mongoose-timestamp'), {
  createdAt: 'createdOn',
  updatedAt: 'updatedOn'
});

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

	let db = ModelFactory.db;
	let database = 'admin';
	let collection = 'system.users';
	let bid = {
		role: C.REPO_ROLE_MAINCONTRACTOR,
		account: doc._dbcolOptions.account,
		project : doc._dbcolOptions.project,
		package: doc.name,
	};

	db.db(database)
	.collection(collection)
	.findOneAndUpdate({ 
		user: doc.user 
	},{'$addToSet':{ 
		'customData.bids': bid
	}});

});

var defaultProjection = { __v: 0, user: 0};

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
}

schema.methods.getAttachmentMeta = function(){
	'use strict';

	let bucket =  this._getGridFSBucket();
	return bucket.find({ _id: { '$in': this.attachments }}).toArray();
}

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
	})

}

schema.methods.uploadAttachment = function(readStream, meta){
	'use strict';

	let bucket =  this._getGridFSBucket();
	
	let uploadStream = bucket.openUploadStream(meta.filename, meta);

	readStream.pipe(uploadStream);

	//check dup name and remove the old file id in attachments array
	return bucket.find({filename: meta.filename}).toArray().then(files => {
		files.forEach(fileMeta => {
			this.attachments.pull(fileMeta._id);
		});

		return new Promise((resolve, reject) => {
			uploadStream.once('finish', function(fileMeta) {
				resolve(fileMeta);
			});

			uploadStream.once('error', function(err) {
				reject(err);
			});
		});

	}).then(fileMeta => {
		//update the model's attachments array
		this.attachments.push(uploadStream.id);
		return this.save().then(() => {
			return Promise.resolve(fileMeta);
		});
	});
}


var ProjectPackage = ModelFactory.createClass(
	'Package', 
	schema, 
	collectionName
);

module.exports = ProjectPackage;
