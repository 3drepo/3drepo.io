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
var GenericObject = require('./base/repo').GenericObject;
var uuid = require("node-uuid");
var responseCodes = require('../response_codes.js');
var middlewares = require('../routes/middlewares');
// var xmlBuilder = require('xmlbuilder');
var moment = require('moment');
var archiver = require('archiver');
var yauzl = require("yauzl");
var xml2js = require('xml2js');
var _ = require('lodash');
var gd = require('node-gd');
var systemLogger = require("../logger.js").systemLogger;
var Group = require('./group');

var xmlBuilder = new xml2js.Builder({
	explicitRoot: false,
	xmldec: {
		version: '1.0',
		encoding: 'UTF-8',
		standalone: false
	},
	explicitCharkey: true,
	attrkey: '@'
});

var schema = Schema({
	_id: Object,
	object_id: Object,
	rev_id: Object,
	name: { type: String, required: true },
	topic_type: String,
	status: {
        type: String,
        //enum: ['open', 'in progress', 'closed']
	},


	// TO-DO: remove this after db migration => viewpoints[0]=viewpoint
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
		clippingPlanes : [Schema.Types.Mixed ],
		guid: Object
	},

	viewpoints: [{
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
		clippingPlanes : [Schema.Types.Mixed ],
		screenshot: {
			flag: Number, 
			content: Object,
			resizedContent: Object
		},
		guid: Object,
		extras: {},
		scribble: {flag: Number, content: Object},
	}],

	group_id: Object,
	scale: Number,
	position: [Number],
	norm: [Number],
	created: Number,
	parent: Object,
	number: Number,
	owner: String,
	closed: Boolean,
	desc: String,
	thumbnail: {flag: Number, content: Object},
	priority: {
		type: String,
		//enum: ['low', 'medium', 'high', 'critical']
	},
	comments: [{
		owner: String,
		comment: {type: String, required: true},
		created: Number,
		//TO-DO Error: `set` may not be used as a schema pathname
		//set: Boolean
		sealed: Boolean,
		rev_id: Object,
		guid: Object,
		viewpoint: Object, //guid backref to viewpoints
		//bcf extra fields we don't care
		extras: {}
	}],
	assigned_roles: [Schema.Types.Mixed],
	closed_time: Number,
	status_last_changed: Number,
	priority_last_changed: Number,
	creator_role: String,

	//to be remove
	scribble: Object,
	
	//bcf extra fields we don't care
	extras: {}
});


function parseXmlString(xml, options){
	
	return new Promise((resolve, reject) => {
		xml2js.parseString(xml, options, function (err, xml) {
			if(err){
				reject(err);
			} else {
				resolve(xml);
			}
		});
	});

}
// Model statics method
//internal helper _find

var statusEnum = ['open', 'in progress', 'closed'];
var priorityEnum = ['none', 'low', 'medium', 'high'];

schema.statics.statusEnum = statusEnum;
schema.statics.priorityEnum = priorityEnum;

schema.statics._find = function(dbColOptions, filter, projection, noClean){
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
			issues[index] = noClean ? issue: issue.clean(settings.type);
		});

		return Promise.resolve(issues);
	});
};

