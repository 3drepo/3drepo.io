/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const Schema = mongoose.Schema;
const ModelSetting = require("./modelSetting");
const utils = require("../utils");
const stringToUUID = utils.stringToUUID;
const uuidToString = utils.uuidToString;
const History = require("./history");
const Ref = require("./ref");
const GenericObject = require("./base/repo").GenericObject;
const uuid = require("node-uuid");
const responseCodes = require("../response_codes.js");
const middlewares = require("../middlewares/middlewares");
const _ = require("lodash");

const ChatEvent = require("./chatEvent");

// var xmlBuilder = require('xmlbuilder');
const moment = require("moment");
const archiver = require("archiver");
const yauzl = require("yauzl");
const xml2js = require("xml2js");
const systemLogger = require("../logger.js").systemLogger;
const Group = require("./group");
const Meta = require("./meta");
const C = require("../constants");

const xmlBuilder = new xml2js.Builder({
	explicitRoot: false,
	xmldec: {
		version: "1.0",
		encoding: "UTF-8",
		standalone: false
	},
	explicitCharkey: true,
	attrkey: "@"
});

const actionSchema = Schema({
	_id : false,
	id: false,
	property: String,
	from: String,
	to: String
});

function propertyTextMapping(property) {

	const mapping = {
		"priority": "Priority",
		"status": "Status",
		"assigned_roles": "Assigned",
		"topic_type": "Type",
		"desc": "Description"
	};

	return mapping[property] || property;
}

actionSchema.virtual("propertyText").get(function() {
	return propertyTextMapping(this.property);
});

actionSchema.set("toObject", { virtuals: true, getters:true });

const schema = Schema({
	_id: Object,
	object_id: Object,
	rev_id: Object,
	name: { type: String, required: true },
	topic_type: String,
	status: {
		type: String
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
		clippingPlanes : [Schema.Types.Mixed],
		group_id: Object,
		highlighted_group_id: Object,
		hidden_group_id: Object,
		shown_group_id: Object,
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
		type: String
		// enum: ['low', 'medium', 'high', 'critical']
	},
	comments: [{
		action: actionSchema,
		owner: String,
		comment: {type: String},
		created: Number,
		sealed: Boolean,
		rev_id: Object,
		guid: Object,
		viewpoint: Object, // guid backref to viewpoints
		// bcf extra fields we don't care
		extras: {}
	}],
	commentCount: { type: Number, default: 0},
	viewCount: { type: Number, default: 0},
	assigned_roles: [String],
	closed_time: Number,
	status_last_changed: Number,
	priority_last_changed: Number,
	creator_role: String,
	due_date: Number,

	// Temporary issue origin information
	origin_account: String,
	origin_model: String,

	// to be remove
	scribble: Object,

	// bcf extra fields we don't care
	extras: {}
});

function parseXmlString(xmlString, options) {

	return new Promise((resolve, reject) => {
		xml2js.parseString(xmlString, options, function (err, xml) {
			if(err) {
				reject(err);
			} else {
				resolve(xml);
			}
		});
	});

}
// Model statics method
// internal helper _find

const statusEnum = {
	"OPEN": C.ISSUE_STATUS_OPEN,
	"IN_PROGRESS": C.ISSUE_STATUS_IN_PROGRESS,
	"FOR_APPROVAL": C.ISSUE_STATUS_FOR_APPROVAL,
	"CLOSED": C.ISSUE_STATUS_CLOSED
};

const priorityEnum = {
	"NONE": "none",
	"LOW": "low",
	"MEDIUM": "medium",
	"HIGH": "high"
};

schema.statics._find = function(dbColOptions, filter, projection, sort, noClean) {

	// get model type
	let settings;
	let issues;

	return ModelSetting.findById(dbColOptions, dbColOptions.model).then(_settings => {
		settings = _settings;
		return this.find(dbColOptions, filter, projection, sort);
	}).then(_issues => {

		issues = _issues;
		issues.forEach((issue, index) => {
			issues[index] = noClean ? issue : issue.clean(_.get(settings, "type", ""), _.get(settings, "properties.code", ""));
		});

		return Promise.resolve(issues);
	});
};

schema.statics.getFederatedModelList = function(_dbColOptions, username, _branch, _revision) {

	let allRefs = [];
	// FIXME: why do we need an embedded function?!
	function _get(dbColOptions, branch, revision) {

		return History.getHistory(dbColOptions, branch, revision).then(history => {

			if(!history) {
				return Promise.resolve([]);
			}

			const filter = {
				type: "ref",
				_id: { $in: history.current }
			};

			return Ref.find(dbColOptions, filter);

		}).then(refs => {

			const promises = [];

			refs.forEach(ref => {
				const childDbName  = ref.owner ? ref.owner : dbColOptions.account;
				const childModel = ref.project;

				const unique = ref.unique;

				let childRevision, childBranch;
				if (ref._rid) {
					if (unique) {
						childRevision = uuidToString(ref._rid);
					} else {
						childBranch   = uuidToString(ref._rid);
					}
				} else {
					childBranch   = "master";
				}

				const dbCol = {
					account: childDbName,
					model: childModel
				};

				promises.push(_get(dbCol, childBranch, childRevision));

			});

			allRefs = allRefs.concat(refs);

			return Promise.all(promises);

		});
	}

	return _get(_dbColOptions, _branch, _revision).then(() => {
		return Promise.resolve(allRefs);
	});
};

