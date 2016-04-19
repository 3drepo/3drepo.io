var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var ProjectPackage = require('./projectPackage');
var responseCodes = require('../response_codes');
var C = require('../constants.js');
var termsAndCondsSchema = require('./sharedSchemas/termsAndConds');
var DB = require('../db/db');
var _ = require('lodash');

var schema = mongoose.Schema({
	user: { type: String, required: true },
	budget: String,
	accepted: { type: Boolean, default: null },
	acceptedAt: Date,
	awarded: { type: Boolean, default: null },
	awardedAt: Date,
	invitedAt: Date,
	submitted: { type: Boolean, default: false },
	submittedAt: Date,
	packageName: { type: String, required: true },
	termsAndConds: termsAndCondsSchema
});

//status = invited,accepted,declined,submitted,awarded,rejected
schema.virtual('status').get(function () {
	if(this.awarded === true){
		return 'awarded';
	} else if (this.awarded === false) {
		return 'rejected';
	} else if (this.submitted) {
		return 'submitted';
	} else if (this.accepted === false) {
		return 'declined';
	} else if (this.accepted === true) {
		return 'accepted';
	} else {
		return 'invited';
	}
});

schema.plugin(require('mongoose-timestamp'));

var defaultProjection = { 'termsAndConds': 0 };

schema.pre('save', function(next){
	'use strict';

	if(this.isNew){
		this.wasNew = this.isNew;
		this.invitedAt = new Date();
		return ProjectPackage.count(this._dbcolOptions, {name: this.packageName}).then(count => {
			if(count <= 0) {
				let err = new Error('Package not found');
				err.name = 'ValidationError';

				next(err);
			} else {

				next();
			}
		});
	} else {
		next();
	}


});

schema.post('save', function(doc){
	'use strict';

	if(doc.wasNew){

		Bid.getWorkspaceCollection(doc.user, doc._dbcolOptions.account, doc._dbcolOptions.project).insertOne(doc.toObject());

		// add to customData.bids for quick lookup
		// let db = ModelFactory.db;
		// let database = 'admin';
		// let collection = 'system.users';
		// let bid = {
		// 	role: C.REPO_ROLE_SUBCONTRACTOR,
		// 	account: doc._dbcolOptions.account,
		// 	project : doc._dbcolOptions.project,
		// 	package: doc.packageName,
		// };

		// db.db(database)
		// .collection(collection)
		// .findOneAndUpdate({
		// 	user: doc.user
		// },{'$addToSet':{
		// 	'customData.bids': bid
		// }});

		DB({}).dbCallback("admin", function(err, db) {
			// let database = 'admin';
			// let collection = 'system.users';
			let bid = {
				role: C.REPO_ROLE_SUBCONTRACTOR,
				account: doc._dbcolOptions.account,
				project : doc._dbcolOptions.project,
				package: doc.packageName,
			};

			console.log('bid', bid);

			db.collection('system.users').findOne({ user: doc.user}).then(user => {
				console.log('user found', user.customData);

				console.log('find bid', _.findIndex(user.customData.bids, bid));
				if (user.customData && user.customData.bids && _.findIndex(user.customData.bids, bid) === -1){

					console.log('push bid');
					user.customData.bids.push(bid);

				} else if (!user.customData) {

					user.customData = {
						bids: [bid]
					};

				} else if (!user.customData.bids){
					user.customData.bids = [bid];
				}

				console.log('new custom data', user.customData);

				var updateUserCmd = {
					updateUser: doc.user,
					customData: user.customData
				};

				return db.command(updateUserCmd);

			}).catch(err => {
				console.log(err);
			});
		});


	}
});

var collectionNames = {
	'packageSpace': project => `${project}.bids`,
	'workspace': (packageAccount, project) => `${packageAccount}.${project}.mybid`,
};
// Model statics method
schema.statics.findByPackage = function(dbColOptions, packageName, projection){
	return Bid.find(dbColOptions, {packageName}, projection || defaultProjection);
};

schema.statics.findByUser = function(dbColOptions, user, packageName, projection){
	console.log('packageName', packageName);
	return Bid.findOne(dbColOptions, {user, packageName}, projection || defaultProjection);
};

schema.statics.getWorkspaceCollection = function(userAccount, packageAccount, project){
	return ModelFactory.db.db(userAccount).collection(collectionNames.workspace(packageAccount, project));
};