schema.statics.getFederatedProjectList = function(dbColOptions, username, branch, revision){
	'use strict';

	var allRefs = [];

	function _get(dbColOptions, branch, revision){

		let getHistory;

		if(branch){
			getHistory = History.findByBranch(dbColOptions, branch);
		} else if (revision) {
			getHistory = utils.isUUID(revision) ? History.findByUID(dbColOptions, revision) : History.findByTag(dbColOptions, revision);
		}

		return getHistory.then(history => {


			if(!history){
				return Promise.resolve([]);
			}

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
		return Promise.resolve(allRefs);
	});

};


schema.statics.findByProjectName = function(dbColOptions, username, branch, revId, projection, noClean){

	'use strict';
	let issues;
	let self = this;
	let filter = {};

	let addRevFilter = Promise.resolve();

	if (revId){

		let findHistory = utils.isUUID(revId) ? History.findByUID : History.findByTag;
		let currHistory;
		addRevFilter = findHistory(dbColOptions, revId).then(history => {

			if(!history){
				return Promise.reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			} else {

				currHistory = history;

				return History.find(
					dbColOptions, 
					{ timestamp: {'$gt': currHistory.timestamp }}, 
					{_id : 1, timestamp: 1}, 
					{sort: {timestamp: 1}}
				);

			}

		}).then(histories => {

			if(histories.length > 0){

				let history = histories[0];
				//console.log('next history found', history);

				//backward comp: find all issues, without rev_id field, with timestamp just less than the next cloest revision 
				filter = {
					'created' : { '$lt': history.timestamp.valueOf() },
					rev_id: null 
				};
			}

			return History.find(
				dbColOptions, 
				{ timestamp: {'$lte': currHistory.timestamp }}, 
				{_id : 1}
			);
		}).then(histories => {

			if(histories.length > 0){
				// for issues with rev_id, get all issues if rev_id in revIds
				let revIds = histories.map(h => h._id);

				filter = {
					'$or' : [ filter, {
						rev_id: { '$in' : revIds }
					}]
				};
				//console.log(filter);

			}
		});
	}


	return addRevFilter.then(() => {
		return this._find(dbColOptions, filter, projection, noClean);
	}).then(_issues => {
		issues = _issues;
		return self.getFederatedProjectList(
			dbColOptions,
			username,
			branch,
			revId
		);

	}).then(refs => {

		if(!refs.length){
			return Promise.resolve(issues);
		} else {

			let promises = [];
			refs.forEach(ref => {
				let childDbName = ref.owner || dbColOptions.account;
				let childProject = ref.project;

				promises.push(
					middlewares.hasReadAccessToProjectHelper(username, childDbName, childProject).then(granted => {
						if(granted){
							return self._find({account: childDbName, project: childProject}, null, projection, noClean);
						} else {
							return Promise.resolve([]);
						}
					})
				);
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

schema.statics.getBCFZipReadStream = function(account, project, username, branch, revId){
	'use strict';

	var zip = archiver.create('zip');

	zip.append(new Buffer(this.getProjectBCF(project), 'utf8'), {name: 'project.bcf'})
	.append(new Buffer(this.getBCFVersion(), 'utf8'), {name: 'bcf.version'});

	let projection = {};
	let noClean = true;

	return this.findByProjectName({account, project}, username, branch, revId, projection, noClean).then(issues => {

		issues.forEach(issue => {

			let bcf = issue.getBCFMarkup();

			zip.append(new Buffer(bcf.markup, 'utf8'), {name: `${uuidToString(issue._id)}/markup.bcf`});

			bcf.viewpoints.forEach(vp => {
				zip.append(new Buffer(vp.xml, 'utf8'), {name: `${uuidToString(issue._id)}/${vp.filename}`});
			});

			bcf.snapshots.forEach(snapshot => {
				zip.append(snapshot.snapshot.buffer, {name: `${uuidToString(issue._id)}/${snapshot.filename}`});
			});

		});

		zip.finalize();

		return Promise.resolve(zip);
	});

};

schema.statics.findBySharedId = function(dbColOptions, sid, number) {
	'use strict';

	let filter = { parent: stringToUUID(sid) };

	if(number){
		filter.number = number;
	}

	return this._find(dbColOptions, filter).then(issues => {
		issues.forEach((issue, i) => {
			if(issue.scribble){
				issues[i] = issue.scribble.toString('base64');
			}
		});

		return Promise.resolve(issues);
	});
};

schema.statics.findByUID = function(dbColOptions, uid, onlyStubs, noClean){
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
		return Promise.resolve(noClean ? issue : issue.clean());
	});
};

schema.statics.createIssue = function(dbColOptions, data){
	'use strict';

	let objectId = data.object_id;

	let promises = [];

	let issue = Issue.createInstance(dbColOptions);
 	issue._id = stringToUUID(uuid.v1());

 	let checkGroup = function(group_id){
		return Group.findByUID(dbColOptions, group_id).then(group => {
			if(!group){
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			} else {
				return Promise.resolve(group);
			}
		});
 	};

 	if(!data.name){
 		return Promise.reject({ resCode: responseCodes.ISSUE_NO_NAME });
 	}

	if(objectId){
		promises.push(
			GenericObject.getSharedId(dbColOptions, objectId).then(sid => {
				issue.parent = stringToUUID(sid);
			})
		);
	}

	let getHistory;

	if(data.revId){
		getHistory = utils.isUUID(data.revId) ? History.findByUID : History.findByTag;
		getHistory = getHistory(dbColOptions, data.revId, {_id: 1});
	} else {
		getHistory = History.findByBranch(dbColOptions, 'master', {_id: 1});
	}

	//assign rev_id for issue
	promises.push(getHistory.then(history => {
		if(!history && data.revId){
			return Promise.reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		} else if (history){
			issue.rev_id = history._id;
		}
	}));

	let group;

	return Promise.all(promises).then(() => {

		if(data.group_id){
			return checkGroup(data.group_id);
		} else {
			return Promise.resolve();
		}
		
	}).then(_group => {

		if(_group){
			group = _group;
		}

		return Issue.count(dbColOptions);
		
	}).then(count => {

		if(statusEnum.indexOf(data.status) === -1){
			return Promise.reject(responseCodes.ISSUE_INVALID_STATUS);
		}

		if(priorityEnum.indexOf(data.priority) === -1){
			return Promise.reject(responseCodes.ISSUE_INVALID_PRIORITY);
		}

		issue.number  = count + 1;
		issue.object_id = objectId && stringToUUID(objectId);
		issue.name = data.name;
		issue.created = (new Date()).getTime();
		issue.owner = data.owner;
		issue.status = data.status;
		issue.topic_type = data.topic_type;
		issue.desc = data.desc;
		issue.priority = data.priority;
		issue.group_id = data.group_id && stringToUUID(data.group_id);
		//issue.scribble = data.scribble && new Buffer(data.scribble, 'base64');
		//issue.screenshot = data.screenshot && new Buffer(data.screenshot, 'base64');

		if(data.viewpoint){
			data.viewpoint.guid = utils.generateUUID();
			
			if(data.viewpoint.screenshot){

				data.viewpoint.screenshot = {
					content: new Buffer(data.viewpoint.screenshot, 'base64'),
					flag: 1
				};

				issue.thumbnail = {
					flag: 1,
					content: this.resizeAndCropScreenshot(data.viewpoint.screenshot.content, 120, 120, true)
				};
			}

			data.viewpoint.scribble && (data.viewpoint.scribble = {
				content: new Buffer(data.viewpoint.scribble, 'base64'),
				flag: 1
			});

			issue.viewpoints.push(data.viewpoint);
		}
		
		issue.scale = data.scale;
		issue.position = data.position;
		issue.norm = data.norm;
		issue.creator_role = data.creator_role;
		issue.assigned_roles = data.assigned_roles;

		return issue.save().then(() => {

			if(group){
				group.issue_id = issue._id;
				return group.save();
			} else {
				return Promise.resolve();
			}

		}).then(() => {
			return ProjectSetting.findById(dbColOptions, dbColOptions.project);
		}).then(settings => {
			return Promise.resolve(issue.clean(settings.type));
		});

	});

};

schema.statics.getScreenshot = function(dbColOptions, uid, vid){
	'use strict';
	

	return this.findById(dbColOptions, stringToUUID(uid), { 
		viewpoints: { $elemMatch: { guid: stringToUUID(vid) } },
		'viewpoints.screenshot.resizedContent': 0
	}).then(issue => {

		if(!_.get(issue, 'viewpoints[0].screenshot.content.buffer')){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return issue.viewpoints[0].screenshot.content.buffer;
		}
	});
};

schema.statics.getSmallScreenshot = function(dbColOptions, uid, vid){
	'use strict';

	return this.findById(dbColOptions, stringToUUID(uid), { 
		viewpoints: { $elemMatch: { guid: stringToUUID(vid) } }
	}).then(issue => {

		if (_.get(issue, 'viewpoints[0].screenshot.resizedContent.buffer')){

			return issue.viewpoints[0].screenshot.resizedContent.buffer;
		} else if(!_.get(issue, 'viewpoints[0].screenshot.content.buffer')){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			
			let resized = this.resizeAndCropScreenshot(issue.viewpoints[0].screenshot.content.buffer, 365);
		

			this.findOneAndUpdate(dbColOptions, 
				{ _id: stringToUUID(uid), 'viewpoints.guid': stringToUUID(vid)},
				{ '$set': { 'viewpoints.$.screenshot.resizedContent': resized } }
			).catch( err => {
				systemLogger.logError('error while saving resized screenshot',{
					issueId: uid,
					viewpointId: vid,
					err: err,
				});
			});

			return resized;
		}
	});
};

schema.statics.getThumbnail = function(dbColOptions, uid){
	'use strict';
	

	return this.findById(dbColOptions, stringToUUID(uid), { thumbnail: 1 }).then(issue => {

		if(!_.get(issue, 'thumbnail.content.buffer')){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return issue.thumbnail.content.buffer;
		}
	});
};

schema.statics.resizeAndCropScreenshot = function(pngBuffer, destWidth, destHeight, crop){
	'use strict';


	let img = gd.createFromPngPtr(pngBuffer);
	let sourceX, sourceY, sourceWidth, sourceHeight;

	console.log(destWidth, img.width);

	if(!img){

		return;

	} else if(img.width <= destWidth) {

		return pngBuffer;

	} else if (!crop){

		sourceX = 0;
		sourceY = 0;
		sourceWidth = img.width;
		sourceHeight = img.height;

	} else if(img.width > img.height){
		
		sourceY = 0;
		sourceHeight = img.height;
		sourceX = Math.round(img.width / 2 - img.height / 2);
		sourceWidth = sourceHeight;

	} else {

		sourceX = 0;
		sourceWidth = img.width;
		sourceY = (img.height / 2 - img.width / 2);
		sourceHeight = sourceWidth;
	}
	
	destHeight = destHeight || Math.floor(destWidth / img.width * img.height);

	let destImg  = gd.createTrueColorSync(destWidth, destHeight);
	img.copyResampled(destImg, 0, 0, sourceX, sourceY, destWidth, destHeight, sourceWidth, sourceHeight);

	return new Buffer(destImg.pngPtr(), 'binary');
	
};

schema.methods.updateAttr = function(attr, value){

	if(this.isClosed()){
		return Promise.reject(responseCodes.ISSUE_CLOSED_ALREADY);
	}

	this[attr] = value;
	return this.save();
};

schema.methods.updateComment = function(commentIndex, data){
	'use strict';

	let timeStamp = (new Date()).getTime();

	if(this.isClosed() || (this.comments[commentIndex] && this.comments[commentIndex].sealed)){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_SEALED });
	}

	if(commentIndex === null || typeof commentIndex === 'undefined'){

		let commentGuid = utils.generateUUID();
		let getHistory;

		if(data.revId){
			getHistory = utils.isUUID(data.revId) ? History.findByUID : History.findByTag;
			getHistory = getHistory(this._dbcolOptions, data.revId, {_id: 1});
		} else {
			getHistory = History.findByBranch(this._dbcolOptions, 'master', {_id: 1});
		}

		//assign rev_id for issue
		return getHistory.then(history => {
			if(!history && data.revId){
				return Promise.reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
			} else {

				data.viewpoint = data.viewpoint || {};
				data.viewpoint.guid = utils.generateUUID();

				data.viewpoint.screenshot && (data.viewpoint.screenshot = {
					content: new Buffer(data.viewpoint.screenshot, 'base64'),
					flag: 1
				});

				data.viewpoint.scribble && (data.viewpoint.scribble = {
					content: new Buffer(data.viewpoint.scribble, 'base64'),
					flag: 1
				});

				this.viewpoints.push(data.viewpoint);

				this.comments.push({ 
					owner: data.owner,
					comment: data.comment, 
					created: timeStamp,
					rev_id: history ? history._id : undefined,
					guid: commentGuid,
					viewpoint: data.viewpoint.guid
				});
			}
		}).then(() => {
			return this.save();
		}).then(issue => {
			issue = issue.clean();
			return issue.comments.find(c => c.guid === utils.uuidToString(commentGuid));
		});


	} else {

		let commentObj = this.comments[commentIndex];
		
		if(!commentObj){
			return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_INVALID_INDEX });
		}

		if(commentObj.owner !== data.owner && data.comment){
			return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_PERMISSION_DECLINED });
		}

		if(data.comment){
			commentObj.comment = data.comment;
			commentObj.created = timeStamp;
		}
		
		commentObj.sealed = data.sealed || commentObj.sealed;

		return this.save().then(issue => {
			issue = issue.clean();
			return issue.comments.find(c => c.guid === utils.uuidToString(commentObj.guid));
		});
	}

	
};

