
var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');
var Schema = mongoose.Schema;
var ProjectSetting = require('./projectSetting');
var utils = require('../utils');
var stringToUUID = utils.stringToUUID;
var uuidToString = utils.uuidToString;
var dbInterface = require('../db/db_interface');
var schema = Schema({
	_id: Buffer,
	name: { type: String, required: true },
	viewpoint: {
		up: [Number],
		position: [Number],
		look_at: [Number],
		view_dir: [Number],
		right: [Number],
		unityHeight : Number,
		fov : Number,
		aspect_ratio: Number,
		far : Number,
		near : Number,
		clippingPlanes : [Schema.Types.Mixed ]

	},

	scale: Number,
	position: [Number],
	norm: [Number],
	created: Number,
	parent: Buffer,
	number: Number,
	owner: String,
	comments: [{
		owner: String,
		comment: String,
		created: Number,
		//TO-DO Error: `set` may not be used as a schema pathname
		//set: Boolean
	}],
	assigned_roles: [Schema.Types.Mixed]
});

// Model statics method
//internal helper _find
schema.statics._find = function(dbColOptions, filter, projection){
	'use strict';
	//get project type
	let settings;
	let issues;

	return ProjectSetting.findById(dbColOptions, dbColOptions.project).then(_settings => {
		settings = _settings;
		return this.find(dbColOptions, filter, projection);	
	}).then(_issues => {

		issues = _issues;
		issues.forEach((issue, index) => {
			issues[index] = issue.clean(settings.type);
		});

		return Promise.resolve(issues);
	});
};

schema.statics.findByProjectName = function(dbColOptions, branch, rev){
	'use strict';
	let issues;
	let self = this;

	return this._find(dbColOptions, {}).then(_issues => {
		issues = _issues;
		return dbInterface(dbColOptions.logger).getFederatedProjectList(
			dbColOptions.account,
			dbColOptions.project,
			branch,
			rev
		);
		
	}).then(refs => {
		//console.log(refs);
		if(!refs.length){
			return Promise.resolve(issues);
		} else {
			
			let promises = [];
			refs.forEach(ref => {
				let childDbName = ref.owner || dbColOptions.account;
				let childProject = ref.project;

				promises.push(self._find({account: childDbName, project: childProject}));
			});

			return Promise.all(promises).then(refIssues => {
				refIssues.forEach(refIssue => {
					issues.push(refIssue);
				});
			});
		}
	});

};

schema.statics.findBySharedId = function(dbColOptions, sid, number) {
	'use strict';

	let filter = { parent: stringToUUID(sid),	};

	if(number){
		filter.number = number;
	}

	//console.log(filter);

	return this._find(dbColOptions, filter);
};

schema.statics.findByUID = function(dbColOptions, uid, onlyStubs){
	'use strict';

	let projection = {};

	if (onlyStubs){
		projection = {
			_id : 1,
			name : 1,
			deadline : 1,
			position: 1,
			parent: 1
		};
	}

	return this.findById(dbColOptions, stringToUUID(uid)).then(issue => {
		return Promise.resolve(issue.clean());
	});
};

//Model method
schema.methods.clean = function(typePrefix){
	'use strict';

	let cleaned = this.toObject();
	cleaned._id = uuidToString(cleaned._id);
	cleaned.typePrefix = typePrefix;
	cleaned.parent = cleaned.parent ? uuidToString(cleaned.parent) : undefined;
	cleaned.account = this._dbcolOptions.account;
	cleaned.project = this._dbcolOptions.project;

	return cleaned;
};


var Issue = ModelFactory.createClass(
	'Issue', 
	schema, 
	arg => { 
		return `${arg.project}.issues`;
	}
);

module.exports = Issue;