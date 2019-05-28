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

const utils = require("../utils");
const uuid = require("node-uuid");
const responseCodes = require("../response_codes.js");

const ModelSetting = require("./modelSetting");
const History = require("./history");
const Ref = require("./ref");
const _ = require("lodash");

const ChatEvent = require("./chatEvent");

const systemLogger = require("../logger.js").systemLogger;
const Group = require("./group");
const Meta = require("./meta");
const C = require("../constants");

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

schema.statics.getIssuesReport = function(account, model, username, rid, issueIds, res) {
	const dbCol = { account, model};

	const projection = {
		extras: 0,
		"viewpoints.extras": 0,
		"viewpoints.scribble": 0,
		"viewpoints.screenshot.content": 0,
		"viewpoints.screenshot.resizedContent": 0,
		"thumbnail.content": 0
	};

	const branch = rid ? null : "master";

	const reportGen = require("../models/report").newIssuesReport(account, model, rid);
	return Issue.findIssuesByModelName(dbCol, username, branch, rid, projection, false, issueIds).then(issues => {
		reportGen.addEntries(issues);
		return reportGen.generateReport(res);
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
				const middlewares = require("../middlewares/middlewares");
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

	const promises = [];

	const issue = Issue.createInstance(dbColOptions);
	issue._id = stringToUUID(uuid.v1());

	if(!data.name) {
		return Promise.reject({ resCode: responseCodes.ISSUE_NO_NAME });
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

schema.statics.isIssueAssignment = function(oldIssue, newIssue) {
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

schema.statics.getIfcGuids = function(account, model) {
	return Meta.find({ account, model }, { type: "meta" }, { "metadata.IFC GUID": 1 })
		.then(ifcGuidResults => {
			return ifcGuidResults;
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