schema.methods.removeComment = function(commentIndex, data){
	'use strict';

	let commentObj = this.comments[commentIndex];
	
	if(!commentObj){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_INVALID_INDEX });
	}

	if(commentObj.owner !== data.owner){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_PERMISSION_DECLINED });
	}

	if(this.isClosed() || this.comments[commentIndex].sealed){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_SEALED });
	}

	this.comments[commentIndex].remove();
	return this.save();
};

schema.methods.isClosed = function(){
	return this.status === 'closed' || this.closed;
};

schema.methods.changeStatus = function(status){
	'use strict';

	if(status === this.status){
		return Promise.reject({ resCode: responseCodes.ISSUE_SAME_STATUS });
	} else if (statusEnum.indexOf(status) === -1){
		return Promise.reject({ resCode: responseCodes.ISSUE_INVALID_STATUS });
	}
		
	this.status_last_changed = (new Date()).getTime();
	this.status = status;
	return this.save();
};

schema.methods.changePriority = function(priority){
	'use strict';

	if(this.isClosed()){
		return Promise.reject(responseCodes.ISSUE_CLOSED_ALREADY);
	}

	if(priority === this.priority){
		return Promise.reject({ resCode: responseCodes.ISSUE_SAME_PRIORITY });
	} else if (priorityEnum.indexOf(priority) === -1){
		return Promise.reject({ resCode: responseCodes.ISSUE_INVALID_PRIORITY });
	}
	
	this.priority_last_changed = (new Date()).getTime();
	this.priority = priority;
	return this.save();

};

