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
var Schema = mongoose.Schema;
var ProjectSetting = require('./projectSetting');
var utils = require('../utils');
var stringToUUID = utils.stringToUUID;
var uuidToString = utils.uuidToString;
var History = require('./history');
var Ref = require('./ref');

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

schema.statics.getFederatedProjectList = function(dbColOptions, branch, revision){
	'use strict';

	var allRefs = [];

	function _get(dbColOptions, branch, revision){

		let getHistory;


		if(branch) {
			getHistory = History.findByBranch(dbColOptions, branch);
		} else if (revision) {
			getHistory = History.findByUID(dbColOptions, revision);
		}

		return getHistory.then(history => {

			let filter = {
				type: "ref",
				_id: { $in: history.current }
			};


			return Ref.find(dbColOptions, filter);
		}).then(refs => {



			var promises = [];

			refs.forEach(ref => {
				var childDbName  = ref.owner ? ref.owner : dbColOptions.account;
				var childProject = ref.project;

				var unique = ref.unique;

				var childRevision, childBranch;
				if (ref._rid){
					if (unique){
						childRevision = uuidToString(ref._rid);
					} else {
						childBranch   = uuidToString(ref._rid);
					}
				} else {
					childBranch   = "master";
				}

				let dbCol = {
					account: childDbName,
					project: childProject
				};

				promises.push(_get(dbCol, childBranch, childRevision));

			});

			//console.log('some refs', refs)
			allRefs = allRefs.concat(refs);

			return Promise.all(promises);

		});
	}

	return _get(dbColOptions, branch, revision).then(() => {
		//console.log('finial allRefs', allRefs);
		return Promise.resolve(allRefs);
	});

};

schema.statics.findByProjectName = function(dbColOptions, branch, rev){
	'use strict';
	let issues;
	let self = this;

	return this._find(dbColOptions, {}).then(_issues => {
		issues = _issues;
		return self.getFederatedProjectList(
			dbColOptions,
			branch,
			rev
		);

	}).then(refs => {

		if(!refs.length){
			return Promise.resolve(issues);
		} else {

			//console.log('refs', refs.length);
			let promises = [];
			refs.forEach(ref => {
				let childDbName = ref.owner || dbColOptions.account;
				let childProject = ref.project;

				promises.push(self._find({account: childDbName, project: childProject}));
			});

			return Promise.all(promises).then(refIssues => {
				refIssues.forEach(refIssue => {
					issues = issues.concat(refIssue);
				});

				return Promise.resolve(issues);
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
