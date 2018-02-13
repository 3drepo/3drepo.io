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
"use strict";

let mongoose = require("mongoose");
let ModelFactory = require("./factory/modelFactory");
let Schema = mongoose.Schema;
let ModelSetting = require("./modelSetting");
let utils = require("../utils");
let stringToUUID = utils.stringToUUID;
let uuidToString = utils.uuidToString;
let History = require("./history");
let Ref = require("./ref");
let GenericObject = require("./base/repo").GenericObject;
let uuid = require("node-uuid");
let responseCodes = require("../response_codes.js");
let middlewares = require("../middlewares/middlewares");
const _ = require("lodash");

let ChatEvent = require("./chatEvent");

// var xmlBuilder = require('xmlbuilder');
let moment = require("moment");
let archiver = require("archiver");
let yauzl = require("yauzl");
let xml2js = require("xml2js");
let systemLogger = require("../logger.js").systemLogger;
let Group = require("./group");
let gm = require("gm");
let C = require("../constants");

let xmlBuilder = new xml2js.Builder({
	explicitRoot: false,
	xmldec: {
		version: "1.0",
		encoding: "UTF-8",
		standalone: false
	},
	explicitCharkey: true,
	attrkey: "@"
});


let actionSchema = Schema({
	_id : false,
	id: false,
	property: String,
	from: String,
	to: String
});

function propertyTextMapping(property){
	

	let mapping = {
		"priority": "Priority",
		"status": "Status",
		"assigned_roles": "Assigned",
		"topic_type": "Type",
		"desc": "Description"
	};

	return mapping[property] || property;
}

actionSchema.virtual("propertyText").get(function(){
	return propertyTextMapping(this.property);
});

actionSchema.set("toObject", { virtuals: true, getters:true });