// schema.methods.closeIssue = function(){
// 	'use strict';

// 	if(this.closed){
// 		return Promise.reject({ resCode: responseCodes.ISSUE_CLOSED_ALREADY });
// 	}

// 	this.closed = true;
// 	this.closed_time = (new Date()).getTime();
// 	return this.save();
// };

// schema.methods.reopenIssue = function(){
// 	'use strict';

// 	this.closed = false;
// 	this.closed_time = null;
// 	return this.save();
// };


//Model method


schema.methods.clean = function(typePrefix){
	'use strict';

	let cleaned = this.toObject();
	cleaned._id = uuidToString(cleaned._id);
	cleaned.typePrefix = typePrefix;
	cleaned.parent = cleaned.parent ? uuidToString(cleaned.parent) : undefined;
	cleaned.account = this._dbcolOptions.account;
	cleaned.project = this._dbcolOptions.project;
	cleaned.rev_id && (cleaned.rev_id = uuidToString(cleaned.rev_id));
	cleaned.group_id = cleaned.group_id ? uuidToString(cleaned.group_id) : undefined;

	cleaned.viewpoints.forEach((vp, i) => {
		cleaned.viewpoints[i].guid = uuidToString(cleaned.viewpoints[i].guid);
		
		if(_.get(cleaned, `viewpoints[${i}].screenshot.flag`)){
			cleaned.viewpoints[i].screenshot = cleaned.account + '/' + cleaned.project +'/issues/' + cleaned._id + '/viewpoints/' + cleaned.viewpoints[i].guid + '/screenshot.png';
			cleaned.viewpoints[i].screenshotSmall = cleaned.account + '/' + cleaned.project +'/issues/' + cleaned._id + '/viewpoints/' + cleaned.viewpoints[i].guid + '/screenshotSmall.png';
		}
	});

	if(_.get(cleaned, `thumbnail.flag`)){
		cleaned.thumbnail = cleaned.account + '/' + cleaned.project +'/issues/' + cleaned._id + '/thumbnail.png';
	}

	cleaned.comments.forEach( (comment, i) => {
		cleaned.comments[i].rev_id = comment.rev_id && (comment.rev_id = uuidToString(comment.rev_id));
		cleaned.comments[i].guid && (cleaned.comments[i].guid = uuidToString(cleaned.comments[i].guid));

		if(cleaned.comments[i].viewpoint){
			cleaned.comments[i].viewpoint = cleaned.viewpoints.find(vp => vp.guid === uuidToString(cleaned.comments[i].viewpoint));
		} else {
			cleaned.comments[i].viewpoint = cleaned.viewpoint;
		}
		
	});

	if(cleaned.scribble){
		cleaned.scribble = cleaned.scribble.toString('base64');
	}

	if(cleaned.viewpoints.length > 0){
		cleaned.viewpoint = cleaned.viewpoints[0];
	}
	
	cleaned.viewpoints = undefined;

	return cleaned;
};