schema.statics.getPackageSpaceCollection  = function(account, project){
	return ModelFactory.db.db(account).collection(collectionNames.packageSpace(project));
};

schema.methods.responded = function(){
	return this.accepted !== null || this.awarded !== null;
};

schema.methods.updateable = function(){

	if(typeof this.accepted === 'undefined' ||
		typeof this.submitted === 'undefined' ||
		typeof this.awarded === 'undefined'){
		throw new Error('To use updateable method you must project on accepted, submitted and awarded fields');
	}

	return this.accepted && !this.submitted && this.awarded === null;
};

schema.methods.respond = function(accept){
	'use strict';

	let bid;

	if(this.responded()) {
		return Promise.reject({ resCode: responseCodes.BID_ALREADY_ACCEPTED_OR_DECLINED });
	}

	if (typeof accept !== 'boolean'){
		return Promise.reject({
			resCode: responseCodes.MONGOOSE_VALIDATION_ERROR({ message: 'accept must be true or false'})
		});
	}

	this.accepted = accept;
	this.acceptedAt = new Date();

	return this.save().then(_bid => {
		bid = _bid;

		// save the response to package bid space as well
		return Bid.getPackageSpaceCollection(bid._dbcolOptions.packageAccount, bid._dbcolOptions.project)
		.updateOne({
			_id: bid._id,
		}, bid.toObject()).catch(err => {
			console.log(err);
		});

	}).then(() => {
		return Promise.resolve(bid);
	});

};

schema.methods.submit = function() {
	'use strict';

	let bid;

	if(this.submitted) {
		return Promise.reject({ resCode: responseCodes.BID_SUBMIITED });
	}

	if(!this.updateable()){
		return Promise.reject({ resCode: responseCodes.BID_NOT_UPDATEABLE });
	}

	this.submitted = true;
	this.submittedAt = new Date();

	return this.save().then(_bid => {
		bid = _bid;
		// save the response to package bid space as well
		return Bid.getPackageSpaceCollection(bid._dbcolOptions.packageAccount, bid._dbcolOptions.project)
		.updateOne({
			_id: bid._id,
		}, bid.toObject());

	}).then(() => {
		return Promise.resolve(bid);
	});
};

schema.methods.award = function(){
	'use strict';

	let bid = this;

	return Bid.count(this._dbcolOptions, { packageName: this.packageName, awarded: true }).then(count => {
		if (count > 0){
			return Promise.reject({ resCode: responseCodes.PACKAGE_AWARDED});
		} else if (!this.accepted) {
			return Promise.reject({ resCode: responseCodes.BID_NOT_ACCEPTED_OR_DECLINED});
		} else if (!this.submitted){
			return Promise.reject({ resCode: responseCodes.BID_NOT_SUBMIITED });
		} else {

			this.awarded = true;
			this.awardedAt = new Date();

			return this.save();
		}
	}).then(() => {

		return Bid.findByPackage(bid._dbcolOptions, bid.packageName, {user: 1});

	}).then(bids => {

		var promises = [];
		var now = new Date();


		promises.push(

			// mark other bids awarded: false (package)
			// unfortunately mongoose.update don't return promise so wrap it in promise
			new Promise((resolve, reject) => {

				Bid.update(this._dbcolOptions, {
					packageName: this.packageName,
					awarded: null
				}, {
					awarded: false,
					awardedAt: now,
					updatedAt: now,
				}, { multi: true }, function(err) {
					if (err){
						reject(err);
					} else {
						resolve(bid);
					}
				});
			})

		);

		let o = bid._dbcolOptions;

		// mark other bids awarded: false or true (in their workspace)
		bids.forEach(item => {

			let updatedDoc = {
				updatedAt: now,
				awardedAt: now
			};

			if(item.user === bid.user){
				updatedDoc.awarded = true;
			} else {
				updatedDoc.awarded = false;
			}

			promises.push(

				Bid.getWorkspaceCollection(item.user, o.account, o.project).updateOne({
					_id: item._id,
				}, {
					'$set': updatedDoc
				})
			);
		});

		return Promise.all(promises).then(res => {
			//only return the awarded bid object
			return Promise.resolve(res[0]);
		});

	});
};

var Bid = ModelFactory.createClass(
	'Bid',
	schema,
	arg => {
		if(arg.workspace){
			return collectionNames.workspace(arg.packageAccount, arg.project);
		} else {
			return collectionNames.packageSpace(arg.project);
		}
	}
);

module.exports = Bid;