schema.statics.findIssuesByModelName = function(dbColOptions, username, branch, revId, projection, noClean, ids, sortBy) {

	let issues;
	const self = this;
	let filter = {};

	let addRevFilter = Promise.resolve();

	if (ids) {
		ids.forEach((id, i) => {
			ids[i] = stringToUUID(id);
		});
	}

	let sort;

	if(sortBy === "activity") {
		sort = {sort: {"commentCount": -1}};
	} else if (sortBy === "view") {
		sort = {sort: {"viewCount": -1}};
	}  else if (sortBy === "createdDate") {
		sort = {sort: {"created": -1}};
	}

	// Why is branch not used here?
	if (revId) {

		let currHistory;
		addRevFilter = History.getHistory(dbColOptions, branch, revId).then(history => {

			if(!history) {
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

			if(histories.length > 0) {

				const history = histories[0];
				// backward comp: find all issues, without rev_id field, with timestamp just less than the next cloest revision
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

			if(histories.length > 0) {
				// for issues with rev_id, get all issues if rev_id in revIds
				const revIds = histories.map(h => h._id);

				filter = {
					"$or" : [filter, {
						rev_id: { "$in" : revIds }
					}]
				};
			}
		});
	}

	return addRevFilter.then(() => {

		if(ids) {
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

		if(!refs.length || (ids && ids.length === issues.length)) {
			return Promise.resolve(issues);
		} else {

			const promises = [];
			refs.forEach(ref => {
				const childDbName = ref.owner || dbColOptions.account;
				const childModel = ref.project;

				promises.push(
					middlewares.hasReadAccessToModelHelper(username, childDbName, childModel).then(granted => {
						if(granted) {

							const queryFilter = {};

							if(ids) {
								queryFilter._id = {
									"$in": ids
								};
							}

							return self._find({account: childDbName, model: childModel}, queryFilter, projection, sort, noClean)
								.then(subModelIssues => {
									return subModelIssues.map(issue => {
										issue.origin_account = childDbName;
										issue.origin_model = childModel;
										return issue;
									});
								});
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

schema.statics.getBCFZipReadStream = function(account, model, username, branch, revId, ids) {

	const zip = archiver.create("zip");

	zip.append(new Buffer.from(this.getModelBCF(model), "utf8"), {name: "model.bcf"})
		.append(new Buffer.from(this.getBCFVersion(), "utf8"), {name: "bcf.version"});

	const projection = {};
	const noClean = true;
	let settings;

	return ModelSetting.findById({account, model}, model).then(_settings => {

		settings = _settings;
		return this.findIssuesByModelName({account, model}, username, branch, revId, projection, noClean, ids);

	}).then(issues => {

		const bcfPromises = [];

		issues.forEach(issue => {

			const issueAccount = (issue.origin_account) ? issue.origin_account : account;
			const issueModel = (issue.origin_model) ? issue.origin_model : model;

			bcfPromises.push(
				issue.getBCFMarkup(issueAccount, issueModel, _.get(settings, "properties.unit")).then(bcf => {

					zip.append(new Buffer.from(bcf.markup, "utf8"), {name: `${uuidToString(issue._id)}/markup.bcf`});

					bcf.viewpoints.forEach(vp => {
						zip.append(new Buffer.from(vp.xml, "utf8"), {name: `${uuidToString(issue._id)}/${vp.filename}`});
					});

					bcf.snapshots.forEach(snapshot => {
						zip.append(snapshot.snapshot.buffer, {name: `${uuidToString(issue._id)}/${snapshot.filename}`});
					});

				})
			);
		});

		return Promise.all(bcfPromises).then(() => {
			zip.finalize();
			return Promise.resolve(zip);
		});
	});
};

schema.statics.findBySharedId = function(dbColOptions, sid, number) {

	const filter = { parent: stringToUUID(sid) };

	if(number) {
		filter.number = number;
	}

	return this._find(dbColOptions, filter).then(issues => {
		issues.forEach((issue, i) => {
			if(issue.scribble) {
				issues[i] = issue.scribble.toString("base64");
			}
		});

		return Promise.resolve(issues);
	});
};

schema.statics.findByUID = function(dbColOptions, uid, onlyStubs, noClean) {
	let settings;

	return ModelSetting.findById(dbColOptions, dbColOptions.model).then(_settings => {

		settings = _settings;
		return this.findById(dbColOptions, stringToUUID(uid));

	}).then(issue => {
		return Promise.resolve(noClean ? issue : issue.clean(_.get(settings, "type", ""), _.get(settings, "properties.code", "")));
	});
};

schema.statics.createIssue = function(dbColOptions, data) {

	const objectId = data.object_id;

	const promises = [];

	const issue = Issue.createInstance(dbColOptions);
	issue._id = stringToUUID(uuid.v1());

	if(!data.name) {
		return Promise.reject({ resCode: responseCodes.ISSUE_NO_NAME });
	}

	if(objectId) {
		promises.push(
			GenericObject.getSharedId(dbColOptions, objectId).then(sid => {
				issue.parent = stringToUUID(sid);
			})
		);
	}

	let branch;

	if (!data.revId) {
		branch = "master";
	}

	// assign rev_id for issue
	promises.push(History.getHistory(dbColOptions, branch, data.revId, {_id: 1}).then(history => {
		if(!history && data.revId) {
			return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
		} else if (history) {
			issue.rev_id = history._id;
		}
	}));

	return Promise.all(promises).then(() => {

		return Issue.count(dbColOptions);

	}).then(count => {

		issue.number  = count + 1;
		issue.object_id = objectId && stringToUUID(objectId);
		issue.name = data.name;
		issue.created = (new Date()).getTime();
		issue.owner = data.owner;
		issue.status = data.status;
		issue.topic_type = data.topic_type;
		if (data.desc && data.desc !== "") {
			issue.desc = data.desc;
		} else {
			issue.desc = "(No Description)";
		}
		issue.priority = data.priority;
		issue.group_id = data.group_id && stringToUUID(data.group_id);
		if (data.due_date) {
			issue.due_date = data.due_date;
		}

		if(data.viewpoint) {
			data.viewpoint.guid = utils.generateUUID();
			if (data.group_id || data.viewpoint.group_id) {
				data.viewpoint.group_id = stringToUUID(data.group_id);
			}
			if (data.viewpoint.highlighted_group_id) {
				data.viewpoint.highlighted_group_id = stringToUUID(data.viewpoint.highlighted_group_id);
			}
			if (data.viewpoint.hidden_group_id) {
				data.viewpoint.hidden_group_id = stringToUUID(data.viewpoint.hidden_group_id);
			}
			if (data.viewpoint.shown_group_id) {
				data.viewpoint.shown_group_id = stringToUUID(data.viewpoint.shown_group_id);
			}

			data.viewpoint.scribble && (data.viewpoint.scribble = {
				content: new Buffer.from(data.viewpoint.scribble, "base64"),
				flag: 1
			});

			if (data.viewpoint.screenshot) {
				data.viewpoint.screenshot = utils.createScreenshotEntry(data.viewpoint.screenshot);
			}

			issue.viewpoints.push(data.viewpoint);
		}

		issue.scale = data.scale || issue.scale;
		issue.position =  data.position || issue.position;
		issue.norm = data.norm || issue.norm;
		issue.creator_role = data.creator_role || issue.creator_role;
		issue.assigned_roles = data.assigned_roles || issue.assigned_roles;

		if(data.viewpoint && data.viewpoint.screenshot) {

			return utils.resizeAndCropScreenshot(data.viewpoint.screenshot.content, 120, 120, true).catch(err => {
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

		if(image) {
			issue.thumbnail = {
				flag: 1,
				content: image
			};
		}

		return issue.save().then(savedIssue => {

			return this.setGroupIssueId(dbColOptions, data, savedIssue._id);

		}).then(() => {
			return ModelSetting.findById(dbColOptions, dbColOptions.model);
		}).then(settings => {

			const cleaned = issue.clean(_.get(settings, "type", ""), _.get(settings, "properties.code", ""));
			ChatEvent.newIssues(data.sessionId, dbColOptions.account, dbColOptions.model, [cleaned]);

			return Promise.resolve(cleaned);
		});
	});
};

schema.statics.setGroupIssueId = function(dbColOptions, data, issueId) {

	const updateGroup = function(group_id) {
		return Group.updateIssueId(dbColOptions, group_id, issueId).then(group => {
			if(!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			} else {
				return Promise.resolve(group);
			}
		});
	};

	const groupUpdatePromises = [];

	if (data.group_id) {
		groupUpdatePromises.push(updateGroup(data.group_id));
	}

	if (data.viewpoint && data.viewpoint.highlighted_group_id) {
		groupUpdatePromises.push(updateGroup(data.viewpoint.highlighted_group_id));
	}

	if (data.viewpoint && data.viewpoint.hidden_group_id) {
		groupUpdatePromises.push(updateGroup(data.viewpoint.hidden_group_id));
	}

	if (data.viewpoint && data.viewpoint.shown_group_id) {
		groupUpdatePromises.push(updateGroup(data.viewpoint.shown_group_id));
	}

	if (data.viewpoints) {
		for (let i = 0; i < data.viewpoints.length; i++) {
			if (data.viewpoints[i].highlighted_group_id) {
				groupUpdatePromises.push(updateGroup(data.viewpoints[i].highlighted_group_id));
			}
			if (data.viewpoints[i].hidden_group_id) {
				groupUpdatePromises.push(updateGroup(data.viewpoints[i].hidden_group_id));
			}
			if (data.viewpoints[i].shown_group_id) {
				groupUpdatePromises.push(updateGroup(data.viewpoints[i].shown_group_id));
			}
		}
	}

	return Promise.all(groupUpdatePromises);
};

schema.statics.getScreenshot = function(dbColOptions, uid, vid) {

	return this.findById(dbColOptions, stringToUUID(uid), {
		viewpoints: { $elemMatch: { guid: stringToUUID(vid) } },
		"viewpoints.screenshot.resizedContent": 0
	}).then(issue => {

		if(!_.get(issue, "viewpoints[0].screenshot.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return issue.viewpoints[0].screenshot.content.buffer;
		}
	});
};

schema.statics.getSmallScreenshot = function(dbColOptions, uid, vid) {

	return this.findById(dbColOptions, stringToUUID(uid), {
		viewpoints: { $elemMatch: { guid: stringToUUID(vid) } }
	}).then(issue => {

		if (_.get(issue, "viewpoints[0].screenshot.resizedContent.buffer")) {

			return issue.viewpoints[0].screenshot.resizedContent.buffer;
		} else if(!_.get(issue, "viewpoints[0].screenshot.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {

			return utils.resizeAndCropScreenshot(issue.viewpoints[0].screenshot.content.buffer, 365).then(resized => {
				this.findOneAndUpdate(dbColOptions,
					{ _id: stringToUUID(uid), "viewpoints.guid": stringToUUID(vid)},
					{ "$set": { "viewpoints.$.screenshot.resizedContent": resized } }
				).catch(err => {
					systemLogger.logError("error while saving resized screenshot",{
						issueId: uid,
						viewpointId: vid,
						err: err
					});
				});

				return resized;
			});
		}
	});
};

schema.statics.getThumbnail = function(dbColOptions, uid) {

	return this.findById(dbColOptions, stringToUUID(uid), { thumbnail: 1 }).then(issue => {

		if(!_.get(issue, "thumbnail.content.buffer")) {
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			return issue.thumbnail.content.buffer;
		}
	});
};

schema.methods.updateComment = function(commentIndex, data) {

	const timeStamp = (new Date()).getTime();

	if((this.comments[commentIndex] && this.comments[commentIndex].sealed)) {
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_SEALED });
	}

	if(commentIndex === null || typeof commentIndex === "undefined") {

		const commentGuid = utils.generateUUID();
		let branch;

		if (!data.revId) {
			branch = "master";
		}

		// assign rev_id for issue
		return History.getHistory(this._dbcolOptions, branch, data.revId, {_id: 1}).then(history => {
			if(!history && data.revId) {
				return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
			} else {

				data.viewpoint = data.viewpoint || {};
				data.viewpoint.guid = utils.generateUUID();
				if (data.viewpoint.highlighted_group_id) {
					data.viewpoint.highlighted_group_id = stringToUUID(data.viewpoint.highlighted_group_id);
				}
				if (data.viewpoint.hidden_group_id) {
					data.viewpoint.hidden_group_id = stringToUUID(data.viewpoint.hidden_group_id);
				}
				if (data.viewpoint.shown_group_id) {
					data.viewpoint.shown_group_id = stringToUUID(data.viewpoint.shown_group_id);
				}

				if (data.viewpoint.screenshot) {
					data.viewpoint.screenshot = utils.createScreenshotEntry(data.viewpoint.screenshot);
				}

				data.viewpoint.scribble && (data.viewpoint.scribble = {
					content: new Buffer.from(data.viewpoint.scribble, "base64"),
					flag: 1
				});

				this.viewpoints.push(data.viewpoint);

				this.comments.forEach(comment => {
					if(!comment.sealed) {
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

			schema.statics.setGroupIssueId(this._dbcolOptions, data, issue._id);

			issue = issue.clean();
			const comment = issue.comments.find(c => c.guid === utils.uuidToString(commentGuid));
			const eventData = comment;

			ChatEvent.newComment(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, eventData);
			return comment;
		});

	} else {

		const commentObj = this.comments[commentIndex];

		if(!commentObj) {
			return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_INVALID_INDEX });
		}

		if(commentObj.owner !== data.owner && data.comment) {
			return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_PERMISSION_DECLINED });
		}

		if(isSystemComment(commentObj)) {
			return Promise.reject({ resCode: responseCodes.ISSUE_SYSTEM_COMMENT });

		}

		if(data.comment) {
			commentObj.comment = data.comment;
			commentObj.created = timeStamp;
		}

		commentObj.sealed = data.sealed || commentObj.sealed;

		return this.save().then(issue => {
			issue = issue.clean();

			const comment = issue.comments.find(c => c.guid === utils.uuidToString(commentObj.guid));
			const eventData = comment;

			ChatEvent.commentChanged(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, eventData);
			return comment;
		});
	}
};

function isSystemComment(comment) {

	return !_.isEmpty(comment.toObject().action);
}

schema.methods.removeComment = function(commentIndex, data) {

	const commentObj = this.comments[commentIndex];

	if(!commentObj) {
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_INVALID_INDEX });
	}

	if(commentObj.owner !== data.owner) {
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_PERMISSION_DECLINED });
	}

	if(this.comments[commentIndex].sealed) {
		return Promise.reject({ resCode: responseCodes.ISSUE_COMMENT_SEALED });
	}

	if(isSystemComment(this.comments[commentIndex])) {
		return Promise.reject({ resCode: responseCodes.ISSUE_SYSTEM_COMMENT });
	}

	const comment = this.clean().comments[commentIndex];
	this.comments[commentIndex].remove();

	return this.save().then(() => {

		const issue = this.clean();
		ChatEvent.commentDeleted(
			data.sessionId,
			this._dbcolOptions.account,
			this._dbcolOptions.model,
			issue._id, comment);

		return issue;
	});
};

schema.methods.isClosed = function() {
	return this.status === "closed" || this.closed;
};

schema.methods.addSystemComment = function(owner, property, from , to) {

	const timeStamp = (new Date()).getTime();
	const comment = {
		guid: utils.generateUUID(),
		created: timeStamp,
		action:{
			property, from, to
		},
		owner: owner
	};

	this.comments.push(comment);
	this.commentCount++;

	// seal the last comment if it is a human commnet after adding system comments
	const commentLen = this.comments.length;

	if(commentLen > 1 && !isSystemComment(this.comments[commentLen - 2])) {
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
		// force status change to in progress if assigned roles during status=for approval

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

	const statusExists = !forceStatusChanged && data.hasOwnProperty("status");

	if (statusExists) {

		// const invalidStatus = _.map(statusEnum).indexOf(data.status) === -1;
		// if (invalidStatus) {

		//	throw responseCodes.ISSUE_INVALID_STATUS;

		// } else {

		const statusHasChanged = data.status !== this.status;

		if(statusHasChanged) {

			const canChangeStatus = isAdmin ||
				hasOwnerJob ||
				(hasAssignedJob && data.status !== statusEnum.CLOSED);

			if (canChangeStatus) {

				// change status to for_approval if assigned roles is changed.
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

		// }
	}

	if(data.hasOwnProperty("priority")) {
		// if (_.map(priorityEnum).indexOf(data.priority) === -1){
		//
		//	throw responseCodes.ISSUE_INVALID_PRIORITY;
		//
		// } else
		if (data.priority !== this.priority) {

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

	if(data.hasOwnProperty("topic_type") && this.topic_type !== data.topic_type) {
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

	if (data.hasOwnProperty("due_date") && this.due_date !== data.due_date) {
		if(!(!data.due_date && !this.due_date)) {
			if(data.due_date === null) {
				data.due_date = undefined;
			}
			const canChangeStatus = isAdmin || hasOwnerJob;
			if (canChangeStatus) {
				systemComment = this.addSystemComment(data.owner, "due_date", this.due_date, data.due_date);
				this.due_date = data.due_date;
			} else {
				throw responseCodes.ISSUE_UPDATE_PERMISSION_DECLINED;
			}
		}

	}

	let settings;

	return ModelSetting.findById(this._dbcolOptions, this._dbcolOptions.model).then(_settings => {

		settings = _settings;
		return this.save();

	}).then(() => {

		const issue = this.clean(settings.type, settings.properties.code);
		ChatEvent.issueChanged(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, issue);
		ChatEvent.newComment(data.sessionId, this._dbcolOptions.account, this._dbcolOptions.model, issue._id, systemComment);

		return issue;
	});
};

schema.methods.clean = function(typePrefix, modelCode) {

	const cleaned = this.toObject();
	cleaned._id = uuidToString(cleaned._id);
	cleaned.typePrefix = typePrefix;
	cleaned.modelCode = modelCode;
	cleaned.parent = cleaned.parent ? uuidToString(cleaned.parent) : undefined;
	cleaned.account = this._dbcolOptions.account;
	cleaned.model = this._dbcolOptions.model;
	cleaned.rev_id && (cleaned.rev_id = uuidToString(cleaned.rev_id));
	cleaned.group_id = cleaned.group_id ? uuidToString(cleaned.group_id) : undefined;
	cleaned.viewpoints.forEach((vp, i) => {

		cleaned.viewpoints[i].guid = uuidToString(cleaned.viewpoints[i].guid);

		cleaned.viewpoints[i].group_id = cleaned.viewpoints[i].group_id ? uuidToString(cleaned.viewpoints[i].group_id) : undefined;
		cleaned.viewpoints[i].highlighted_group_id = cleaned.viewpoints[i].highlighted_group_id &&
			"[object String]" !== Object.prototype.toString.call(cleaned.viewpoints[i].highlighted_group_id) ?
			uuidToString(cleaned.viewpoints[i].highlighted_group_id) : undefined;
		cleaned.viewpoints[i].hidden_group_id = cleaned.viewpoints[i].hidden_group_id &&
			"[object String]" !== Object.prototype.toString.call(cleaned.viewpoints[i].hidden_group_id) ?
			uuidToString(cleaned.viewpoints[i].hidden_group_id) : undefined;
		cleaned.viewpoints[i].shown_group_id = cleaned.viewpoints[i].shown_group_id &&
			"[object String]" !== Object.prototype.toString.call(cleaned.viewpoints[i].shown_group_id) ?
			uuidToString(cleaned.viewpoints[i].shown_group_id) : undefined;

		if(_.get(cleaned, `viewpoints[${i}].screenshot.flag`)) {
			cleaned.viewpoints[i].screenshot = cleaned.account + "/" + cleaned.model + "/issues/" + cleaned._id + "/viewpoints/" + cleaned.viewpoints[i].guid + "/screenshot.png";
			cleaned.viewpoints[i].screenshotSmall = cleaned.account + "/" + cleaned.model + "/issues/" + cleaned._id + "/viewpoints/" + cleaned.viewpoints[i].guid + "/screenshotSmall.png";
		}
	});

	if(_.get(cleaned, "thumbnail.flag")) {
		cleaned.thumbnail = cleaned.account + "/" + cleaned.model + "/issues/" + cleaned._id + "/thumbnail.png";
	}

	cleaned.comments && cleaned.comments.forEach((comment, i) => {

		cleaned.comments[i].rev_id = comment.rev_id && (comment.rev_id = uuidToString(comment.rev_id));
		cleaned.comments[i].guid && (cleaned.comments[i].guid = uuidToString(cleaned.comments[i].guid));

		if(cleaned.comments[i].viewpoint) {

			const commentViewpoint = JSON.stringify(cleaned.viewpoints.find(vp => vp.guid === uuidToString(cleaned.comments[i].viewpoint)));
			if (commentViewpoint) {
				cleaned.comments[i].viewpoint = JSON.parse(commentViewpoint);
			}

			if(i > 0 && cleaned.comments[i - 1].viewpoint && cleaned.comments[i].viewpoint.guid === cleaned.comments[i - 1].viewpoint.guid) {
				// hide repeated screenshot if consecutive comments relate to the same viewpoint
				cleaned.comments[i].viewpoint.screenshot = null;
				cleaned.comments[i].viewpoint.screenshotSmall = null;
			}

		} else if (!isSystemComment(this.comments[i])) {
			// for all other non system comments
			cleaned.comments[i].viewpoint = cleaned.viewpoint;
		}
	});

	if(cleaned.comments &&
		cleaned.comments.length > 0 &&
		cleaned.viewpoints[0] &&
		cleaned.comments[0].viewpoint &&
		cleaned.comments[0].viewpoint.guid === cleaned.viewpoints[0].guid) {
		// hide repeated screenshot if issue viewpoint is the same as first comment's viewpoint
		cleaned.comments[0].viewpoint.screenshot = null;
		cleaned.comments[0].viewpoint.screenshotSmall = null;
	}

	if(cleaned.scribble) {
		cleaned.scribble = cleaned.scribble.toString("base64");
	}

	if(cleaned.viewpoints.length > 0) {
		cleaned.viewpoint = cleaned.viewpoints[0];
	}

	cleaned.viewpoints = undefined;

	return cleaned;
};

schema.methods.generateCommentsGUID = function() {

	this.comments.forEach(comment => {
		if(!comment.guid && !isSystemComment(comment)) {
			comment.guid = utils.generateUUID();
		}
		if(!comment.viewpoint && !isSystemComment(comment) && this.viewpoints.length > 0) {
			comment.viewpoint = this.viewpoints[0].guid;
		}
	});
};

schema.statics.isIssueAssignation = function(oldIssue, newIssue) {
	if (!oldIssue) {
		return newIssue.assigned_roles.length > 0; // In case this is a new issue with an assigned role
	}

	return oldIssue.assigned_roles[0] !== newIssue.assigned_roles[0];
};

schema.statics.isIssueBeingClosed = function(oldIssue, newIssue) {
	if (!oldIssue) {
		return false;
	}

	return oldIssue.status !== "closed" &&  newIssue.status === "closed";
};

schema.methods.getBCFMarkup = function(account, model, unit) {
	this.generateCommentsGUID();
	this.save();

	const viewpointEntries = [];
	const snapshotEntries = [];

	let scale = 1;

	if(unit === "dm") {
		scale = 0.1;
	} else if (unit === "cm") {
		scale = 0.01;
	} else if (unit === "mm") {
		scale = 0.001;
	} else if (unit === "ft") {
		scale = 0.3048;
	}

	const markup = {
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
				"Title": this.name,
				"Priority": this.priority,
				"CreationDate": moment(this.created).format(),
				"CreationAuthor": this.owner,
				"Description": this.desc
			},
			"Comment": [],
			"Viewpoints": []
		}
	};

	if (_.get(this, "due_date")) {
		markup.Markup.Topic.DueDate = moment(_.get(this, "due_date")).format();
	} else if (_.get(this, "extras.DueDate")) {
		markup.Markup.Topic.DueDate = _.get(this, "extras.DueDate"); // For backwards compatibility
	}

	this.topic_type && (markup.Markup.Topic["@"].TopicType = this.topic_type);

	_.get(this, "extras.Header") && (markup.Markup.Header = _.get(this, "extras.Header"));
	_.get(this, "extras.ReferenceLink") && (markup.Markup.Topic.ReferenceLink = _.get(this, "extras.ReferenceLink"));
	_.get(this, "extras.Index") && (markup.Markup.Topic.Index = _.get(this, "extras.Index"));
	_.get(this, "extras.Labels") && (markup.Markup.Topic.Labels = _.get(this, "extras.Labels"));
	_.get(this, "extras.ModifiedDate") && (markup.Markup.Topic.ModifiedDate = _.get(this, "extras.ModifiedDate"));
	_.get(this, "extras.ModifiedAuthor") && (markup.Markup.Topic.ModifiedAuthor = _.get(this, "extras.ModifiedAuthor"));
	_.get(this, "extras.AssignedTo") && (markup.Markup.Topic.AssignedTo = this.assigned_roles.toString());
	_.get(this, "extras.BimSnippet") && (markup.Markup.Topic.BimSnippet = _.get(this, "extras.BimSnippet"));
	_.get(this, "extras.DocumentReference") && (markup.Markup.Topic.DocumentReference = _.get(this, "extras.DocumentReference"));
	_.get(this, "extras.RelatedTopic") && (markup.Markup.Topic.RelatedTopic = _.get(this, "extras.RelatedTopic"));

	// add comments
	this.comments.forEach(comment => {

		if(isSystemComment(comment)) {
			return;
		}

		const commentXmlObj = {
			"@":{
				Guid: utils.uuidToString(comment.guid)
			},
			"Date": moment(comment.created).format(),
			"Author": comment.owner,
			"Comment": comment.comment,
			"Viewpoint": {
				"@": {Guid: utils.uuidToString(comment.viewpoint ? comment.viewpoint :	utils.generateUUID())}
			},
			// bcf 1.0 for back comp
			"Status": this.topic_type ? utils.ucFirst(this.topic_type.replace(/_/g, " ")) : "",
			"VerbalStatus": this.status ? this.status : (this.closed ? "closed" : "open")
		};

		_.get(comment, "extras.ModifiedDate") && (commentXmlObj.ModifiedDate = _.get(comment, "extras.ModifiedDate"));
		_.get(comment, "extras.ModifiedAuthor") && (commentXmlObj.ModifiedAuthor = _.get(comment, "extras.ModifiedAuthor"));

		markup.Markup.Comment.push(commentXmlObj);
	});

	const viewpointsPromises = [];

	// generate viewpoints
	let snapshotNo = 0;

	this.viewpoints.forEach((vp, index) => {

		const number = index === 0 ? "" : index;
		const viewpointFileName = `viewpoint${number}.bcfv`;
		const snapshotFileName = `snapshot${(snapshotNo === 0 ? "" : snapshotNo)}.png`;

		const vpObj = {
			"@": {
				"Guid": utils.uuidToString(vp.guid)
			},
			"Viewpoint": viewpointFileName,
			"Snapshot":  null
		};

		if(vp.screenshot.flag) {
			vpObj.Snapshot = snapshotFileName;
			snapshotEntries.push({
				filename: snapshotFileName,
				snapshot: vp.screenshot.content
			});
			snapshotNo++;
		}

		_.get(vp, "extras.Index") && (vpObj.Index = vp.extras.Index);

		markup.Markup.Viewpoints.push(vpObj);

		const viewpointXmlObj = {
			VisualizationInfo:{
				"@":{
					"Guid": utils.uuidToString(vp.guid),
					"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
					"xmlns:xsd": "http://www.w3.org/2001/XMLSchema"
				}
			}
		};

		if(!_.get(vp, "extras._noPerspective") && vp.position.length >= 3 && vp.view_dir.length >= 3 && vp.up.length >= 3) {

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

		if (_.get(vp, "extras.Components")) {
			// TODO: Consider if extras.Components should only be used if groups don't exist
			// TODO: Could potentially check each sub-property (ViewSetupHints, Selection, etc.
			viewpointXmlObj.VisualizationInfo.Components = _.get(vp, "extras.Components");
		}

		const componentsPromises = [];

		if (_.get(vp, "highlighted_group_id")) {
			const highlightedGroupId = _.get(vp, "highlighted_group_id");
			componentsPromises.push(
				Group.findIfcGroupByUID({account: account, model: model}, highlightedGroupId).then(group => {
					if (group && group.objects && group.objects.length > 0) {
						for (let i = 0; i < group.objects.length; i++) {
							const groupObject = group.objects[i];
							if (!viewpointXmlObj.VisualizationInfo.Components) {
								viewpointXmlObj.VisualizationInfo.Components = {};
							}
							if (!viewpointXmlObj.VisualizationInfo.Components.Selection) {
								viewpointXmlObj.VisualizationInfo.Components.Selection = {};
								viewpointXmlObj.VisualizationInfo.Components.Selection.Component = [];
							}
							for (let j = 0; groupObject.ifc_guids && j < groupObject.ifc_guids.length; j++) {
								viewpointXmlObj.VisualizationInfo.Components.Selection.Component.push({
									"@": {
										IfcGuid: groupObject.ifc_guids[j]
									},
									OriginatingSystem: "3D Repo"
								});
							}
						}
					}
				}).catch(()=> {
					// catching this error and ignoring - if we can't find the group, we should still export the issue.
					systemLogger.logInfo("Failed to find group - " + highlightedGroupId);
				})
			);
		}

		if (_.get(vp, "hidden_group_id")) {
			const hiddenGroupId = _.get(vp, "hidden_group_id");
			componentsPromises.push(
				Group.findIfcGroupByUID({account: account, model: model}, hiddenGroupId).then(group => {
					if (group && group.objects && group.objects.length > 0) {
						for (let i = 0; i < group.objects.length; i++) {
							const groupObject = group.objects[i];
							if (!viewpointXmlObj.VisualizationInfo.Components) {
								viewpointXmlObj.VisualizationInfo.Components = {};
							}
							if (!viewpointXmlObj.VisualizationInfo.Components.Visibility) {
								viewpointXmlObj.VisualizationInfo.Components.Visibility = {
									"@": {
										DefaultVisibility: true
									}
								};
								viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions = {};
								viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component = [];
							}
							for (let j = 0; groupObject.ifc_guids && j < groupObject.ifc_guids.length; j++) {
								viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component.push({
									"@": {
										IfcGuid: groupObject.ifc_guids[j]
									},
									OriginatingSystem: "3D Repo"
								});
							}
						}
					}
				}).catch(()=> {
					// catching this error and ignoring - if we can't find the group, we should still export the issue.
					systemLogger.logInfo("Failed to find group - " + hiddenGroupId);
				})
			);
		}

		if (_.get(vp, "shown_group_id")) {
			const shownGroupId = _.get(vp, "shown_group_id");
			componentsPromises.push(
				Group.findIfcGroupByUID({account: account, model: model}, shownGroupId).then(group => {
					if (group && group.objects && group.objects.length > 0) {
						for (let i = 0; i < group.objects.length; i++) {
							const groupObject = group.objects[i];
							if (!viewpointXmlObj.VisualizationInfo.Components) {
								viewpointXmlObj.VisualizationInfo.Components = {};
							}
							if (!viewpointXmlObj.VisualizationInfo.Components.Visibility) {
								viewpointXmlObj.VisualizationInfo.Components.Visibility = {
									"@": {
										DefaultVisibility: false
									}
								};
								viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions = {};
								viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component = [];
							}
							for (let j = 0; groupObject.ifc_guids && j < groupObject.ifc_guids.length; j++) {
								viewpointXmlObj.VisualizationInfo.Components.Visibility.Exceptions.Component.push({
									"@": {
										IfcGuid: groupObject.ifc_guids[j]
									},
									OriginatingSystem: "3D Repo"
								});
							}
						}
					}
				}).catch(()=> {
					// catching this error and ignoring - if we can't find the group, we should still export the issue.
					systemLogger.logInfo("Failed to find group - " + shownGroupId);
				})
			);
		}

		_.get(vp, "extras.Spaces") && (viewpointXmlObj.VisualizationInfo.Spaces = _.get(vp, "extras.Spaces"));
		_.get(vp, "extras.SpaceBoundaries") && (viewpointXmlObj.VisualizationInfo.SpaceBoundaries = _.get(vp, "extras.SpaceBoundaries"));
		_.get(vp, "extras.Openings") && (viewpointXmlObj.VisualizationInfo.Openings = _.get(vp, "extras.Openings"));
		_.get(vp, "extras.OrthogonalCamera") && (viewpointXmlObj.VisualizationInfo.OrthogonalCamera = _.get(vp, "extras.OrthogonalCamera"));
		_.get(vp, "extras.Lines") && (viewpointXmlObj.VisualizationInfo.Lines = _.get(vp, "extras.Lines"));
		_.get(vp, "extras.ClippingPlanes") && (viewpointXmlObj.VisualizationInfo.ClippingPlanes = _.get(vp, "extras.ClippingPlanes"));
		_.get(vp, "extras.Bitmap") && (viewpointXmlObj.VisualizationInfo.Bitmap = _.get(vp, "extras.Bitmap"));

		viewpointsPromises.push(
			Promise.all(componentsPromises).then(() => {
				viewpointEntries.push({
					filename: viewpointFileName,
					xml:  xmlBuilder.buildObject(viewpointXmlObj)
				});
			})
		);

	});

	return Promise.all(viewpointsPromises).then(() => {
		return {
			markup: xmlBuilder.buildObject(markup),
			viewpoints: viewpointEntries,
			snapshots: snapshotEntries
		};
	});
};

schema.statics.getBCFVersion = function() {

	return `
		<?xml version="1.0" encoding="UTF-8"?>
		<Version VersionId="2.0" xsi:noNamespaceSchemaLocation="version.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<DetailedVersion>2.0 RC</DetailedVersion>
		</Version>
	`;

};

schema.statics.getModelBCF = function(modelId) {

	const model = {
		ProjectExtension:{
			"@" : {
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xmlns:xsd": "http://www.w3.org/2001/XMLSchema"
			},
			"Project": {
				"@": { "ProjectId": modelId },
				"Name": modelId
			},
			"ExtensionSchema": {

			}
		}
	};

	return xmlBuilder.buildObject(model);
};

schema.statics.getIfcGuids = function(account, model) {
	return Meta.find({ account, model }, { type: "meta" }, { "metadata.IFC GUID": 1 })
		.then(ifcGuidResults => {
			return ifcGuidResults;
		});
};

schema.statics.importBCF = function(requester, account, model, revId, zipPath) {
	let settings;
	let branch;

	if (!revId) {
		branch = "master";
	}

	// assign revId for issue
	return History.getHistory({ account, model }, branch, revId, {_id: 1}).then(history => {
		if(!history) {
			return Promise.reject(responseCodes.MODEL_HISTORY_NOT_FOUND);
		} else if (history) {
			revId = history._id;
		}
	}).then(() => {

		return ModelSetting.findById({account, model}, model);

	}).then(_settings => {
		settings = _settings;

	}).then(() => {
		const ifcToModelMapPromises = [];
		const ifcToModelMap = [];

		if (settings.federate) {
			for (let i = 0; settings.subModels && i < settings.subModels.length; i++) {
				const subModelId = settings.subModels[i].model;
				ifcToModelMapPromises.push(
					this.getIfcGuids(account, subModelId).then(ifcGuidResults => {
						for (let j = 0; j < ifcGuidResults.length; j++) {
							ifcToModelMap[ifcGuidResults[j].metadata["IFC GUID"]] = subModelId;
						}
					})
				);
			}
		}

		return Promise.all(ifcToModelMapPromises).then(() => {
			return ifcToModelMap;
		});

	}).then(ifcToModelMap => {

		return new Promise((resolve, reject) => {

			const files = {};
			const promises = [];

			function handleZip(err, zipfile) {
				if(err) {
					return reject(err);
				}

				zipfile.readEntry();

				zipfile.on("entry", entry => handleEntry(zipfile, entry));

				zipfile.on("error", error => reject(error));

				zipfile.on("end", () => {

					let issueCounter;

					Issue.count({account, model}).then(count => {

						issueCounter = count;

					}).then(() => {

						return Promise.all(promises);

					}).then(() => {

						const createIssueProms = [];

						Object.keys(files).forEach(guid => {
							createIssueProms.push(createIssue(guid));
						});

						return Promise.all(createIssueProms);

					}).then(issues => {

						const saveIssueProms = [];

						// sort issues by date and add number
						issues = issues.sort((a, b) => {
							return a.created > b.created;
						});

						issues.forEach(issue => {
							saveIssueProms.push(
								Issue.findOne({account, model}, { _id: issue._id}).then(matchingIssue => {
									// System notification of BCF import
									const timeStamp = (new Date()).getTime();
									const bcfImportNotification = {
										guid: utils.generateUUID(),
										created: timeStamp,
										action: {property: "bcf_import"},
										owner: requester.user
									};

									if (!matchingIssue) {
										issue.number = ++issueCounter;
										// Set system notification of BCF import
										issue.comments.push(bcfImportNotification);
										return issue.save();
									} else {
										// Set system notification of BCF import
										matchingIssue.comments.push(bcfImportNotification);

										// Replace following attributes if they do not exist
										const simpleAttrs = ["priority", "status", "topic_type", "due_date", "desc"];
										for (const simpleAttrIndex in simpleAttrs) {
											const simpleAttr = simpleAttrs[simpleAttrIndex];
											if (undefined !== issue[simpleAttr]
												&& (undefined === matchingIssue[simpleAttr] || issue[simpleAttr] !== matchingIssue[simpleAttr])) {
												matchingIssue.comments.push({
													guid: utils.generateUUID(),
													created: timeStamp,
													action: {property: simpleAttr, from: matchingIssue[simpleAttr], to: issue[simpleAttr]},
													owner: requester.user + "(BCF Import)"
												});
												matchingIssue[simpleAttr] = issue[simpleAttr];
											}
										}

										// Attempt to merge following attributes and sort by created desc
										const complexAttrs = ["comments", "viewpoints"];
										for (const complexAttrIndex in complexAttrs) {
											const complexAttr = complexAttrs[complexAttrIndex];
											for (let i = 0; i < issue[complexAttr].length; i++) {
												if (-1 === matchingIssue[complexAttr].findIndex(attr =>
													utils.uuidToString(attr.guid) === utils.uuidToString(issue[complexAttr][i].guid))) {
													matchingIssue[complexAttr].push(issue[complexAttr][i]);
												} else {
													// TODO: Consider deleting duplicate groups in issue[complexAttr][i]
												}
											}
											if (matchingIssue[complexAttr].length > 0 && matchingIssue[complexAttr][0].created) {
												matchingIssue[complexAttr] = matchingIssue[complexAttr].sort((a, b) => {
													return a.created > b.created;
												});
											}
										}
										return Issue.update({account, model}, { _id: issue._id}, matchingIssue).then(() => {
											return matchingIssue;
										});
									}
								})
							);
						});

						return Promise.all(saveIssueProms);

					}).then(savedIssues => {

						const notifications = [];

						savedIssues.forEach(issue => {
							schema.statics.setGroupIssueId({account, model}, issue, issue._id);

							if (issue && issue.clean) {
								notifications.push(issue.clean(settings.type));
							}
						});

						if(notifications.length) {
							ChatEvent.newIssues(requester.socketId, account, model, notifications);
						}

						resolve();

					}).catch(error => {
						reject(error);
					});
				});

			}

			function parseViewpoints(issueGuid, issueFiles, vps) {

				const viewpoints = {};
				const vpPromises = [];

				vps && vps.forEach(vp => {

					if(!_.get(vp, "@.Guid")) {
						return;
					}

					const vpFile = issueFiles[`${issueGuid}/${_.get(vp, "Viewpoint[0]._")}`];

					viewpoints[vp["@"].Guid] = {
						snapshot: issueFiles[`${issueGuid}/${_.get(vp, "Snapshot[0]._")}`]
					};

					vpFile && vpPromises.push(parseXmlString(vpFile.toString("utf8"), {explicitCharkey: 1, attrkey: "@"}).then(xml => {
						viewpoints[vp["@"].Guid].viewpointXml = xml;
						viewpoints[vp["@"].Guid].Index = _.get(vp, "Index");
						viewpoints[vp["@"].Guid].Viewpoint = _.get(vp, "Viewpoint");
						viewpoints[vp["@"].Guid].Snapshot = _.get(vp, "Snapshot");
					}));

				});

				return Promise.all(vpPromises).then(() => viewpoints);
			}

			function sanitise(data, list) {
				if (!data) {
					return data;
				}

				const dataSanitised = data.toLowerCase();
				if(_.map(list).indexOf(dataSanitised) === -1) {
					return data;
				}
				return dataSanitised;

			}

			function createGroupData(groupObject) {

				const groupData = {};

				groupData.name = groupObject.name;
				groupData.color = groupObject.color;

				for (const groupAccount in groupObject.objects) {
					for (const groupModel in groupObject.objects[groupAccount]) {
						if (!groupData.objects) {
							groupData.objects = [];
						}

						groupData.objects.push({
							groupAccount,
							groupModel,
							ifc_guids: groupObject.objects[groupAccount][groupModel].ifc_guids
						});
					}
				}

				return groupData;
			}

			function createGroupObject(group, name, color, groupAccount, groupModel, ifc_guid) {

				if (groupAccount && groupModel && ifc_guid) {
					if (!group) {
						group = {};
					}

					if (name) {
						group.name = name;
					}

					if (color) {
						group.color = color;
					}

					if (!group.objects) {
						group.objects = {};
					}

					if (!group.objects[groupAccount]) {
						group.objects[groupAccount] = {};
					}

					if (!group.objects[groupAccount][groupModel]) {
						group.objects[groupAccount][groupModel] = { ifc_guids: [] };
					}

					group.objects[groupAccount][groupModel].ifc_guids.push(ifc_guid);
				}

				return group;
			}

			function createIssue(guid) {

				const issueFiles = files[guid];
				const markupBuf = issueFiles[`${guid}/markup.bcf`];
				let xml;
				let issue;

				if(!markupBuf) {
					return Promise.resolve();
				}

				return parseXmlString(markupBuf.toString("utf8"), {explicitCharkey: 1, attrkey: "@"}).then(_xml => {

					xml = _xml;

					issue = Issue.createInstance({account, model});
					issue._id = stringToUUID(guid);
					issue.extras = {};
					issue.rev_id = revId;

					if(xml.Markup) {

						issue.extras.Header = _.get(xml, "Markup.Header");
						issue.topic_type = _.get(xml, "Markup.Topic[0].@.TopicType");
						issue.status = sanitise(_.get(xml, "Markup.Topic[0].@.TopicStatus"), statusEnum);
						if(!issue.status || issue.status === "") {
							issue.status = "open";
						}
						issue.extras.ReferenceLink = _.get(xml, "Topic[0].ReferenceLink");
						issue.name = _.get(xml, "Markup.Topic[0].Title[0]._");
						issue.priority =  sanitise(_.get(xml, "Markup.Topic[0].Priority[0]._"), priorityEnum);
						issue.extras.Index =  _.get(xml, "Markup.Topic[0].Index[0]._");
						issue.extras.Labels =  _.get(xml, "Markup.Topic[0].Labels[0]._");
						issue.created = moment(_.get(xml, "Markup.Topic[0].CreationDate[0]._")).format("x");
						issue.owner = _.get(xml, "Markup.Topic[0].CreationAuthor[0]._");
						issue.extras.ModifiedDate = _.get(xml, "Markup.Topic[0].ModifiedDate[0]._");
						issue.extras.ModifiedAuthor = _.get(xml, "Markup.Topic[0].ModifiedAuthor[0]._");
						if (_.get(xml, "Markup.Topic[0].DueDate[0]._")) {
							issue.due_date = moment(_.get(xml, "Markup.Topic[0].DueDate[0]._")).format("x");
						}
						if(_.get(xml, "Markup.Topic[0].AssignedTo[0]._")) {
							issue.assigned_roles = _.get(xml, "Markup.Topic[0].AssignedTo[0]._").split(",");
						}
						issue.desc = (_.get(xml, "Markup.Topic[0].Description[0]._")) ? _.get(xml, "Markup.Topic[0].Description[0]._") : "(No Description)";
						issue.extras.BimSnippet = _.get(xml, "Markup.Topic[0].BimSnippet");
						issue.extras.DocumentReference = _.get(xml, "Markup.Topic[0].DocumentReference");
						issue.extras.RelatedTopic = _.get(xml, "Markup.Topic[0].RelatedTopic");
						issue.markModified("extras");

					}

					_.get(xml ,"Markup.Comment") && xml.Markup.Comment.forEach(comment => {
						const obj = {
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

					const vpGuids = Object.keys(viewpoints);

					vpGuids.forEach(vpGuid => {

						const groupPromises = [];

						if(!viewpoints[vpGuid].viewpointXml) {
							return;
						}

						const extras = {};
						const vpXML = viewpoints[vpGuid].viewpointXml;

						extras.Spaces = _.get(vpXML, "VisualizationInfo.Spaces");
						extras.SpaceBoundaries = _.get(vpXML, "VisualizationInfo.SpaceBoundaries");
						extras.Openings = _.get(vpXML, "VisualizationInfo.Openings");
						extras.OrthogonalCamera = _.get(vpXML, "VisualizationInfo.OrthogonalCamera");
						extras.Lines = _.get(vpXML, "VisualizationInfo.Lines");
						extras.Bitmap = _.get(vpXML, "VisualizationInfo.Bitmap");
						extras.Index = viewpoints[vpGuid].Viewpoint;
						extras.Snapshot = viewpoints[vpGuid].Snapshot;
						!_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0]") && (extras._noPerspective = true);

						const screenshotObj = viewpoints[vpGuid].snapshot ? {
							flag: 1,
							content: viewpoints[vpGuid].snapshot
						} : undefined;

						const vp = {
							guid: utils.stringToUUID(vpGuid),
							extras: extras,
							screenshot: screenshotObj

						};

						let scale = 1;
						const unit = _.get(settings, "properties.unit");
						if (unit === "dm") {
							scale = 10;
						} else if (unit === "cm") {
							scale = 100;
						} else if (unit === "mm") {
							scale = 1000;
						} else if (unit === "ft") {
							scale = 3.28084;
						}

						if(_.get(vpXML, "VisualizationInfo.ClippingPlanes")) {
							const clippingPlanes =	_.get(vpXML, "VisualizationInfo.ClippingPlanes");
							const planes = [];
							if(clippingPlanes[0].ClippingPlane) {
								for(let clipIdx = 0; clipIdx < clippingPlanes[0].ClippingPlane.length; ++clipIdx) {
									const fieldName = "VisualizationInfo.ClippingPlanes[0].ClippingPlane[" + clipIdx + "]";
									const clip = {};
									clip.normal = [
										parseFloat(_.get(vpXML, fieldName + ".Direction[0].X[0]._")),
										parseFloat(_.get(vpXML, fieldName + ".Direction[0].Z[0]._")),
										-parseFloat(_.get(vpXML, fieldName + ".Direction[0].Y[0]._"))
									];
									const position = [
										parseFloat(_.get(vpXML, fieldName + ".Location[0].X[0]._")) * scale,
										parseFloat(_.get(vpXML, fieldName + ".Location[0].Z[0]._")) * scale,
										-parseFloat(_.get(vpXML, fieldName + ".Location[0].Y[0]._")) * scale
									];

									clip.distance = - (position[0] * clip.normal[0]
										+ position[1] * clip.normal[1]
										+ position[2] * clip.normal[2]);

									clip.clipDirection = 1;
									planes.push(clip);
								}
							}

							vp.clippingPlanes = planes;

						}

						if(_.get(vpXML, "VisualizationInfo.PerspectiveCamera[0]")) {
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

						} else if (_.get(vpXML, "VisualizationInfo.OrthogonalCamera[0]")) {

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

						if (_.get(vpXML, "VisualizationInfo.Components")) {
							const groupDbCol = {
								account: account,
								model: model
							};

							const vpComponents = _.get(vpXML, "VisualizationInfo.Components");

							for (let i = 0; i < vpComponents.length; i++) {

								let highlightedGroupObject;

								// TODO: refactor to reduce duplication?
								if (vpComponents[i].Selection) {

									for (let j = 0; j < vpComponents[i].Selection.length; j++) {
										for (let k = 0; vpComponents[i].Selection[j].Component && k < vpComponents[i].Selection[j].Component.length; k++) {
											let objectModel = model;

											if (settings.federate) {
												objectModel = ifcToModelMap[vpComponents[i].Selection[j].Component[k]["@"].IfcGuid];
											}

											highlightedGroupObject = createGroupObject(
												highlightedGroupObject,
												issue.name,
												[255, 0, 0],
												account,
												objectModel,
												vpComponents[i].Selection[j].Component[k]["@"].IfcGuid
											);
										}
									}

								}
								if (vpComponents[i].Coloring) {
									// FIXME: this is essentially copy of selection with slight modification. Should merge common code.
									for (let j = 0; j < vpComponents[i].Coloring.length; j++) {
										for (let k = 0; vpComponents[i].Coloring[j].Color && k < vpComponents[i].Coloring[j].Color.length; k++) {
											for (let compIdx = 0; vpComponents[i].Coloring[j].Color[k].Component && compIdx < vpComponents[i].Coloring[j].Color[k].Component.length; compIdx++) {
											// const color = vpComponents[i].Coloring[j].Color[k]["@"].Color; // TODO: colour needs to be preserved at some point in the future
												let objectModel = model;

												if (settings.federate) {
													objectModel = ifcToModelMap[vpComponents[i].Coloring[j].Color[k].Component[compIdx]["@"].IfcGuid];
												}

												highlightedGroupObject = createGroupObject(
													highlightedGroupObject,
													issue.name,
													[255, 0, 0],
													account,
													objectModel,
													vpComponents[i].Coloring[j].Color[k].Component[compIdx]["@"].IfcGuid
												);
											}
										}
									}

								}

								let highlightedGroupData;
								let highlightedObjectsMap;

								if (highlightedGroupObject) {
									highlightedGroupData = createGroupData(highlightedGroupObject);
									groupPromises.push(
										Group.createGroup(groupDbCol, highlightedGroupData).then(group => {
											vp.highlighted_group_id = utils.stringToUUID(group._id);
										})
									);

									highlightedObjectsMap = highlightedGroupData.objects.reduce((acc, val) => acc.concat(val.ifc_guids), []);
								}

								if (vpComponents[i].Visibility) {
									let hiddenGroupObject;
									let shownGroupObject;

									for (let j = 0; j < vpComponents[i].Visibility.length; j++) {
										const defaultVisibility = JSON.parse(vpComponents[i].Visibility[j]["@"].DefaultVisibility);
										let componentsToHide = [];
										let componentsToShow = [];

										if (defaultVisibility) {
											componentsToShow = vpComponents[i].Visibility[j].Component;
											if (vpComponents[i].Visibility[j].Exceptions) {
												componentsToHide = vpComponents[i].Visibility[j].Exceptions[0].Component;
											}
										} else {
											componentsToHide = vpComponents[i].Visibility[j].Component;
											if (vpComponents[i].Visibility[j].Exceptions) {
												componentsToShow = vpComponents[i].Visibility[j].Exceptions[0].Component;
											}
										}

										for (let k = 0; componentsToHide && k < componentsToHide.length; k++) {
											let objectModel = model;

											if (settings.federate) {
												objectModel = ifcToModelMap[componentsToHide[k]["@"].IfcGuid];
											}

											// Exclude items selected
											if (highlightedObjectsMap && -1 === highlightedObjectsMap.indexOf(componentsToHide[k]["@"].IfcGuid)) {
												hiddenGroupObject = createGroupObject(
													hiddenGroupObject,
													issue.name,
													[255, 0, 0],
													account,
													objectModel,
													componentsToHide[k]["@"].IfcGuid
												);
											}
										}

										for (let k = 0; componentsToShow && k < componentsToShow.length; k++) {
											let objectModel = model;

											if (settings.federate) {
												objectModel = ifcToModelMap[componentsToShow[k]["@"].IfcGuid];
											}

											shownGroupObject = createGroupObject(
												shownGroupObject,
												issue.name,
												[255, 0, 0],
												account,
												objectModel,
												componentsToShow[k]["@"].IfcGuid
											);
										}
									}

									// TODO: May need a better way to combine hidden/shown
									// as it is not ideal to save both hidden and shown objects
									if (shownGroupObject) {
										const shownGroupData = createGroupData(shownGroupObject);

										if (highlightedGroupData) {
											shownGroupData.objects = shownGroupData.objects.concat(highlightedGroupData.objects);
										}

										groupPromises.push(
											Group.createGroup(groupDbCol, shownGroupData).then(group => {
												vp.shown_group_id = utils.stringToUUID(group._id);
											})
										);
									} else if (hiddenGroupObject) {
										groupPromises.push(
											Group.createGroup(groupDbCol, createGroupData(hiddenGroupObject)).then(group => {
												vp.hidden_group_id = utils.stringToUUID(group._id);
											})
										);
									}
								}

								if (vpComponents[i].ViewSetupHints) {
									// TODO: Full ViewSetupHints support -
									// SpaceVisible should correspond to !hideIfc
									vp.extras.ViewSetupHints = vpComponents[i].ViewSetupHints;
									systemLogger.logInfo("ViewSetupHints not fully supported for BCF import!");
								}
							}
						}

						Promise.all(groupPromises).then(() => {
							issue.viewpoints.push(vp);
						});
					});

					// take the first screenshot as thumbnail
					if(vpGuids.length > 0) {

						return utils.resizeAndCropScreenshot(viewpoints[vpGuids[0]].snapshot, 120, 120, true).catch(err => {

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

					if(image) {
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

				if(entry.fileName.indexOf("\\") !== -1) {
					// give tolerance to file path using \ instead of /
					paths = entry.fileName.split("\\");
				} else {
					paths = entry.fileName.split("/");
				}

				const guid = paths[0] && utils.isUUID(paths[0]) && paths[0];

				if(guid && !files[guid]) {
					files[guid] = {};
				}

				// if entry is a file and start with guid
				if(!entry.fileName.endsWith("/") && !entry.fileName.endsWith("\\") && guid) {

					promises.push(new Promise((_resolve, _reject) => {
						zipfile.openReadStream(entry, (err, rs) => {
							if(err) {
								return _reject(err);
							} else {

								const bufs = [];

								rs.on("data", d => bufs.push(d));

								rs.on("end", () => {
									const buf = Buffer.concat(bufs);
									files[guid][paths.join("/")] = buf;
									_resolve();
								});

								rs.on("error", error =>{
									_reject(error);
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

const Issue = ModelFactory.createClass(
	"Issue",
	schema,
	arg => {
		return `${arg.model}.issues`;
	}
);

module.exports = Issue;