schema.methods.generateCommentsGUID = function(){
	'use strict';

	this.comments.forEach(comment => {
		if(!comment.guid){
			comment.guid = utils.generateUUID();
		}
		if(!comment.viewpoint){
			comment.viewpoint = this.viewpoint.guid;
		}
	});
};

schema.methods.generateViewpointGUID = function(){
	if(!this.viewpoint.guid){
		this.viewpoint.guid = utils.generateUUID();
	}
};

schema.methods.getBCFMarkup = function(){
	'use strict';

	this.generateViewpointGUID();
	this.generateCommentsGUID();
	this.save();
	
	let viewpointEntries = [];
	let snapshotEntries = [];

	let markup = {
		Markup:{
			'@' : {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema'
			},
			Header:{},
			Topic: {
				'@' : {
					'Guid': uuidToString(this._id),
					'TopicStatus': this.status ? this.status : (this.closed ? 'closed' : 'open')
				},
				'Priority': this.priority,
				'Title': this.name ,
				'CreationDate': moment(this.created).utc().format() ,
				'CreationAuthor': this.owner,
				'Description': this.desc
			},
			'Comment': [],
			'Viewpoints': [],
		}
	};

	this.topic_type && (markup.Markup.Topic['@'].TopicType = this.topic_type);

	markup.Markup.Header = _.get(this, 'extras.Header');
	markup.Markup.Topic.ReferenceLink = _.get(this, 'extras.ReferenceLink');
	markup.Markup.Topic.Index = _.get(this, 'extras.Index');
	markup.Markup.Topic.Labels = _.get(this, 'extras.Labels');
	markup.Markup.Topic.ModifiedDate = _.get(this, 'extras.ModifiedDate');
	markup.Markup.Topic.ModifiedAuthor = _.get(this, 'extras.ModifiedAuthor');
	markup.Markup.Topic.DueDate = _.get(this, 'extras.DueDate');
	markup.Markup.Topic.AssignedTo = _.get(this, 'extras.AssignedTo');
	markup.Markup.Topic.BimSnippet = _.get(this, 'extras.BimSnippet');
	markup.Markup.Topic.DocumentReference = _.get(this, 'extras.DocumentReference');
	markup.Markup.Topic.RelatedTopic = _.get(this, 'extras.RelatedTopic');
	
	//add comments
	this.comments.forEach(comment => {

		let commentXmlObj = {
			'@':{
				Guid: utils.uuidToString(comment.guid)
			},
			'Author': comment.owner,
			'Comment': comment.comment,
			'Viewpoint': utils.uuidToString(comment.viewpoint),
			'Date': moment(comment.created).utc().format()
		};

		commentXmlObj.ModifiedDate = _.get(comment, 'extras.ModifiedDate');
		commentXmlObj.ModifiedAuthor = _.get(comment, 'extras.ModifiedAuthor');

		markup.Markup.Comment.push(commentXmlObj);

	});


	// generate viewpoints
	if(this.comments.length > 0 && this.viewpoints.length > 0){

		let snapshotNo = 0;

		this.viewpoints.forEach((vp, index) => {

			let number = index === 0 ? '' : index;
			let viewpointFileName = `viewpoint${number}.bcfv`;
			let snapshotFileName = `snapshot${(snapshotNo === 0 ? '' : snapshotNo)}.png`;

			let vpObj = {
				'@': {
					'Guid': utils.uuidToString(vp.guid)
				},
				'Viewpoint': viewpointFileName,
				
			};

			if(vp.screenshot.flag){

				vpObj.Snapshot = snapshotFileName;
				snapshotEntries.push({
					filename: snapshotFileName,
					snapshot: vp.screenshot.content
				});
				snapshotNo++;

			}

			_.get(vp, 'extras.Index') && (vpObj.Index = vp.extras.Index);

			markup.Markup.Viewpoints.push(vpObj);
			
			let viewpointXmlObj = {
				VisualizationInfo:{
					'@':{
						'Guid': utils.uuidToString(vp.guid),
						'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
						'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
					},
					'PerspectiveCamera':{
						CameraViewPoint:{
							X: vp.look_at[0],
							Y: vp.look_at[1],
							Z: vp.look_at[2]
						},
						CameraDirection:{
							X: vp.view_dir[0],
							Y: vp.view_dir[1],
							Z: vp.view_dir[2]
						},
						CameraUpVector:{
							X: vp.up[0],
							Y: vp.up[1],
							Z: vp.up[2]
						},
						FieldOfView: vp.fov
					}
				}
			};

			viewpointXmlObj.VisualizationInfo.Components = _.get(vp, 'extras.Components');
			viewpointXmlObj.VisualizationInfo.Spaces = _.get(vp, 'extras.Spaces');
			viewpointXmlObj.VisualizationInfo.SpaceBoundaries = _.get(vp, 'extras.SpaceBoundaries');
			viewpointXmlObj.VisualizationInfo.Openings = _.get(vp, 'extras.Openings');
			viewpointXmlObj.VisualizationInfo.OrthogonalCamera = _.get(vp, 'extras.OrthogonalCamera');
			viewpointXmlObj.VisualizationInfo.Lines = _.get(vp, 'extras.Lines');
			viewpointXmlObj.VisualizationInfo.ClippingPlanes = _.get(vp, 'extras.ClippingPlanes');
			viewpointXmlObj.VisualizationInfo.Bitmap = _.get(vp, 'extras.Bitmap');

			viewpointEntries.push({
				filename: viewpointFileName,
				xml:  xmlBuilder.buildObject(viewpointXmlObj)
			});

		});

	} else if (this.comments.length > 0){
		//only add viewpoint node if there is at least one comment

		markup.Markup.Viewpoints.push({
			'@': { 'Guid': utils.uuidToString(this.viewpoint.guid) },
			'Viewpoint': 'viewpoint.bcfv'
		});

		viewpointEntries.push({
			filename: 'viewpoint.bcfv',
			xml:  xmlBuilder.buildObject({
				VisualizationInfo:{
					'@':{
						'Guid': utils.uuidToString(this.viewpoint.guid),
						'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
						'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
					},
					'PerspectiveCamera':{
						CameraViewPoint:{
							X: this.viewpoint.look_at[0],
							Y: this.viewpoint.look_at[1],
							Z: this.viewpoint.look_at[2]
						},
						CameraDirection:{
							X: this.viewpoint.view_dir[0],
							Y: this.viewpoint.view_dir[1],
							Z: this.viewpoint.view_dir[2]
						},
						CameraUpVector:{
							X: this.viewpoint.up[0],
							Y: this.viewpoint.up[1],
							Z: this.viewpoint.up[2]
						},
						FieldOfView: this.viewpoint.fov
					}
				}
			})
		});
	}

	return {
		markup: xmlBuilder.buildObject(markup),
		viewpoints: viewpointEntries,
		snapshots: snapshotEntries
	};
};