let schema = Schema({
	_id: Object,
	object_id: Object,
	rev_id: Object,
	name: { type: String, required: true },
	topic_type: String,
	status: {
        type: String
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
		group_id: Object,
		highlighted_group_id: Object,
		hidden_group_id: Object,
		hideIfc: Boolean,
		screenshot: {
			flag: Number, 
			content: Object,
			resizedContent: Object
		},
		guid: Object,
		extras: {},
		scribble: {flag: Number, content: Object},
		type: {
			type: String, 
			default: "perspective", 
			enum: ["perspective", "orthogonal"]
		}
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
		action: actionSchema,
		owner: String,
		comment: {type: String},
		created: Number,
		sealed: Boolean,
		rev_id: Object,
		guid: Object,
		viewpoint: Object, //guid backref to viewpoints
		//bcf extra fields we don't care
		extras: {}
	}],
	commentCount: { type: Number, default: 0},
	viewCount: { type: Number, default: 0},
	assigned_roles: [String],
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

let statusEnum = {
	"OPEN": C.ISSUE_STATUS_OPEN, 
	"IN_PROGRESS": C.ISSUE_STATUS_IN_PROGRESS, 
	"FOR_APPROVAL": C.ISSUE_STATUS_FOR_APPROVAL, 
	"CLOSED": C.ISSUE_STATUS_CLOSED
};

let priorityEnum = {
	"NONE": "none", 
	"LOW": "low", 
	"MEDIUM": "medium", 
	"HIGH": "high"
};

schema.statics._find = function(dbColOptions, filter, projection, sort, noClean){
	
	//get model type
	let settings;
	let issues;

	return ModelSetting.findById(dbColOptions, dbColOptions.model).then(_settings => {
		settings = _settings;
		return this.find(dbColOptions, filter, projection, sort);
	}).then(_issues => {

		issues = _issues;
		issues.forEach((issue, index) => {
			issues[index] = noClean ? issue: issue.clean(_.get(settings, "type", ""), _.get(settings, "properties.code", ""));
		});

		return Promise.resolve(issues);
	});
};

schema.statics.getFederatedModelList = function(dbColOptions, username, branch, revision){
	

	let allRefs = [];

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

			let promises = [];

			refs.forEach(ref => {
				let childDbName  = ref.owner ? ref.owner : dbColOptions.account;
				let childModel = ref.project;

				let unique = ref.unique;

				let childRevision, childBranch;
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
					model: childModel
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


schema.statics.findByModelName = function(dbColOptions, username, branch, revId, projection, noClean, ids, sortBy){
	

	let issues;
	let self = this;
	let filter = {};

	let addRevFilter = Promise.resolve();

	if(ids){

		ids.forEach((id, i) => {
			ids[i] = stringToUUID(id);
		});
	}

	let sort;

	if(sortBy === "activity"){
		sort = {sort: {"commentCount": -1}};
	} else if (sortBy === "view") {
		sort = {sort: {"viewCount": -1}};
	}  else if (sortBy === "createdDate") {
		sort = {sort: {"created": -1}};
	}

	if (revId){

		let findHistory = utils.isUUID(revId) ? History.findByUID : History.findByTag;
		let currHistory;
		addRevFilter = findHistory(dbColOptions, revId).then(history => {

			if(!history){
				return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
			} else {

				currHistory = history;

				return History.find(
					dbColOptions, 
					{ timestamp: {"$gt": currHistory.timestamp }}, 
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
					"created" : { "$lt": history.timestamp.valueOf() },
					rev_id: null 
				};
			}

			return History.find(
				dbColOptions, 
				{ timestamp: {"$lte": currHistory.timestamp }}, 
				{_id : 1}
			);
		}).then(histories => {

			if(histories.length > 0){
				// for issues with rev_id, get all issues if rev_id in revIds
				let revIds = histories.map(h => h._id);

				filter = {
					"$or" : [ filter, {
						rev_id: { "$in" : revIds }
					}]
				};
			}
		});
	}


	return addRevFilter.then(() => {
		
		if(ids){
			filter._id = {
				"$in": ids
			};
		}

		return this._find(dbColOptions, filter, projection, sort, noClean);

	}).then(_issues => {
		issues = _issues;
		return self.getFederatedModelList(
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
				let childModel = ref.project;

				promises.push(
					middlewares.hasReadAccessToModelHelper(username, childDbName, childModel).then(granted => {
						if(granted){

							let filter = {};

							if(ids){
								filter._id = {
									"$in": ids
								};
							}

							return self._find({account: childDbName, model: childModel}, filter, projection, sort, noClean);
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

schema.statics.getBCFZipReadStream = function(account, model, username, branch, revId){
	

	let zip = archiver.create("zip");

	zip.append(new Buffer.from(this.getModelBCF(model), "utf8"), {name: "model.bcf"})
	.append(new Buffer.from(this.getBCFVersion(), "utf8"), {name: "bcf.version"});

	let projection = {};
	let noClean = true;
	let settings;

	return ModelSetting.findById({account, model}, model).then(_settings => {

		settings = _settings;
		return this.findByModelName({account, model}, username, branch, revId, projection, noClean);

	}).then(issues => {

		issues.forEach(issue => {

			let bcf = issue.getBCFMarkup(_.get(settings, "properties.unit"));

			zip.append(new Buffer.from(bcf.markup, "utf8"), {name: `${uuidToString(issue._id)}/markup.bcf`});

			bcf.viewpoints.forEach(vp => {
				zip.append(new Buffer.from(vp.xml, "utf8"), {name: `${uuidToString(issue._id)}/${vp.filename}`});
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
	

	let filter = { parent: stringToUUID(sid) };

	if(number){
		filter.number = number;
	}

	return this._find(dbColOptions, filter).then(issues => {
		issues.forEach((issue, i) => {
			if(issue.scribble){
				issues[i] = issue.scribble.toString("base64");
			}
		});

		return Promise.resolve(issues);
	});
};

schema.statics.findByUID = function(dbColOptions, uid, onlyStubs, noClean){
	

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

	let settings;

	return ModelSetting.findById(dbColOptions, dbColOptions.model).then(_settings => {

		settings = _settings;
		return this.findById(dbColOptions, stringToUUID(uid));
	
	}).then(issue => {
		return Promise.resolve(noClean ? issue : issue.clean(_.get(settings, "type", ""), _.get(settings, "properties.code", "")));
	});
};

schema.statics.createIssue = function(dbColOptions, data){
	

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
		getHistory = History.findByBranch(dbColOptions, "master", {_id: 1});
	}

	//assign rev_id for issue
	promises.push(getHistory.then(history => {
		if(!history && data.revId){
			return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
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

		if(_.map(statusEnum).indexOf(data.status) === -1){
			return Promise.reject(responseCodes.ISSUE_INVALID_STATUS);
		}

		if(_.map(priorityEnum).indexOf(data.priority) === -1){
			return Promise.reject(responseCodes.ISSUE_INVALID_PRIORITY);
		}

		issue.number  = count + 1;
		issue.object_id = objectId && stringToUUID(objectId);
		issue.name = data.name;
		issue.created = (new Date()).getTime();
		issue.owner = data.owner;
		issue.status = data.status;
		issue.topic_type = data.topic_type;
		if(data.desc && data.desc !== "")
		{
			issue.desc = data.desc;
		}
		else
		{
			issue.desc = "(No Description)";
		}
		issue.priority = data.priority;
		issue.group_id = data.group_id && stringToUUID(data.group_id);

		if(data.viewpoint){
			data.viewpoint.guid = utils.generateUUID();
			data.viewpoint.group_id = data.group_id;
			
			data.viewpoint.scribble && (data.viewpoint.scribble = {
				content: new Buffer.from(data.viewpoint.scribble, "base64"),
				flag: 1
			});

			if(data.viewpoint.screenshot){
				data.viewpoint.screenshot = {
					content: new Buffer.from(data.viewpoint.screenshot, "base64"),
					flag: 1
				};
			}

			issue.viewpoints.push(data.viewpoint);
		}
		
		issue.scale = data.scale || issue.scale;
		issue.position =  data.position || issue.position;
		issue.norm = data.norm || issue.norm;
		issue.creator_role = data.creator_role || issue.creator_role;
		issue.assigned_roles = data.assigned_roles || issue.assigned_roles;


		if(data.viewpoint && data.viewpoint.screenshot){

			return this.resizeAndCropScreenshot(data.viewpoint.screenshot.content, 120, 120, true).catch(err => {
				systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated",{
					account: dbColOptions.account, 
					model: dbColOptions.model, 
					issueId: utils.uuidToString(issue._id), 
					viewpointId: utils.uuidToString(data.viewpoint.guid),
					err: err
				});
			});
		
		} else {

			return Promise.resolve();
		}


	}).then(image => {


		if(image){
			issue.thumbnail = {
				flag: 1,
				content: image
			};
		}

		return issue.save().then(issue => {

			if(group){
				group.issue_id = issue._id;
				return group.save();
			} else {
				return Promise.resolve();
			}

		}).then(() => {
			return ModelSetting.findById(dbColOptions, dbColOptions.model);
		}).then(settings => {

			let cleaned = issue.clean(_.get(settings, "type", ""), _.get(settings, "properties.code", ""));
			
			ChatEvent.newIssues(data.sessionId, dbColOptions.account, dbColOptions.model, [cleaned]);

			return Promise.resolve(cleaned);

		});

	});

};

schema.statics.getScreenshot = function(dbColOptions, uid, vid){
	
	

	return this.findById(dbColOptions, stringToUUID(uid), { 
		viewpoints: { $elemMatch: { guid: stringToUUID(vid) } },
		"viewpoints.screenshot.resizedContent": 0
	}).then(issue => {

		if(!_.get(issue, "viewpoints[0].screenshot.content.buffer")){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return issue.viewpoints[0].screenshot.content.buffer;
		}
	});
};

schema.statics.getSmallScreenshot = function(dbColOptions, uid, vid){
	

	return this.findById(dbColOptions, stringToUUID(uid), { 
		viewpoints: { $elemMatch: { guid: stringToUUID(vid) } }
	}).then(issue => {

		if (_.get(issue, "viewpoints[0].screenshot.resizedContent.buffer")){

			return issue.viewpoints[0].screenshot.resizedContent.buffer;
		} else if(!_.get(issue, "viewpoints[0].screenshot.content.buffer")){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			
			return this.resizeAndCropScreenshot(issue.viewpoints[0].screenshot.content.buffer, 365).then(resized => {
				this.findOneAndUpdate(dbColOptions, 
					{ _id: stringToUUID(uid), "viewpoints.guid": stringToUUID(vid)},
					{ "$set": { "viewpoints.$.screenshot.resizedContent": resized } }
				).catch( err => {
					systemLogger.logError("error while saving resized screenshot",{
						issueId: uid,
						viewpointId: vid,
						err: err,
					});
				});

				return resized;
			});
		}
	});
};

schema.statics.getThumbnail = function(dbColOptions, uid){
	
	

	return this.findById(dbColOptions, stringToUUID(uid), { thumbnail: 1 }).then(issue => {

		if(!_.get(issue, "thumbnail.content.buffer")){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return issue.thumbnail.content.buffer;
		}
	});
};

schema.statics.resizeAndCropScreenshot = function(pngBuffer, destWidth, destHeight, crop){
	

	let image, sourceX, sourceY, sourceWidth, sourceHeight;

	return new Promise((resolve, reject) => {

		image = gm(pngBuffer).size((err, size) => {
			if(err){
				reject(err);
			} else {
				resolve(size);
			}
		});

	}).then(size => {

		destHeight = destHeight || Math.floor(destWidth / size.width * size.height);

		if(size.width <= destWidth){

			return pngBuffer;

		} else if (!crop){

			sourceX = 0;
			sourceY = 0;
			sourceWidth = size.width;
			sourceHeight = size.height;

		} else if (size.width > size.height){
			
			sourceY = 0;
			sourceHeight = size.height;
			sourceX = Math.round(size.width / 2 - size.height / 2);
			sourceWidth = sourceHeight;

			image.crop(sourceWidth, sourceHeight, sourceX, sourceY);

		} else {

			sourceX = 0;
			sourceWidth = size.width;
			sourceY = (size.height / 2 - size.width / 2);
			sourceHeight = sourceWidth;

			image.crop(sourceWidth, sourceHeight, sourceX, sourceY);
		}

		return new Promise((resolve, reject) => {
			image.resize(destWidth, destHeight, "!").toBuffer("PNG", (err, buffer) => {
				if (err) {
					reject(err);
				} else {
					resolve(buffer);
				}
			});
		});
	});

};


schema.methods.updateComment = function(commentIndex, data){
	

	let timeStamp = (new Date()).getTime();

	if((this.comments[commentIndex] && this.comments[commentIndex].sealed)){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_SEALED });
	}

	if(commentIndex === null || typeof commentIndex === "undefined"){

		let commentGuid = utils.generateUUID();
		let getHistory;

		if(data.revId){
			getHistory = utils.isUUID(data.revId) ? History.findByUID : History.findByTag;
			getHistory = getHistory(this._dbcolOptions, data.revId, {_id: 1});
		} else {
			getHistory = History.findByBranch(this._dbcolOptions, "master", {_id: 1});
		}

		//assign rev_id for issue
		return getHistory.then(history => {
			if(!history && data.revId){
				return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
			} else {

				data.viewpoint = data.viewpoint || {};
				data.viewpoint.guid = utils.generateUUID();

				data.viewpoint.screenshot && (data.viewpoint.screenshot = {
					content: new Buffer.from(data.viewpoint.screenshot, "base64"),
					flag: 1
				});

				data.viewpoint.scribble && (data.viewpoint.scribble = {
					content: new Buffer.from(data.viewpoint.scribble, "base64"),
					flag: 1
				});

				this.viewpoints.push(data.viewpoint);

				this.comments.forEach(comment => {
					if(!comment.sealed){
						comment.sealed = true;
					}
				});

				this.comments.push({ 
					owner: data.owner,
					comment: data.comment, 
					created: timeStamp,
					rev_id: history ? history._id : undefined,
					guid: commentGuid,
					viewpoint: data.viewpoint.guid
				});

				this.commentCount++;

			}
		}).then(() => {
			return this.save();

		}).then(issue => {

			issue = issue.clean();
			let comment = issue.comments.find(c => c.guid === utils.uuidToString(commentGuid));
			let eventData = comment;

			ChatEvent.newComment(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, eventData);
			return comment;
		});


	} else {

		let commentObj = this.comments[commentIndex];
		
		if(!commentObj){
			return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_INVALID_INDEX });
		}

		if(commentObj.owner !== data.owner && data.comment){
			return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_PERMISSION_DECLINED });
		}

		if(isSystemComment(commentObj)){
			return Promise.reject({ resCode: responseCodes.ISSUE_SYSTEM_COMMENT });

		}

		if(data.comment){
			commentObj.comment = data.comment;
			commentObj.created = timeStamp;
		}
		
		commentObj.sealed = data.sealed || commentObj.sealed;

		return this.save().then(issue => {
			issue = issue.clean();

			let comment = issue.comments.find(c => c.guid === utils.uuidToString(commentObj.guid));
			let eventData = comment;

			ChatEvent.commentChanged(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, eventData);
			return comment;
		});
	}

	
};

function isSystemComment(comment){
	
	return !_.isEmpty(comment.toObject().action);
}

schema.methods.removeComment = function(commentIndex, data){
	

	let commentObj = this.comments[commentIndex];
	
	if(!commentObj){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_INVALID_INDEX });
	}

	if(commentObj.owner !== data.owner){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_PERMISSION_DECLINED });
	}

	if(this.comments[commentIndex].sealed){
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_SEALED });
	}

	if(isSystemComment(this.comments[commentIndex])){
		return Promise.reject({ resCode: responseCodes.ISSUE_SYSTEM_COMMENT });
	}
	
	let comment = this.clean().comments[commentIndex];
	this.comments[commentIndex].remove();

	return this.save().then(() => {

		let issue = this.clean();
		ChatEvent.commentDeleted(
			data.sessionId, 
			this._dbcolOptions.account, 
			this._dbcolOptions.model, 
			issue._id, comment);

		return issue;
	});
};

schema.methods.isClosed = function(){
	return this.status === "closed" || this.closed;
};


schema.methods.addSystemComment = function(owner, property, from , to){
	

	let timeStamp = (new Date()).getTime();
	let comment = {
		created: timeStamp,
		action:{
			property, from, to
		},
		owner: owner
	};

	this.comments.push(comment);
	this.commentCount++;

	//seal the last comment if it is a human commnet after adding system comments
	let commentLen = this.comments.length;

	if(commentLen > 1 && !isSystemComment(this.comments[commentLen - 2])){

		this.comments[commentLen - 2].sealed = true;
	}

	return comment;
};

schema.methods.updateAttrs = function(data, isAdmin, hasOwnerJob, hasAssignedJob) {
	

	let forceStatusChanged;
	let systemComment; 
	const assignedHasChanged = data.hasOwnProperty("assigned_roles") && 
								!_.isEqual(this.assigned_roles, data.assigned_roles);

	if (assignedHasChanged) {
		//force status change to in progress if assigned roles during status=for approval

		systemComment = this.addSystemComment(
			data.owner, 
			"assigned_roles", 
			this.assigned_roles,
			data.assigned_roles
		);

		this.assigned_roles = data.assigned_roles;
		
		if(this.status === statusEnum.FOR_APPROVAL) {
			forceStatusChanged = true;
			this.status = statusEnum.IN_PROGRESS;
		}

	}

	const statusExists = !forceStatusChanged && 
							data.hasOwnProperty("status");

	if(statusExists) {

		const invalidStatus = _.map(statusEnum).indexOf(data.status) === -1;
		if (invalidStatus) {

			throw responseCodes.ISSUE_INVALID_STATUS;

		} else {

			const statusHasChanged = data.status !== this.status;
			
			if(statusHasChanged) {

				const canChangeStatus = isAdmin || 
										hasOwnerJob || 
										(hasAssignedJob && data.status !== statusEnum.CLOSED);
				
				if (canChangeStatus) {

					//change status to for_approval if assigned roles is changed.
					if (data.status === statusEnum.FOR_APPROVAL) {
						this.assigned_roles = this.creator_role ? [this.creator_role] : [];
					}

					systemComment = this.addSystemComment(data.owner, "status", this.status, data.status);
					this.status_last_changed = (new Date()).getTime();
					this.status = data.status;			
				} else {
					throw responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED;
				}
				
			}

		}
	}

	if(data.hasOwnProperty("priority")){
		if (_.map(priorityEnum).indexOf(data.priority) === -1){

			throw responseCodes.ISSUE_INVALID_PRIORITY;

		} else if(data.priority !== this.priority) {

			const canChangeStatus = isAdmin || hasOwnerJob;
			
			if (canChangeStatus) {
				systemComment = this.addSystemComment(data.owner, "priority", this.priority, data.priority);

				this.priority_last_changed = (new Date()).getTime();
				this.priority = data.priority;
			} else {
				throw responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED;
			}
		}
	}

	if(data.hasOwnProperty("topic_type") && this.topic_type !== data.topic_type){
		systemComment = this.addSystemComment(data.owner, "topic_type", this.topic_type, data.topic_type);
		this.topic_type = data.topic_type;
	}

	if(data.hasOwnProperty("desc") && this.desc !== data.desc) {
		const canChangeStatus = isAdmin || hasOwnerJob; 
		if (canChangeStatus) {
			systemComment = this.addSystemComment(data.owner, "desc", this.desc, data.desc);
			this.desc = data.desc;
		} else {
			throw responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED;
		}
		
	}

	let settings;

	return ModelSetting.findById(this._dbcolOptions, this._dbcolOptions.model).then(_settings => {

		settings = _settings;
		return this.save();

	}).then(() => {

		let issue = this.clean(settings.type, settings.properties.code);
		ChatEvent.issueChanged(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, issue);
		ChatEvent.newComment(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, systemComment);
		
		return issue;

	});
	
};

schema.methods.clean = function(typePrefix, modelCode){
	

	let cleaned = this.toObject();
	cleaned._id = uuidToString(cleaned._id);
	cleaned.typePrefix = typePrefix;
	cleaned.modelCode = modelCode;
	cleaned.parent = cleaned.parent ? uuidToString(cleaned.parent) : undefined;
	cleaned.account = this._dbcolOptions.account;
	cleaned.model = this._dbcolOptions.model;
	cleaned.rev_id && (cleaned.rev_id = uuidToString(cleaned.rev_id));
	cleaned.group_id = cleaned.group_id ? uuidToString(cleaned.group_id) : undefined;
	cleaned.highlighted_group_id = cleaned.highlighted_group_id ? uuidToString(cleaned.highlighted_group_id) : undefined;
	cleaned.hidden_group_id = cleaned.hidden_group_id ? uuidToString(cleaned.hidden_group_id) : undefined;
	cleaned.viewpoints.forEach((vp, i) => {

		cleaned.viewpoints[i].guid = uuidToString(cleaned.viewpoints[i].guid);
		
		if(_.get(cleaned, `viewpoints[${i}].screenshot.flag`)){
			cleaned.viewpoints[i].screenshot = cleaned.account + "/" + cleaned.model +"/issues/" + cleaned._id + "/viewpoints/" + cleaned.viewpoints[i].guid + "/screenshot.png";
			cleaned.viewpoints[i].screenshotSmall = cleaned.account + "/" + cleaned.model +"/issues/" + cleaned._id + "/viewpoints/" + cleaned.viewpoints[i].guid + "/screenshotSmall.png";
		}

	});

	if(_.get(cleaned, "thumbnail.flag")){
		cleaned.thumbnail = cleaned.account + "/" + cleaned.model +"/issues/" + cleaned._id + "/thumbnail.png";
	}

	cleaned.comments && cleaned.comments.forEach( (comment, i) => {

		cleaned.comments[i].rev_id = comment.rev_id && (comment.rev_id = uuidToString(comment.rev_id));
		cleaned.comments[i].guid && (cleaned.comments[i].guid = uuidToString(cleaned.comments[i].guid));


		if(cleaned.comments[i].viewpoint){

			cleaned.comments[i].viewpoint = JSON.parse(JSON.stringify(cleaned.viewpoints.find(vp => vp.guid === uuidToString(cleaned.comments[i].viewpoint))));

			if(i > 0 && cleaned.comments[i-1].viewpoint && cleaned.comments[i].viewpoint.guid === cleaned.comments[i-1].viewpoint.guid){
				//hide repeated screenshot if consecutive comments relate to the same viewpoint
				cleaned.comments[i].viewpoint.screenshot = null;
				cleaned.comments[i].viewpoint.screenshotSmall = null;
			}

		} else if (!isSystemComment(this.comments[i])){
			// for all other non system comments
			cleaned.comments[i].viewpoint = cleaned.viewpoint;
		}
		
	});

	if( cleaned.comments &&
		cleaned.comments.length > 0 && 
		cleaned.viewpoints[0] && 
		cleaned.comments[0].viewpoint && 
		cleaned.comments[0].viewpoint.guid === cleaned.viewpoints[0].guid){
		//hide repeated screenshot if issue viewpoint is the same as first comment's viewpoint
		cleaned.comments[0].viewpoint.screenshot = null;
		cleaned.comments[0].viewpoint.screenshotSmall = null;
	}

	if(cleaned.scribble){
		cleaned.scribble = cleaned.scribble.toString("base64");
	}

	if(cleaned.viewpoints.length > 0){
		cleaned.viewpoint = cleaned.viewpoints[0];
	}
	
	cleaned.viewpoints = undefined;

	return cleaned;
};

schema.methods.generateCommentsGUID = function(){
	

	this.comments.forEach(comment => {
		if(!comment.guid && !isSystemComment(comment)){
			comment.guid = utils.generateUUID();
		}
		if(!comment.viewpoint && !isSystemComment(comment)){
			comment.viewpoint = this.viewpoint.guid;
		}
	});
};

schema.methods.generateViewpointGUID = function(){
	if(!this.viewpoint.guid){
		this.viewpoint.guid = utils.generateUUID();
	}
};

schema.methods.getBCFMarkup = function(unit){
	

	this.generateViewpointGUID();
	this.generateCommentsGUID();
	this.save();
	
	let viewpointEntries = [];
	let snapshotEntries = [];

	let scale = 1;

	if(unit === "cm"){
		scale = 0.01;
	} else if (unit === "mm") {
		scale = 0.001;
	} else if (unit === "ft") {
		scale = 0.3048;
	}

	let markup = {
		Markup:{
			"@" : {
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xmlns:xsd": "http://www.w3.org/2001/XMLSchema"
			},
			Header:{},
			Topic: {
				"@" : {
					"Guid": uuidToString(this._id),
					"TopicStatus": this.status ? this.status : (this.closed ? "closed" : "open")
				},
				"Priority": this.priority,
				"Title": this.name ,
				"CreationDate": moment(this.created).format() ,
				"CreationAuthor": this.owner,
				"Description": this.desc
			},
			"Comment": [],
			"Viewpoints": [],
		}
	};

	this.topic_type && (markup.Markup.Topic["@"].TopicType = this.topic_type);

	_.get(this, "extras.Header") && (markup.Markup.Header = _.get(this, "extras.Header"));
	_.get(this, "extras.ReferenceLink") && (markup.Markup.Topic.ReferenceLink = _.get(this, "extras.ReferenceLink"));
	_.get(this, "extras.Index") && (markup.Markup.Topic.Index = _.get(this, "extras.Index"));
	_.get(this, "extras.Labels") && (markup.Markup.Topic.Labels = _.get(this, "extras.Labels"));
	_.get(this, "extras.ModifiedDate") && (markup.Markup.Topic.ModifiedDate = _.get(this, "extras.ModifiedDate"));
	_.get(this, "extras.ModifiedAuthor") && (markup.Markup.Topic.ModifiedAuthor = _.get(this, "extras.ModifiedAuthor"));
	_.get(this, "extras.DueDate") && (markup.Markup.Topic.DueDate = _.get(this, "extras.DueDate"));
	_.get(this, "extras.AssignedTo") && (markup.Markup.Topic.AssignedTo = _.get(this, "extras.AssignedTo"));
	_.get(this, "extras.BimSnippet") && (markup.Markup.Topic.BimSnippet = _.get(this, "extras.BimSnippet"));
	_.get(this, "extras.DocumentReference") && (markup.Markup.Topic.DocumentReference = _.get(this, "extras.DocumentReference"));
	_.get(this, "extras.RelatedTopic") && (markup.Markup.Topic.RelatedTopic = _.get(this, "extras.RelatedTopic"));
	
	//add comments
	this.comments.forEach(comment => {

		if(isSystemComment(comment)){
			return;
		}

		let commentXmlObj = {
			"@":{
				Guid: utils.uuidToString(comment.guid)
			},
			"Author": comment.owner,
			"Comment": comment.comment,
			"Viewpoint": {
				"@": {Guid: utils.uuidToString(comment.viewpoint)}
			},
			"Date": moment(comment.created).format(),
			// bcf 1.0 for back comp
			"Status": this.topic_type ? utils.ucFirst(this.topic_type.replace(/_/g, " ")) : "",
			"VerbalStatus": this.status ? this.status : (this.closed ? "closed" : "open")
		};

		_.get(comment, "extras.ModifiedDate") && (commentXmlObj.ModifiedDate = _.get(comment, "extras.ModifiedDate"));
		_.get(comment, "extras.ModifiedAuthor") && (commentXmlObj.ModifiedAuthor = _.get(comment, "extras.ModifiedAuthor"));

		markup.Markup.Comment.push(commentXmlObj);

	});


	// generate viewpoints
	let snapshotNo = 0;

	this.viewpoints.forEach((vp, index) => {

		let number = index === 0 ? "" : index;
		let viewpointFileName = `viewpoint${number}.bcfv`;
		let snapshotFileName = `snapshot${(snapshotNo === 0 ? "" : snapshotNo)}.png`;

		let vpObj = {
			"@": {
				"Guid": utils.uuidToString(vp.guid)
			},
			"Viewpoint": viewpointFileName,
			"Snapshot":  null


			
		};

		if(vp.screenshot.flag){

			vpObj.Snapshot = snapshotFileName;
			snapshotEntries.push({
				filename: snapshotFileName,
				snapshot: vp.screenshot.content
			});
			snapshotNo++;

		}

		_.get(vp, "extras.Index") && (vpObj.Index = vp.extras.Index);

		markup.Markup.Viewpoints.push(vpObj);
		
		let viewpointXmlObj = {
			VisualizationInfo:{
				"@":{
					"Guid": utils.uuidToString(vp.guid),
					"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
					"xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
				}
			}
		};


		if(!_.get(vp, "extras._noPerspective") && vp.position.length >= 3 && vp.view_dir.length >= 3 && vp.up.length >=3){

			viewpointXmlObj.VisualizationInfo.PerspectiveCamera = {
				CameraViewPoint:{
					X: vp.position[0] * scale,
					Y: -vp.position[2] * scale,
					Z: vp.position[1] * scale
				},
				CameraDirection:{
					X: vp.view_dir[0],
					Y: -vp.view_dir[2],
					Z: vp.view_dir[1]
				},
				CameraUpVector:{
					X: vp.up[0],
					Y: -vp.up[2],
					Z: vp.up[1]
				},
				FieldOfView: vp.fov * 180 / Math.PI
			};
		}

		_.get(vp, "extras.Components") && (viewpointXmlObj.VisualizationInfo.Components = _.get(vp, "extras.Components"));
		_.get(vp, "extras.Spaces") && (viewpointXmlObj.VisualizationInfo.Spaces = _.get(vp, "extras.Spaces"));
		_.get(vp, "extras.SpaceBoundaries") && (viewpointXmlObj.VisualizationInfo.SpaceBoundaries = _.get(vp, "extras.SpaceBoundaries"));
		_.get(vp, "extras.Openings") && (viewpointXmlObj.VisualizationInfo.Openings = _.get(vp, "extras.Openings"));
		_.get(vp, "extras.OrthogonalCamera") && (viewpointXmlObj.VisualizationInfo.OrthogonalCamera = _.get(vp, "extras.OrthogonalCamera"));
		_.get(vp, "extras.Lines") && (viewpointXmlObj.VisualizationInfo.Lines = _.get(vp, "extras.Lines"));
		_.get(vp, "extras.ClippingPlanes") && (viewpointXmlObj.VisualizationInfo.ClippingPlanes = _.get(vp, "extras.ClippingPlanes"));
		_.get(vp, "extras.Bitmap") && (viewpointXmlObj.VisualizationInfo.Bitmap = _.get(vp, "extras.Bitmap"));

		viewpointEntries.push({
			filename: viewpointFileName,
			xml:  xmlBuilder.buildObject(viewpointXmlObj)
		});

	});



	return {
		markup: xmlBuilder.buildObject(markup),
		viewpoints: viewpointEntries,
		snapshots: snapshotEntries
	};
};

schema.statics.getBCFVersion = function(){
	

	return `
		<?xml version="1.0" encoding="UTF-8"?>
		<Version VersionId="2.0" xsi:noNamespaceSchemaLocation="version.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<DetailedVersion>2.0 RC</DetailedVersion>
		</Version>
	`;

};

schema.statics.getModelBCF = function(modelId){
	

	let model = {
		ProjectExtension:{
			"@" : {
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xmlns:xsd": "http://www.w3.org/2001/XMLSchema"
			},
			"Project": {
				"@": { "ProjectId": modelId },
				"Name": modelId,
			},
			"ExtensionSchema": {

			}
		}
	};

	return xmlBuilder.buildObject(model);
};


schema.statics.importBCF = function(requester, account, model, revId, zipPath){
	

	let self = this;
	let settings;
	let getHistory;

	if(revId){
		getHistory = utils.isUUID(revId) ? History.findByUID : History.findByTag;
		getHistory = getHistory({account, model}, revId, {_id: 1});
	} else {
		getHistory = History.findByBranch({account, model}, "master", {_id: 1});
	}

	//assign revId for issue
	return getHistory.then(history => {
		if(!history){
			return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
		} else if (history){
			revId = history._id;
		}
	}).then(() => {

		return ModelSetting.findById({account, model}, model);

	}).then(_settings => {
		settings = _settings;

	}).then(() => {

		return new Promise((resolve, reject) => {

			let files = {};
			let promises = [];

			function handleZip(err, zipfile) {
				if(err){
					return reject(err);
				}

				zipfile.readEntry();

				zipfile.on("entry", entry => handleEntry(zipfile, entry));

				zipfile.on("error", err => reject(err));

				zipfile.on("end", () => {

					let issueCounter;

					Issue.count({account, model}).then(count => {

						issueCounter = count;

					}).then(() => {

						return Promise.all(promises);

					}).then(() => {

						let createIssueProms = [];
						
						Object.keys(files).forEach(guid => {
							createIssueProms.push(createIssue(guid));
						});

						return Promise.all(createIssueProms);

					}).then(issues => {
							
						let saveIssueProms = [];

						// sort issues by date and add number
						issues = issues.sort((a, b) => {
							return a.created > b.created;
						});

	
						issues.forEach(issue => {

							saveIssueProms.push(
								Issue.count({account, model}, { _id: issue._id}).then(count => {

									if(count <= 0) {
										issue.number = ++issueCounter;
										return issue.save();
									} else {
										//console.log('duplicate issue');
										return Promise.resolve();
									}

								})
							);
						});

						return Promise.all(saveIssueProms);
				

					}).then(savedIssues => {

						let notifications = [];

						savedIssues.forEach(issue => {
							if(issue){
								notifications.push(issue.clean(settings.type));
							}
						});

						if(notifications.length){
							ChatEvent.newIssues(requester, account, model, notifications);
						}
						
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

					if(!_.get(vp, "@.Guid")){
						return;
					}
					
					let vpFile = issueFiles[`${issueGuid}/${_.get(vp, "Viewpoint[0]._")}`];

					viewpoints[vp["@"].Guid] = {
						snapshot: issueFiles[`${issueGuid}/${_.get(vp, "Snapshot[0]._")}`],
					};

					vpFile && promises.push(parseXmlString(vpFile.toString("utf8"), {explicitCharkey: 1, attrkey: "@"}).then(xml => {
						viewpoints[vp["@"].Guid].viewpointXml = xml;
						viewpoints[vp["@"].Guid].Index = _.get(vp, "Index");
						viewpoints[vp["@"].Guid].Viewpoint = _.get(vp, "Viewpoint");
						viewpoints[vp["@"].Guid].Snapshot = _.get(vp, "Snapshot");
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

				return parseXmlString(markupBuf.toString("utf8"), {explicitCharkey: 1, attrkey: "@"}).then(_xml => {

					xml = _xml;

					issue = Issue.createInstance({account, model});
					issue._id = stringToUUID(guid);
					issue.extras = {};
					issue.rev_id = revId;

					if(xml.Markup){
						
						issue.extras.Header = _.get(xml, "Markup.Header");
						issue.topic_type = _.get(xml, "Markup.Topic[0].@.TopicType");
						issue.status =_.get(xml, "Markup.Topic[0].@.TopicStatus");
						issue.extras.ReferenceLink = _.get(xml, "Topic[0].ReferenceLink");
						issue.name = _.get(xml, "Markup.Topic[0].Title[0]._");
						issue.priority =  _.get(xml, "Markup.Topic[0].Priority[0]._");
						issue.extras.Index =  _.get(xml, "Markup.Topic[0].Index[0]._");
						issue.extras.Labels =  _.get(xml, "Markup.Topic[0].Labels[0]._");
						issue.created = moment(_.get(xml, "Markup.Topic[0].CreationDate[0]._")).format("x");
						issue.owner = _.get(xml, "Markup.Topic[0].CreationAuthor[0]._");
						issue.extras.ModifiedDate = _.get(xml, "Markup.Topic[0].ModifiedDate[0]._");
						issue.extras.ModifiedAuthor = _.get(xml, "Markup.Topic[0].ModifiedAuthor[0]._");
						issue.extras.DueDate = _.get(xml, "Markup.Topic[0].DueDate[0]._");
						issue.extras.AssignedTo = _.get(xml, "Markup.Topic[0].AssignedTo[0]._");
						issue.desc = _.get(xml, "Markup.Topic[0].Description[0]._");
						issue.extras.BimSnippet = _.get(xml, "Markup.Topic[0].BimSnippet");
						issue.extras.DocumentReference = _.get(xml, "Markup.Topic[0].DocumentReference");
						issue.extras.RelatedTopic = _.get(xml, "Markup.Topic[0].RelatedTopic");
						issue.markModified("extras");

					}

					_.get(xml ,"Markup.Comment") && xml.Markup.Comment.forEach(comment => {
						let obj = {
							guid: _.get(comment, "@.Guid") ? utils.stringToUUID(_.get(comment, "@.Guid")) : utils.generateUUID(),
							created: moment(_.get(comment, "Date[0]._")).format("x"),
							owner: _.get(comment, "Author[0]._"),
							comment: _.get(comment, "Comment[0]._"),
							sealed: true,
							viewpoint: utils.isUUID(_.get(comment, "Viewpoint[0].@.Guid")) ? utils.stringToUUID(_.get(comment, "Viewpoint[0].@.Guid")) : undefined,
							extras: {}
						};

						obj.extras.ModifiedDate = _.get(comment, "ModifiedDate");
						obj.extras.ModifiedAuthor = _.get(comment, "ModifiedAuthor");

						issue.comments.push(obj);
					});

					return parseViewpoints(guid, issueFiles, xml.Markup.Viewpoints);

				}).then(viewpoints => {

					let vpGuids = Object.keys(viewpoints);

					vpGuids.forEach(guid => {

						if(!viewpoints[guid].viewpointXml){
							return;
						}

						let extras = {};
						let vpXML = viewpoints[guid].viewpointXml;

						extras.Components = _.get(vpXML, "VisualizationInfo.Components");
						extras.Spaces = _.get(vpXML, "VisualizationInfo.Spaces");
						extras.SpaceBoundaries = _.get(vpXML, "VisualizationInfo.SpaceBoundaries");
						extras.Openings = _.get(vpXML, "VisualizationInfo.Openings");
						extras.OrthogonalCamera = _.get(vpXML, "VisualizationInfo.OrthogonalCamera");
						extras.Lines = _.get(vpXML, "VisualizationInfo.Lines");
						extras.ClippingPlanes = _.get(vpXML, "VisualizationInfo.ClippingPlanes");
						extras.Bitmap = _.get(vpXML, "VisualizationInfo.Bitmap");
						extras.Index = viewpoints[guid].Viewpoint;
						extras.Snapshot = viewpoints[guid].Snapshot;
						!_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0]") && (extras._noPerspective = true);

						let screenshotObj = viewpoints[guid].snapshot ? {
							flag: 1,
							content: viewpoints[guid].snapshot,
						} : undefined;


						let vp = {
							guid: utils.stringToUUID(guid),
							extras: extras,
							screenshot: screenshotObj

						};

						let scale = 1;
						let unit = _.get(settings, "properties.unit");
						if(unit === "cm"){
							scale = 100;
						} else if (unit === "mm"){
							scale = 1000;
						} else if (unit === "ft"){
							scale = 3.28084;
						}	

						if(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0]")){
							vp.up = [
								parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraUpVector[0].X[0]._")),
								parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraUpVector[0].Z[0]._")),
								-parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraUpVector[0].Y[0]._"))
							];
							vp.view_dir = [
								parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraDirection[0].X[0]._")),
								parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraDirection[0].Z[0]._")),
								-parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraDirection[0].Y[0]._"))
							];
							vp.position = [
								parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraViewPoint[0].X[0]._")) * scale,
								parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraViewPoint[0].Z[0]._")) * scale,
								-parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].CameraViewPoint[0].Y[0]._")) * scale
							];

							vp.fov = parseFloat(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0].FieldOfView[0]._")) * Math.PI / 180;

							vp.type = "perspective";
							
						} else if (_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0]")){

							vp.up = [
								parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraUpVector[0].X[0]._")),
								parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraUpVector[0].Z[0]._")),
								-parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraUpVector[0].Y[0]._"))
							];

							vp.view_dir = [
								parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraDirection[0].X[0]._")),
								parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraDirection[0].Z[0]._")),
								-parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraDirection[0].Y[0]._"))
							];

							vp.position = [
								parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraViewPoint[0].X[0]._")) * scale,
								parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraViewPoint[0].Z[0]._")) * scale,
								-parseFloat(_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0].CameraViewPoint[0].Y[0]._")) * scale
							];

							vp.fov = 1.8;

							vp.type = "orthogonal";
						}

						issue.viewpoints.push(vp);
					});

					//take the first screenshot as thumbnail
					if(vpGuids.length > 0){
						
						return self.resizeAndCropScreenshot(viewpoints[vpGuids[0]].snapshot, 120, 120, true).catch(err => {

							systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
								account, 
								model, 
								issueId: utils.uuidToString(issue._id), 
								viewpointId: vpGuids[0],
								err: err
							});

							return Promise.resolve();
						});

					} else {
						return Promise.resolve();
					}

				}).then(image => {

					if(image){
						issue.thumbnail = {
							flag: 1,
							content: image
						};
					}

					return issue;
				});

			}

			// read each item zip file, put them in files object
			function handleEntry(zipfile, entry) {

				let paths;

				if(entry.fileName.indexOf("\\") !== -1){
					//give tolerance to file path using \ instead of /
					paths = entry.fileName.split("\\");
				} else {
					paths = entry.fileName.split("/");
				}

				let guid = paths[0] && utils.isUUID(paths[0]) && paths[0];

				if(guid && !files[guid]){
					files[guid] = {};
				}

				// if entry is a file and start with guid
				if(!entry.fileName.endsWith("/") && !entry.fileName.endsWith("\\") && guid){

					promises.push(new Promise( (resolve, reject) => {
						zipfile.openReadStream(entry, (err, rs) => {
							if(err){
								return reject(err);
							} else {

								let bufs = [];

								rs.on("data", d => bufs.push(d) );

								rs.on("end", () => {
									let buf = Buffer.concat(bufs);
									files[guid][paths.join("/")] = buf;
									resolve();
								});

								rs.on("error", err =>{
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
	});
};

let Issue = ModelFactory.createClass(
	"Issue",
	schema,
	arg => {
		return `${arg.model}.issues`;
	}
);

module.exports = Issue;
