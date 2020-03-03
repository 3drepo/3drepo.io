/**
 *	Copyright (C) 2019 3D Repo Ltd
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
const _ = require("lodash");

const Project = require("./project");
const Viewpoint = require("./viewpoint");
const User = require("./user");
const Job = require("./job");
const Group = require("./group");
const History = require("./history");

const ModelSetting = require("./modelSetting");

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const C = require("../constants");
const db = require("../handler/db");

const ChatEvent = require("./chatEvent");
const { systemLogger } = require("../logger.js");

const nodeuuid = require("uuid/v1");
const Comment = require("./comment");

const FileRef = require("./fileRef");
const config = require("../config.js");
const extensionRe = /\.(\w+)$/;

const getResponse = (responseCodeType) => (type) => responseCodes[responseCodeType + "_" + type];

class Ticket {
	constructor(collName, groupField, refIdsField, responseCodeType, fieldTypes, ownerPrivilegeAttributes) {
		this.collName = collName;
		this.response = getResponse(responseCodeType);
		this.fieldTypes = fieldTypes;
		this.ownerPrivilegeAttributes = ownerPrivilegeAttributes;
		this.groupField = groupField;
		this.refIdsField = refIdsField;
	}

	clean(account, model, ticketToClean) {
		const idKeys = ["_id", "rev_id", "parent", "group_id"];
		const commentIdKeys = ["rev_id", "guid", "viewpoint"];
		const vpIdKeys = ["hidden_group_id", "highlighted_group_id", "shown_group_id", "guid", "group_id"];

		ticketToClean.account = account;
		model = ticketToClean.model || ticketToClean.origin_model ||  model;
		ticketToClean.model = model;

		const id = utils.uuidToString(ticketToClean._id);

		idKeys.concat(vpIdKeys).forEach((key) => {
			if (ticketToClean[key]) {
				ticketToClean[key] = utils.uuidToString(ticketToClean[key]);
			}
		});

		if (ticketToClean.viewpoints) {
			ticketToClean.viewpoints.forEach((viewpoint, i) => {
				vpIdKeys.forEach((key) => {
					if (viewpoint[key]) {
						viewpoint[key] = utils.uuidToString(viewpoint[key]);
					}
				});

				if (viewpoint.screenshot) {
					Viewpoint.setViewpointScreenshot(this.collName, account, model, id, viewpoint);
				}

				if (0 === i) {
					ticketToClean.viewpoint = viewpoint;
				}
			});
		}

		if (ticketToClean.comments) {
			ticketToClean.comments.forEach((comment) => {
				commentIdKeys.forEach((key) => {
					if (comment[key] && _.isObject(comment[key]) && !comment[key].hasOwnProperty("up")) {
						comment[key] = utils.uuidToString(comment[key]);
					}
				});

				if (comment.viewpoint) {
					const commentViewpoint = ticketToClean.viewpoints.find((vp) =>
						vp.guid === comment.viewpoint
					);

					comment.viewpoint = commentViewpoint || undefined;
				}
			});
		}

		if (ticketToClean.thumbnail && ticketToClean.thumbnail.flag) {
			ticketToClean.thumbnail = account + "/" + model + "/" + this.collName + "/" + id + "/thumbnail.png";
		} else {
			ticketToClean.thumbnail = undefined;
		}

		// Return empty arrays as frontend expects them
		// Return empty objects as frontend expects them
		Object.keys(this.fieldTypes).forEach((field) => {
			if (!ticketToClean[field]) {
				if ("[object Array]" === this.fieldTypes[field]) {
					ticketToClean[field] = [];
				} else if ("[object Object]" === this.fieldTypes[field] && field !== "thumbnail") {
					ticketToClean[field] = {};
				}
			}
		});

		delete ticketToClean.viewpoints;
		delete ticketToClean.viewCount;

		return ticketToClean;
	}

	getTicketsCollection(account, model) {
		return db.getCollection(account, model + "." + this.collName);
	}

	async findByUID(account, model, uid, projection, noClean = false) {
		if ("[object String]" === Object.prototype.toString.call(uid)) {
			uid = utils.stringToUUID(uid);
		}

		const tickets = await this.getTicketsCollection(account, model);
		const foundTicket = await tickets.findOne({ _id: uid }, projection);

		if (!foundTicket) {
			return Promise.reject(this.response("NOT_FOUND"));
		}

		if(foundTicket.refs) {
			const refsColl = await db.getCollection(account, model + ".resources.ref");
			const resources = await refsColl.find({ _id: { $in: foundTicket.refs } }, {name:1, size: 1, createdAt: 1, link: 1, type: 1}).toArray();
			resources.forEach(r => {
				if(r.type !== "http") {
					delete r.link;
				}

				delete r.type;
			});

			foundTicket.resources = resources;
			delete foundTicket.refs;
		}

		if (!noClean) {
			return this.clean(account, model, foundTicket);
		}

		return foundTicket;
	}

	createSystemComment(account, model, sessionId, ticketId, owner, property, oldValue, newValue) {
		const systemComment = Comment.newSystemComment(
			owner,
			property,
			oldValue,
			newValue
		);

		ChatEvent.newComment(sessionId, account, model, ticketId, systemComment);
		return systemComment;
	}

	async update(attributeBlacklist, user, sessionId, account, model, id, data, beforeUpdate = _.identity) {
		const results = await Promise.all([
			// 1. Get old ticket
			this.findByUID(account, model, id, {}, true),
			// 2. Get user permissions
			User.findByUserName(account),
			Job.findByUser(account, user),
			Project.isProjectAdmin(
				account,
				model,
				user
			)
		]);

		let [
			oldTicket,
			// eslint-disable-next-line prefer-const
			dbUser,
			// eslint-disable-next-line prefer-const
			job,
			// eslint-disable-next-line prefer-const
			projAdmin
		] = results;

		job = (job || {})._id;

		const accountPerm = dbUser.customData.permissions.findByUser(user);
		const tsAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
		const isAdmin = projAdmin || tsAdmin;
		const hasOwnerJob = oldTicket.creator_role === job;
		const hasAdminPrivileges = isAdmin || hasOwnerJob;
		const hasAssignedJob = job === oldTicket.assigned_roles[0];
		const userPermissions = { hasAdminPrivileges,	hasAssignedJob };

		// 2.5 if the user dont have the necessary permissions to update the ticket throw a UPDATE_PERMISSION_DECLINED
		if (this.ownerPrivilegeAttributes.some(attr => !!data[attr]) && !userPermissions.hasAdminPrivileges) {
			throw this.response("UPDATE_PERMISSION_DECLINED");
		}

		// 3. Filter out blacklisted attributes and leave proper attrs
		data = this.filterFields(data, attributeBlacklist);

		if (_.isEmpty(data)) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		// 5. Add system comments
		const systemComments = [];
		const fields = Object.keys(data);

		fields.forEach(field=> {
			if (Object.prototype.toString.call(data[field]) !== this.fieldTypes[field]) {
				throw responseCodes.INVALID_ARGUMENTS;
			}

			// if a field have the same value shouldnt update the property
			if (_.isEqual(field[field], data[field])) {
				delete data[field];
				return;
			}

			// update of extras must not create a system comment
			if(field === "extras") {
				return;
			}

			const comment = this.createSystemComment(
				account,
				model,
				sessionId,
				id,
				user,
				field,
				oldTicket[field],
				data[field]);

			systemComments.push(comment);
		});

		data = await beforeUpdate(data, oldTicket, userPermissions, systemComments);

		if (systemComments.length > 0) {
			data.comments = (oldTicket.comments || []).map(c=> ({...c,sealed:true}));
			data.comments = data.comments.concat(systemComments);
		}

		// 6. Update the data
		const _id = utils.stringToUUID(id);

		const tickets = await this.getTicketsCollection(account, model);
		await tickets.update({_id}, {$set: data});

		// 7. Return the updated data and the old ticket
		const updatedTicket =  this.clean(account, model,{...oldTicket, ...data});
		oldTicket = this.clean(account, model, oldTicket);
		delete data.comments;

		return {oldTicket, updatedTicket, data};
	}

	filterFields(data, blackList) {
		data = _.omit(data, blackList);
		return _.pick(data, Object.keys(this.fieldTypes));
	}

	setGroupTicketId(account, model, newTicket) {
		const groupField =  this.groupField;

		const updateGroup = (group_id) => {
			// TODO - Do we need to find group first? Can we just patch
			return Group.findByUID({account, model}, utils.uuidToString(group_id), null, utils.uuidToString(newTicket.rev_id)).then((group) => {
				const ticketIdData = {
					[groupField] :  utils.stringToUUID(newTicket._id)
				};

				return group.updateAttrs({account, model}, ticketIdData);
			});
		};

		const groupUpdatePromises = [];

		if (newTicket.viewpoint) {
			if (newTicket.viewpoint.highlighted_group_id) {
				groupUpdatePromises.push(updateGroup(newTicket.viewpoint.highlighted_group_id));
			}

			if (newTicket.viewpoint.hidden_group_id) {
				groupUpdatePromises.push(updateGroup(newTicket.viewpoint.hidden_group_id));
			}

			if (newTicket.viewpoint.shown_group_id) {
				groupUpdatePromises.push(updateGroup(newTicket.viewpoint.shown_group_id));
			}
		}

		return Promise.all(groupUpdatePromises);
	}

	/*
	* @param {string} account
	* @param {string} model
	* @param {object} newTicket
	*/
	async create(account, model, newTicket) {
		// const sessionId = newTicket.sessionId;
		if (!newTicket.name) {
			return Promise.reject({ resCode: responseCodes.INVALID_ARGUMENTS });
		}

		const branch = newTicket.revId || "master";
		newTicket.assigned_roles = newTicket.assigned_roles || [];
		newTicket._id = utils.stringToUUID(newTicket._id || nodeuuid());
		newTicket.created = parseInt(newTicket.created || (new Date()).getTime());
		const ownerJob = await Job.findByUser(account, newTicket.owner);
		if (ownerJob) {
			newTicket.creator_role = ownerJob._id;
		} else {
			delete newTicket.creator_role;
		}
		newTicket.desc = newTicket.desc || "(No Description)";
		let imagePromise = Promise.resolve();
		newTicket.viewpoint = newTicket.viewpoint || {};
		newTicket.viewpoint.guid = utils.generateUUID();

		if (newTicket.viewpoint.highlighted_group_id) {
			newTicket.viewpoint.highlighted_group_id = utils.stringToUUID(newTicket.viewpoint.highlighted_group_id);
		}

		if (newTicket.viewpoint.hidden_group_id) {
			newTicket.viewpoint.hidden_group_id = utils.stringToUUID(newTicket.viewpoint.hidden_group_id);
		}

		if (newTicket.viewpoint.shown_group_id) {
			newTicket.viewpoint.shown_group_id = utils.stringToUUID(newTicket.viewpoint.shown_group_id);
		}

		if (newTicket.viewpoint.screenshot) {
			newTicket.viewpoint.screenshot = {
				content: new Buffer.from(newTicket.viewpoint.screenshot, "base64"),
				flag: 1
			};

			imagePromise = utils.resizeAndCropScreenshot(newTicket.viewpoint.screenshot.content, 120, 120, true).catch((err) => {
				systemLogger.logError("Resize failed as screenshot is not a valid png, no thumbnail will be generated", {
					account,
					model,
					type: this.collName,
					ticketId: utils.uuidToString(newTicket._id),
					viewpointId: utils.uuidToString(newTicket.viewpoint.guid),
					err
				});
			});
		}

		newTicket.viewpoints = [newTicket.viewpoint];

		// Assign rev_id for issue
		const [history, image] = await Promise.all([
			History.getHistory({account, model}, branch, newTicket.revId, { _id: 1 }),
			imagePromise
		]);

		if (!history && (newTicket.revId || (newTicket.viewpoint || {}).highlighted_group_id)) {
			throw (responseCodes.MODEL_HISTORY_NOT_FOUND);
		} else if (history) {
			newTicket.rev_id = history._id;
		}

		if (image) {
			newTicket.thumbnail = {
				flag: 1,
				content: image
			};
		}

		await this.setGroupTicketId(account, model, newTicket);

		newTicket = this.filterFields(newTicket, ["viewpoint", "revId"]);

		Object.keys(newTicket).forEach((key) => {
			if (Object.prototype.toString.call(newTicket[key]) !== this.fieldTypes[key]) {
				if (newTicket[key] === null) {
					delete newTicket[key];
				} else {
					systemLogger.logError(`Type check failed: ${key} is expected to be type ${this.fieldTypes[key]} but it is `, Object.prototype.toString.call(newTicket[key]));
					throw responseCodes.INVALID_ARGUMENTS;
				}

			}
			if (key === "due_date" && newTicket[key] === 0) {
				delete newTicket[key];
			}
		});

		const [settings, coll] = await Promise.all([
			ModelSetting.findById({account, model}, model),
			this.getTicketsCollection(account, model)
		]);

		await coll.insert(newTicket);
		newTicket.typePrefix = newTicket.typePrefix || settings.type || "";
		newTicket = this.clean(account, model, newTicket);
		return newTicket;
	}

	getScreenshot(account, model, uid, vid) {
		if ("[object String]" === Object.prototype.toString.call(uid)) {
			uid = utils.stringToUUID(uid);
		}

		if ("[object String]" === Object.prototype.toString.call(vid)) {
			vid = utils.stringToUUID(vid);
		}

		return this.findByUID(account, model, uid, { viewpoints: { $elemMatch: { guid: vid } },
			"viewpoints.screenshot.resizedContent": 0
		}, true).then((foundTicket) => {
			if (!_.get(foundTicket, "viewpoints[0].screenshot.content.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return foundTicket.viewpoints[0].screenshot.content.buffer;
			}
		});
	}

	getSmallScreenshot(account, model, uid, vid) {
		if ("[object String]" === Object.prototype.toString.call(uid)) {
			uid = utils.stringToUUID(uid);
		}

		if ("[object String]" === Object.prototype.toString.call(vid)) {
			vid = utils.stringToUUID(vid);
		}

		return this.findByUID(account, model, uid, { viewpoints: { $elemMatch: { guid: vid } } }, true)
			.then((foundTicket) => {
				if (_.get(foundTicket, "viewpoints[0].screenshot.resizedContent.buffer")) {
					return foundTicket.viewpoints[0].screenshot.resizedContent.buffer;
				} else if (!_.get(foundTicket, "viewpoints[0].screenshot.content.buffer")) {
					return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
				} else {
					return utils.resizeAndCropScreenshot(foundTicket.viewpoints[0].screenshot.content.buffer, 365)
						.then((resized) => {
							this.getTicketsCollection(account, model).then((_dbCol) => {
								_dbCol.update({
									_id: uid,
									"viewpoints.guid": vid
								},{
									$set: {"viewpoints.$.screenshot.resizedContent": resized}
								}).catch((err) => {
									systemLogger.logError("Error while saving resized screenshot",
										{
											collName: this.collName,
											ticketId: utils.uuidToString(uid),
											viewpointId: utils.uuidToString(vid),
											err: err
										});
								});
							});

							return resized;
						});
				}
			});
	}

	getThumbnail(account, model, uid) {
		if ("[object String]" === Object.prototype.toString.call(uid)) {
			uid = utils.stringToUUID(uid);
		}

		return this.findByUID(account, model, uid, { thumbnail: 1 }, true).then((foundTicket) => {
			if (!_.get(foundTicket, "thumbnail.content.buffer")) {
				return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
			} else {
				return foundTicket.thumbnail.content.buffer;
			}
		});
	}

	async findByModelName(account, model, branch, revId, projection, ids, noClean = false) {
		let filter = {};

		if (Array.isArray(ids)) {
			filter._id = {"$in": ids.map(utils.stringToUUID)};
		} else {
			filter = { ...filter, ...(ids || {}) }; // this means that the ids are a different filter;
		}

		let invalidRevIds = [];

		if (branch || revId) {
			// searches for the first rev id
			const history = await History.getHistory({account, model}, branch, revId);
			if (history) {
				// Uses the first revsion searched to get all posterior revisions
				invalidRevIds = await History.find({account, model}, {timestamp: {"$gt": history.timestamp}}, {_id: 1});
				invalidRevIds = invalidRevIds.map(r => r._id);
			}
		}

		const modelSettings = await ModelSetting.findById({account, model}, model);
		filter.rev_id = {"$not" : {"$in": invalidRevIds}};
		const coll = await this.getTicketsCollection(account, model);
		const tickets = await coll.find(filter, projection).toArray();
		tickets.forEach((foundTicket, index) => {
			foundTicket.typePrefix = modelSettings.type || "";
			foundTicket.modelCode = (modelSettings.properties || {}).code || "";
			if (!noClean) {
				tickets[index] = this.clean(account, model, foundTicket);
			}
		});

		return tickets;
	}

	toDirectXCoords(entry) {
		const fieldsToConvert = ["position", "norm"];
		const vpFieldsToConvert = ["right", "view_dir", "look_at", "position", "up"];

		fieldsToConvert.forEach((rootKey) => {
			if (entry[rootKey]) {
				entry[rootKey] = utils.webGLtoDirectX(entry[rootKey]);
			}
		});

		const viewpoint = entry.viewpoint;
		vpFieldsToConvert.forEach((key) => {
			if (viewpoint[key]) {
				viewpoint[key] = utils.webGLtoDirectX(viewpoint[key]);
			}
		});

		const clippingPlanes = viewpoint.clippingPlanes;
		if(clippingPlanes) {
			for (const item in clippingPlanes) {
				clippingPlanes[item].normal = utils.webGLtoDirectX(clippingPlanes[item].normal);
			}
		}

		return viewpoint;
	}

	async getList(account, model, branch, revision, ids, convertCoords) {
		const projection = {
			extras: 0,
			"comments": 0,
			"viewpoints.extras": 0,
			"viewpoints.scribble": 0,
			"viewpoints.screenshot.content": 0,
			"viewpoints.screenshot.resizedContent": 0,
			"thumbnail.content": 0
		};

		const tickets = await this.findByModelName(account, model, branch, revision, projection, ids, false);
		if (convertCoords) {
			tickets.forEach(this.toDirectXCoords);
		}
		return tickets;
	}

	async getReport(account, model, rid, ids, res, reportGen) {
		const projection = {
			extras: 0,
			"viewpoints.extras": 0,
			"viewpoints.scribble": 0,
			"viewpoints.screenshot.content": 0,
			"viewpoints.screenshot.resizedContent": 0,
			"thumbnail.content": 0
		};

		const branch = rid ? null : "master";
		const tickets = await this.findByModelName(account, model, branch, rid, projection, ids, false);
		reportGen.addEntries(tickets);
		return reportGen.generateReport(res);
	}

	async addRefs(account, model, id, username, sessionId, refs) {
		if (refs.length === 0) {
			return [];
		}

		const tickets = await this.getTicketsCollection(account, model);
		const ticketQuery = {_id: utils.stringToUUID(id)};
		const ticketFound = await tickets.findOne(ticketQuery);

		if (!ticketFound) {
			throw this.response("NOT_FOUND");
		}

		const comments = ticketFound.comments || [];

		const ref_ids = [];

		refs.forEach(ref => {
			comments.push(this.createSystemComment(account, model, sessionId, id, username, "resource", null, ref.name));
			ref_ids.push(ref._id);
		});

		await tickets.update(ticketQuery, { $set: {comments}, $push: {refs:  {$each: ref_ids}}});
		return refs;
	}

	async attachResourceFiles(account, model, id, username, sessionId, resourceNames, files) {
		const quota = await User.getQuotaInfo(account);
		const spaceLeft = ((quota.spaceLimit === null || quota.spaceLimit === undefined ? Infinity : quota.spaceLimit) - quota.spaceUsed) * 1024 * 1024;
		const spaceToBeUsed = files.reduce((size, file) => size + file.size,0);

		if (spaceLeft < spaceToBeUsed) {
			throw responseCodes.SIZE_LIMIT_PAY;
		}

		if (!files.every(f => f.size < config.resourceUploadSizeLimit)) {
			throw responseCodes.SIZE_LIMIT;
		}

		const refsPromises = files.map((file,i) => {
			const extension = ((file.originalname.match(extensionRe) || [])[0] || "").toLowerCase();
			return FileRef.storeFileAsResource(account, model, username, resourceNames[i] + extension, file.buffer, {[this.refIdsField]:[id]});
		});
		const refs = await Promise.all(refsPromises);
		refs.forEach(r => {
			delete r.link;
			delete r.type;
		});

		await this.addRefs(account, model, id, username, sessionId, refs);
		return refs;
	}

	async attachResourceUrls(account, model, id, username, sessionId, resourceNames, urls) {
		const refsPromises = urls.map((url, index) =>  FileRef.storeUrlAsResource(account, model, username,resourceNames[index], url,{[this.refIdsField]:[id]}));
		const refs = await Promise.all(refsPromises);
		refs.forEach(r => {
			delete r.type;
		});

		await this.addRefs(account, model, id, username, sessionId, refs);
		return refs;
	}

	async detachResource(account, model, id, resourceId, username, sessionId) {
		const ref = await FileRef.removeResourceFromEntity(account, model, this.refIdsField, id, resourceId);
		const tickets = await this.getTicketsCollection(account, model);
		const ticketQuery = {_id: utils.stringToUUID(id)};
		const ticketFound = await tickets.findOne(ticketQuery);

		if (!ticketFound) {
			throw this.response("NOT_FOUND");
		}

		const comments = ticketFound.comments;
		comments.push(await this.createSystemComment(account, model, sessionId, id, username, "resource", ref.name, null));
		await tickets.update(ticketQuery, {$set: {comments}, $pull: { refs: resourceId } });

		if(ref.type !== "http") {
			delete ref.link;
		}
		delete ref.type;

		return ref;
	}
}

module.exports = Ticket;