schema.statics.getBCFVersion = function(){
	'use strict';

	return `
		<?xml version="1.0" encoding="UTF-8"?>
		<Version VersionId="2.0" xsi:noNamespaceSchemaLocation="version.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<DetailedVersion>2.0 RC</DetailedVersion>
		</Version>
	`;

};

schema.statics.getProjectBCF = function(projectId){
	'use strict';

	let project = {
		ProjectExtension:{
			'@' : {
				'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema'
			},
			'Project': {
				'@': { 'ProjectId': projectId },
				'Name': projectId,
			},
			'ExtensionSchema': {

			}
		}
	};

	return xmlBuilder.buildObject(project);
};


schema.statics.importBCF = function(account, project, zipPath){
	'use strict';
	return new Promise((resolve, reject) => {

		let files = {};
		let promises = [];

		function handleZip(err, zipfile) {
			if(err){
				return reject(err);
			}

			zipfile.readEntry();

			zipfile.on('entry', entry => handleEntry(zipfile, entry));

			zipfile.on('end', () => {

				Promise.all(promises).then(() => {

					let createIssueProms = [];

					Object.keys(files).forEach(guid => {

						let promise = Issue.count({account, project}, { _id: utils.stringToUUID(guid)}).then(count => {
							if(count <= 0) {
								return createIssue(guid);
							} else {
								console.log('duplicate issue');
								return Promise.resolve();
							}
						});

						createIssueProms.push(promise);

					});

					return Promise.all(createIssueProms);

				}).then(() => {
					resolve();
				}).catch(err => {
					reject(err);
				});
			});

		}

		function parseViewpoints(issueGuid, issueFiles, vps){

			let viewpoints = {};
			let promises = [];

			vps && vps.forEach(vp => {

				if(!_.get(vp, '@.Guid')){
					return;
				}
				
				let vpFile = issueFiles[`${issueGuid}/${_.get(vp, 'Viewpoint[0]._')}`];

				viewpoints[vp['@'].Guid] = {
					snapshot: issueFiles[`${issueGuid}/${_.get(vp, 'Snapshot[0]._')}`],
				};

				vpFile && promises.push(parseXmlString(vpFile.toString('utf8'), {explicitCharkey: 1, attrkey: '@'}).then(xml => {
					viewpoints[vp['@'].Guid].viewpointXml = xml;
					viewpoints[vp['@'].Guid].Index = _.get(vp, 'Index');
					viewpoints[vp['@'].Guid].Viewpoint = _.get(vp, 'Viewpoint');
					viewpoints[vp['@'].Guid].Snapshot = _.get(vp, 'Snapshot');
				}));

			});
			
			return Promise.all(promises).then(() => viewpoints);
		}

		function createIssue(guid){

			let issueFiles = files[guid];
			let markupBuf = issueFiles[`${guid}/markup.bcf`];
			let xml;
			let issue;

			if(!markupBuf){
				return Promise.resolve();
			}

			return parseXmlString(markupBuf.toString('utf8'), {explicitCharkey: 1, attrkey: '@'}).then(_xml => {

				xml = _xml;

				issue = Issue.createInstance({account, project});
				issue._id = stringToUUID(guid);
				issue.extras = {};

				if(xml.Markup){
					
					issue.extras.Header = _.get(xml, 'Markup.Header');
					issue.topic_type = _.get(xml, 'Markup.Topic[0].@.TopicType');
					issue.status =_.get(xml, 'Markup.Topic[0].@.TopicStatus');
					issue.extras.ReferenceLink = _.get(xml, 'Topic[0].ReferenceLink');
					issue.name = _.get(xml, 'Markup.Topic[0].Title[0]._');
					issue.priority =  _.get(xml, 'Markup.Topic[0].Priority[0]._');
					issue.extras.Index =  _.get(xml, 'Markup.Topic[0].Index[0]._');
					issue.extras.Labels =  _.get(xml, 'Markup.Topic[0].Labels[0]._');
					issue.created = moment(_.get(xml, 'Markup.Topic[0].CreationDate[0]._')).format('x');
					issue.owner = _.get(xml, 'Markup.Topic[0].CreationAuthor[0]._');
					issue.extras.ModifiedDate = _.get(xml, 'Markup.Topic[0].ModifiedDate[0]._');
					issue.extras.ModifiedAuthor = _.get(xml, 'Markup.Topic[0].ModifiedAuthor[0]._');
					issue.extras.DueDate = _.get(xml, 'Markup.Topic[0].DueDate[0]._');
					issue.extras.AssignedTo = _.get(xml, 'Markup.Topic[0].AssignedTo[0]._');
					issue.desc = _.get(xml, 'Markup.Topic[0].Description[0]._');
					issue.extras.BimSnippet = _.get(xml, 'Markup.Topic[0].BimSnippet');
					issue.extras.DocumentReference = _.get(xml, 'Markup.Topic[0].DocumentReference');
					issue.extras.RelatedTopic = _.get(xml, 'Markup.Topic[0].RelatedTopic');
					issue.markModified('extras');

				}

				_.get(xml ,'Markup.Comment') && xml.Markup.Comment.forEach(comment => {
					let obj = {
						guid: _.get(comment, '@.Guid') ? utils.stringToUUID(_.get(comment, '@.Guid')) : utils.generateUUID(),
						created: moment(_.get(comment, 'Date[0]._')).format('x'),
						owner: _.get(comment, 'Author[0]._'),
						comment: _.get(comment, 'Comment[0]._'),
						sealed: true,
						viewpoint: utils.isUUID(_.get(comment, 'Viewpoint[0].@.Guid')) ? utils.stringToUUID(comment.Viewpoint[0]['@'].Guid) : undefined,
						extras: {}
					};

					obj.extras.ModifiedDate = _.get(comment, 'ModifiedDate');
					obj.extras.ModifiedAuthor = _.get(comment, 'ModifiedAuthor');

					issue.comments.push(obj);
				});

				return parseViewpoints(guid, issueFiles, xml.Markup.Viewpoints);

			}).then(viewpoints => {

				Object.keys(viewpoints).forEach(guid => {

					if(!viewpoints[guid].viewpointXml){
						return;
					}

					let extras = {};
					let vpXML = viewpoints[guid].viewpointXml;

					extras.Components = _.get(vpXML, 'VisualizationInfo.Components');
					extras.Spaces = _.get(vpXML, 'VisualizationInfo.Spaces');
					extras.SpaceBoundaries = _.get(vpXML, 'VisualizationInfo.SpaceBoundaries');
					extras.Openings = _.get(vpXML, 'VisualizationInfo.Openings');
					extras.OrthogonalCamera = _.get(vpXML, 'VisualizationInfo.OrthogonalCamera');
					extras.Lines = _.get(vpXML, 'VisualizationInfo.Lines');
					extras.ClippingPlanes = _.get(vpXML, 'VisualizationInfo.ClippingPlanes');
					extras.Bitmap = _.get(vpXML, 'VisualizationInfo.Bitmap');
					extras.Index = viewpoints[guid].Viewpoint;
					extras.Snapshot = viewpoints[guid].Snapshot;

					console.log(viewpoints[guid]);

					let screenshotObj = viewpoints[guid].snapshot ? {
						flag: 1,
						content: viewpoints[guid].snapshot,
					} : undefined;

					issue.viewpoints.push({
						guid: utils.stringToUUID(guid),
						extras: extras,
						screenshot: screenshotObj,
						up: [
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraUpVector[0].X[0]._')),
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraUpVector[0].Y[0]._')),
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraUpVector[0].Z[0]._'))
						],
						view_dir: [
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraDirection[0].X[0]._')),
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraDirection[0].Y[0]._')),
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraDirection[0].Z[0]._'))
						],
						look_at:[
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraViewPoint[0].X[0]._')),
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraViewPoint[0].Y[0]._')),
							parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].CameraViewPoint[0].Z[0]._'))
						],
						fov: parseFloat(_.get(vpXML, 'VisualizationInfo.PerspectiveCamera[0].FieldOfView[0]._'))

					});
				});

				return issue.save();

			});

		}

		// read each item zip file, put them in files object
		function handleEntry(zipfile, entry) {

			let paths = entry.fileName.split('/');
			let guid = paths[0] && utils.isUUID(paths[0]) && paths[0];

			if(guid && !files[guid]){
				files[guid] = {};
			}

			// if entry is a file and start with guid
			if(!entry.fileName.endsWith('/') && guid){

				promises.push(new Promise( (resolve, reject) => {
					zipfile.openReadStream(entry, (err, rs) => {
						if(err){
							return reject(err);
						} else {

							let bufs = [];

							rs.on('data', d => bufs.push(d) );

							rs.on('end', () => {
								let buf = Buffer.concat(bufs);
								files[guid][entry.fileName] = buf;
								resolve();
							});

							rs.on('error', err =>{
								reject(err);
							});
						}
					});
				}));
			} 

			zipfile.readEntry();

		}

		yauzl.open(zipPath, {lazyEntries: true}, handleZip);
	});

};

var Issue = ModelFactory.createClass(
	'Issue',
	schema,
	arg => {
		return `${arg.project}.issues`;
	}
);

module.exports = Issue;
