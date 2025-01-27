/**
 *  Copyright (C) 2021 3D Repo Ltd
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
const _ = require("lodash");

const { isProjectAdmin } = require("./project");
const View = require("./view");
const User = require("./user");
const { findJobByUser } = require("./job");
const History = require("./history");

const { findModelSettingById } = require("./modelSetting");
const { getTeamspaceSettings } = require("./teamspaceSetting");

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const C = require("../constants");
const db = require("../handler/db");

const ChatEvent = require("./chatEvent");
const { systemLogger } = require("../logger.js");

const Comment = require("./comment");
const Shapes = require("./shapes");
const FileRef = require("./fileRef");
const config = require("../config.js");
const extensionRe = /\.(\w+)$/;
const AccountPermissions = require("./accountPermissions");
const { cleanViewpoint } = require("./viewpoint");
const { v5Path } = require("../../interop");
const { UUIDToString } = require(`${v5Path}/utils/helper/uuids.js`);

const getResponse = (responseCodeType) => (type) => responseCodes[responseCodeType + "_" + type];

function verifySequenceDatePrecedence(ticket) {
	return !utils.hasField(ticket, "sequence_start") ||
		!utils.hasField(ticket, "sequence_end") ||
		ticket["sequence_start"] <= ticket["sequence_end"];
}

class Ticket extends View {
	constructor(collName, viewpointType, refIdsField, responseCodeType, fieldTypes, ownerPrivilegeAttributes) {
		super();
		this.collName = collName;
		this.response = getResponse(responseCodeType);
		this.fieldTypes = fieldTypes;
		this.ownerPrivilegeAttributes = ownerPrivilegeAttributes;
		this.viewpointType = viewpointType;
		this.refIdsField = refIdsField;
	}

	clean(account, model, ticketToClean) {
		const ticketFields = ["rev_id", "group_id"];
		ticketToClean.account = account;
		model = ticketToClean.model || ticketToClean.origin_model || model;
		ticketToClean.model = model;

		ticketFields.forEach((key) => {
			if (ticketToClean[key]) {
				ticketToClean[key] = utils.uuidToString(ticketToClean[key]);
			}
		});

		if (ticketToClean.due_date === null) {
			delete ticketToClean.due_date;
		}

		const routePrefix = this.routePrefix(account, model, ticketToClean._id);

		// legacy schema support
		if (ticketToClean.viewpoint) {
			if(!(ticketToClean.viewpoint.right && ticketToClean.viewpoint.right.length)) {
				// workaround for erroneous legacy data - see ISSUE #2085
				ticketToClean.viewpoint = undefined;
			}
		}

		if (!ticketToClean.viewpoint) {
			if (ticketToClean.viewpoints && ticketToClean.viewpoints.length > 0) {
				ticketToClean.viewpoint = ticketToClean.viewpoints[0];
			} else {
				ticketToClean.viewpoint = {};
			}
		}

		if (ticketToClean.comments) {
			ticketToClean.comments.forEach((comment) => {
				if (comment.viewpoint && utils.isUUIDObject(comment.viewpoint)) {
					const vpId =  utils.uuidToString(comment.viewpoint);
					comment.viewpoint = ticketToClean.viewpoints.find((item) => item.guid && utils.uuidToString(item.guid) === vpId);
				}
				const commentCleaned = Comment.clean(routePrefix, comment);
				comment = commentCleaned;
			});
		} else {
			ticketToClean.comments = [];
		}

		if (ticketToClean.shapes) {
			ticketToClean.shapes = Shapes.cleanCollection(ticketToClean.shapes);
		}

		delete ticketToClean.viewpoints;
		delete ticketToClean.viewCount;

		ticketToClean = super.clean(account, model, ticketToClean);

		return ticketToClean;
	}

	async fillTicketwithShapes(account, model, ticket) {
		const shapes = await Shapes.getByTicketId(account, model, this.collName, utils.stringToUUID(ticket._id));

		if (shapes.length) {
			ticket.shapes = shapes;
		}
	}

	async findByUID(account, model, uid, projection, noClean = false) {
		const foundTicket = await super.findByUID(account, model, uid, projection, true);

		if (foundTicket.refs) {
			const resources = await db.find(account, model + ".resources.ref", { _id: { $in: foundTicket.refs } }, { name: 1, size: 1, createdAt: 1, link: 1, type: 1 });
			resources.forEach(r => {
				if (r.type !== "http") {
					delete r.link;
				}

				delete r.type;
			});

			foundTicket.resources = resources;
			delete foundTicket.refs;
		}

		await this.fillTicketwithShapes(account, model, foundTicket);

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
			getTeamspaceSettings(account),
			findJobByUser(account, user),
			isProjectAdmin(
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

		const accountPerm = AccountPermissions.findByUser(dbUser, user);
		const tsAdmin = accountPerm && accountPerm.permissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1;
		const isAdmin = projAdmin || tsAdmin;
		const hasOwnerJob = UUIDToString(oldTicket.creator_role) === UUIDToString(job);
		const hasAdminPrivileges = isAdmin || hasOwnerJob;
		const hasAssignedJob = UUIDToString(job) === UUIDToString(oldTicket.assigned_roles[0]);
		const userPermissions = { hasAdminPrivileges, hasAssignedJob };

		const _id = utils.stringToUUID(id);

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

		const updateData = {};

		let newViewpoint;

		fields.forEach(field => {
			// handle viewpoint later
			if (field === "viewpoint") {
				return;
			}

			if (null === data[field]) {
				if (!updateData["$unset"]) {
					updateData["$unset"] = {};
				}

				updateData["$unset"][field] = "";
			}

			this.handleFieldUpdate(account, model, sessionId, id, user, field, oldTicket, data, systemComments);
		});

		if (data.viewpoint) {
			newViewpoint = await this.createViewpoint(account, model, id, data.viewpoint, true);
			cleanViewpoint(undefined, newViewpoint);
			oldTicket.viewpoint = oldTicket.viewpoints[0] || {};
			const oldScreenshotRef = oldTicket.viewpoint.screenshot_ref;
			oldTicket = super.clean(account, model, oldTicket);
			delete oldTicket.viewpoint.screenshot;
			// DEPRECATED
			delete oldTicket.viewpoint.screenshotSmall;

			// if is not updating the viewpoint position means that is only the screenshot, so
			// it takes the rest of the properties from the old viewpoint
			if (!newViewpoint.position && newViewpoint.screenshot_ref) {
				newViewpoint = {
					...oldTicket.viewpoint,
					...newViewpoint
				};
			} else if (newViewpoint.position && !newViewpoint.screenshot_ref) {
				// if is updating the viewpoint but not the screenshot, keep the old screenshot
				newViewpoint.screenshot_ref = oldScreenshotRef;
				newViewpoint.thumbnail = oldTicket.viewpoint.thumbnail;
			}

			data.viewpoint = newViewpoint;

			data.viewpoint.guid = utils.uuidToString(data.viewpoint.guid);
			if (data.viewpoint.transformation_group_id) {
				data.viewpoint.transformation_group_id = utils.uuidToString(data.viewpoint.transformation_group_id);
			}

			if (data.viewpoint.thumbnail) {
				data.thumbnail = data.viewpoint.thumbnail;
				delete data.viewpoint.thumbnail;

				// if a field have the same value shouldnt update the property
				if (_.isEqual(oldTicket["viewpoint"], data["viewpoint"])) {
					delete data["viewpoint"];
					return;
				}

				const comment = this.createSystemComment(
					account,
					model,
					sessionId,
					id,
					user,
					"screenshot",
					oldTicket.viewpoint.screenshot_ref,
					data.viewpoint.screenshot_ref);

				systemComments.push(comment);
			}

			if (!_.isEqual(_.omit(oldTicket.viewpoint, ["screenshot_ref"]), _.omit(data.viewpoint, ["screenshot_ref"]))) {
				const dataVP = {...data.viewpoint};
				if (dataVP.screenshot_ref === oldScreenshotRef) {
					dataVP.screenshot_ref = dataVP.screenshot = dataVP.screenshotSmall = undefined;

				}
				this.handleFieldUpdate(account, model, sessionId, id, user, "viewpoint", oldTicket, {viewpoint: dataVP}, systemComments);
			}

			delete oldTicket.viewpoint;
		}

		await newViewpoint;

		data = await beforeUpdate(data, oldTicket, userPermissions, systemComments);

		if (systemComments.length > 0) {
			data.comments = (data.comments ?? oldTicket.comments ?? []).map(c => ({ ...c, sealed: true }));
			data.comments = data.comments.concat(systemComments);
		}

		// Handle viewpoint
		if (data.viewpoint) {
			data.viewpoint.guid = utils.stringToUUID(data.viewpoint.guid);

			data.viewpoints = oldTicket.viewpoints;
			data.viewpoints[0] = data.viewpoint;

			delete data.viewpoint;
		}

		// 6. Update the data
		const tickets = await this.getCollection(account, model);

		// 7. Return the updated data and the old ticket
		const updatedTicket = updateData["$unset"] ?
			this.filterFields({ ...oldTicket, ...data }, Object.keys(updateData["$unset"])) :
			{ ...oldTicket, ...data };

		// 8. Check sequence dates in correct order
		if (!verifySequenceDatePrecedence(updatedTicket)) {
			throw responseCodes.INVALID_DATE_ORDER;
		}

		let shapes = null;
		// Handle shapes
		if (data.shapes) {
			shapes = await Shapes.createMany(account, model, this.collName, _id, data.shapes);
			delete data.shapes;
		}

		if (Object.keys(data).length > 0) {
			updateData["$set"] = data;
			await tickets.updateOne({ _id }, updateData);
		}

		if (shapes) {
			updatedTicket.shapes = shapes;
			data.shapes = shapes;
		}

		this.clean(account, model, updatedTicket);
		this.clean(account, model, oldTicket);
		delete data.comments;

		if (data.viewpoints) {
			data.thumbnail = updatedTicket.thumbnail;
			data.viewpoint = updatedTicket.viewpoint;
			delete data.viewpoints;
		}

		return { oldTicket, updatedTicket, data };
	}

	filterFields(data, blackList) {
		data = _.omit(data, blackList);
		return _.pick(data, Object.keys(this.fieldTypes));
	}

	handleFieldUpdate(account, model, sessionId, id, user, field, oldTicket, data, systemComments) {
		if (null === data[field]) {
			delete data[field];
		} else if (!utils.typeMatch(data[field], this.fieldTypes[field])) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		// do not update the property if value of field unchanged
		if (_.isEqual(oldTicket[field], data[field])) {
			delete data[field];
			return;
		}

		// update of extras, comments, viewpoints must not create a system comment
		if (field === "extras" || field === "comments" || field === "viewpoints") {
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
	}

	/*
	* @param {string} account
	* @param {string} model
	* @param {object} newTicket
	*/
	async create(account, model, newTicket) {
		if (!newTicket.name) {
			throw responseCodes.INVALID_ARGUMENTS;
		}

		// Sets the ticket number
		const coll = await this.getCollection(account, model);
		try {
			const tickets = await coll.find({}, {number: 1}).sort({ number: -1 }).limit(1).toArray();
			newTicket.number = (tickets.length > 0) ? tickets[0].number + 1 : 1;
		} catch(e) {
			newTicket.number = 1;
		}

		Object.keys(newTicket).forEach((key) => {
			const validTypes = [].concat(this.fieldTypes[key]);
			const value = newTicket[key];
			const fieldType = Object.prototype.toString.call(value);
			if (this.fieldTypes[key] && validTypes.every(t => {
				return (t === "[object Number]" && isNaN(parseFloat(value))) || (t !== "[object Number]" && t !== fieldType);
			})) {
				if (newTicket[key] === null) {
					delete newTicket[key];
				} else {
					systemLogger.logError(`Type check failed: ${key} is expected to be type ${this.fieldTypes[key]} but it is `, Object.prototype.toString.call(newTicket[key]));
					throw responseCodes.INVALID_ARGUMENTS;
				}

			}
			if ((key === "due_date" || key === "sequence_start" || key === "sequence_end")
				&& newTicket[key] === 0) {
				delete newTicket[key];
			}
		});

		const branch = newTicket.revId || "master";
		newTicket.assigned_roles = newTicket.assigned_roles || [];
		newTicket._id = utils.stringToUUID(newTicket._id || utils.generateUUID());
		newTicket.created = parseInt(newTicket.created || (new Date()).getTime());

		let shapes = newTicket.shapes;

		if (shapes) {
			shapes = await Shapes.createMany(account, model, this.collName, newTicket._id, shapes);
			delete newTicket.shapes; // In order to not get inserted in the ticket definition
		}

		const ownerJob = await findJobByUser(account, newTicket.owner);
		if (ownerJob) {
			newTicket.creator_role = ownerJob._id;
		} else {
			delete newTicket.creator_role;
		}
		newTicket.desc = newTicket.desc || "(No Description)";

		if (!newTicket.viewpoints) {
			if (newTicket.viewpoint) {
				// FIXME need to revisit this for BCF refactor
				// This allows BCF import to create new issue with more than 1 viewpoint
				newTicket.viewpoints = [await this.createViewpoint(account, model, newTicket._id, newTicket.viewpoint, true)];

				if (newTicket.viewpoints[0].thumbnail) {
					newTicket.thumbnail = newTicket.viewpoints[0].thumbnail;
					delete newTicket.viewpoints[0].thumbnail;
				}
			} else {
				newTicket.viewpoints = [];
			}
		}

		// Assign rev_id for issue
		try {
			const history = await  History.getHistory(account, model, branch, newTicket.revId, { _id: 1 });
			if (history) {
				newTicket.rev_id = history._id;
			}
		} catch(err) {
			if (newTicket.revId || (newTicket.viewpoint || {}).highlighted_group_id) {
				throw responseCodes.INVALID_TAG_NAME;
			}
		}

		newTicket = this.filterFields(newTicket, ["viewpoint", "revId"]);

		// Check sequence dates in correct order
		if (!verifySequenceDatePrecedence(newTicket)) {
			throw responseCodes.INVALID_DATE_ORDER;
		}

		const settings = await findModelSettingById(account, model);

		await coll.insertOne(newTicket);

		if (shapes) {
			newTicket.shapes = shapes;
		}

		newTicket.typePrefix = newTicket.typePrefix || settings.type || "";
		newTicket = this.clean(account, model, newTicket);
		return newTicket;
	}

	async getScreenshot(account, model, uid, vid) {
		uid = utils.stringToUUID(uid);
		vid = utils.stringToUUID(vid);

		const foundTicket = await this.findByUID(account, model, uid, {
			viewpoints: { $elemMatch: { guid: vid } }
		}, true);

		if (!_.get(foundTicket, "viewpoints[0].screenshot.content.buffer") && !_.get(foundTicket, "viewpoints[0].screenshot_ref")) {
			throw responseCodes.SCREENSHOT_NOT_FOUND;
		}

		if (foundTicket.viewpoints[0].screenshot_ref) {
			return FileRef.fetchFile(account, model, this.collName, foundTicket.viewpoints[0].screenshot_ref);
		}

		// this is being kept for legacy reasons
		return foundTicket.viewpoints[0].screenshot.content.buffer;
	}

	async processFilter(account, model, branch, revId, filters) {
		let filter = {};
		if (filters) {
			if (filters.id) {
				filter = await this.getIdsFilter(account, model, branch, revId, filters.id);
				delete filters.id;
			}

			filters = _.mapValues(filters, value =>  ({ "$in": value}));
			filter = {...filter, ...filters};
		}

		return filter;
	}

	async getIdsFilter(account, model, branch, revId, ids) {
		let filter = {};

		if (Array.isArray(ids)) {
			filter._id = { "$in": ids.map(utils.stringToUUID) };
		} else {
			filter = { ...filter, ...(ids || {}) }; // this means that the ids are a different filter;
		}

		let invalidRevIds = [];

		if (branch || revId) {
			// searches for the first rev id
			const history = await  History.getHistory(account, model, branch, revId);

			// Uses the first revsion searched to get all posterior revisions
			invalidRevIds = await History.find(account, model , { timestamp: { "$gt": history.timestamp } }, { _id: 1 });
			invalidRevIds = invalidRevIds.map(r => r._id);
		}

		filter.rev_id = { "$not": { "$in": invalidRevIds } };

		return filter;
	}

	async findByModelName(account, model, branch, revId, query, projection, filters, noClean = false, convertCoords = false, filterTicket = null) {
		const filter = await this.processFilter(account, model, branch, revId, filters);
		const fullQuery = {...filter, ...query};

		const coll = await this.getCollection(account, model);
		const tickets = await coll.find(fullQuery, projection).toArray();
		const filteredTickets = [];
		await Promise.all(tickets.map(async (foundTicket) => {
			if (filterTicket &&  !filterTicket(foundTicket, filters)) {
				return filteredTickets;
			}

			if (convertCoords) {
				this.toDirectXCoords(foundTicket);
			}

			await this.fillTicketwithShapes(account, model, foundTicket);

			if (!noClean) {
				filteredTickets.push(this.clean(account, model, foundTicket));
			} else {
				filteredTickets.push(foundTicket);
			}
		}));

		return filteredTickets;
	}

	toDirectXCoords(entry) {
		const fieldsToConvert = ["position"];
		const vpFieldsToConvert = ["right", "view_dir", "look_at", "position", "up"];

		fieldsToConvert.forEach((rootKey) => {
			if (entry[rootKey]) {
				entry[rootKey] = utils.webGLtoDirectX(entry[rootKey]);
			}
		});

		let viewpoint = entry.viewpoint;
		if (!entry.viewpoint && entry.viewpoints && entry.viewpoints.length > 0) {
			viewpoint = entry.viewpoints[0];
		}

		if (!viewpoint) {
			return;
		}

		vpFieldsToConvert.forEach((key) => {
			if (viewpoint[key]) {
				viewpoint[key] = utils.webGLtoDirectX(viewpoint[key]);
			}
		});

		const clippingPlanes = viewpoint.clippingPlanes;
		if (clippingPlanes) {
			for (const item in clippingPlanes) {
				clippingPlanes[item].normal = utils.webGLtoDirectX(clippingPlanes[item].normal);
			}
		}

		return viewpoint;
	}

	async getList(account, model, branch, revision, filters, convertCoords, updatedSince) {
		const projection = {
			"extras": 0,
			"norm" : 0,
			"viewpoints.extras": 0,
			"viewpoints.scribble": 0,
			"viewpoints.screenshot.content": 0,
			"viewpoints.screenshot.resizedContent": 0,
			"thumbnail.content": 0,
			"refs": 0
		};

		const query = updatedSince ?
			{
				$or:[
					{created: {$gte: updatedSince}},
					{"comments.created": {$gte: updatedSince}}
				]
			}
			: undefined;

		const tickets = await this.findByModelName(
			account,
			model,
			branch,
			revision,
			query,
			projection,
			filters,
			false,
			convertCoords
		);

		await Promise.all(tickets.map(async (ticket) => {
			ticket.lastUpdated = ticket.created;
			ticket.comments && ticket.comments.forEach((comment) => {
				if (comment.created > ticket.lastUpdated) {
					ticket.lastUpdated = comment.created;
				}
			});
			ticket.comments = undefined;
		}));

		return tickets;
	}

	async getReport(account, model, rid, filters, res, reportGen) {
		const projection = {
			extras: 0,
			"viewpoints.extras": 0,
			"viewpoints.scribble": 0,
			"viewpoints.screenshot.content": 0,
			"viewpoints.screenshot.resizedContent": 0,
			"thumbnail.content": 0
		};

		const branch = rid ? null : "master";
		const tickets = await this.findByModelName(account, model, branch, rid, undefined, projection, filters, false);
		reportGen.addEntries(tickets);
		return reportGen.generateReport(res);
	}

	async addComment(account, model, id, user, data, sessionId) {
		// 1. creates a comment and gets the result ( comment + references)
		const commentResult = await Comment.addComment(account, model, this.collName, id, user, data,
			this.routePrefix(account, model, id), this.viewpointType);

		// 2 get referenced ticket numbers
		const ticketNumbers = commentResult.ticketRefs;

		// 3. Get tickets from number
		const ticketsColl = await this.getCollection(account, model);
		// 4 Adding the comment id to get its number and to not make 2 queries to the database
		const res = await ticketsColl.find({ $or: [{ number: {$in: ticketNumbers}}, {_id : utils.stringToUUID(id)}]}).toArray();

		// 5. Create system comments promise updates for those tickets that were referenced
		const ticketsCommentsUpdates =  [];

		// 6. Find the number of the ticket that made the reference
		const referenceNumber = res.find(({_id}) => utils.uuidToString(_id) === id).number;

		res.forEach((ticket)  => {
			if (ticket.number === referenceNumber) {
				return;
			}

			// 7. Create the system comment
			const property = this.collName.slice(0, -1) + "_referenced";
			const systemComment = this.createSystemComment(account, model, sessionId, ticket._id, user, property, null, referenceNumber);
			const comments = (ticket.comments || []).map(c=> {
				c.sealed = true;
				return c;
			}).concat([systemComment]);

			// 8. Add update promise to updates array
			ticketsCommentsUpdates.push(ticketsColl.updateOne({_id: ticket._id}, { $set: { comments }}));
		});
		// 9. update referenced tickets with new system comments
		await Promise.all(ticketsCommentsUpdates);
		return commentResult;
	}

	async addRefs(account, model, id, username, sessionId, refs) {
		if (refs.length === 0) {
			return [];
		}

		const tickets = await this.getCollection(account, model);
		const ticketQuery = { _id: utils.stringToUUID(id) };
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

		await tickets.updateOne(ticketQuery, { $set: { comments }, $push: { refs: { $each: ref_ids } } });
		return refs;
	}

	async attachResourceFiles(account, model, id, username, sessionId, resourceNames, files) {
		const spaceToBeUsed = files.reduce((size, file) => size + file.size, 0);

		if (!(await User.hasSufficientQuota(account, spaceToBeUsed))) {
			throw responseCodes.SIZE_LIMIT_PAY;
		}
		if (!files.every(f => f.size < config.resourceUploadSizeLimit)) {
			throw responseCodes.SIZE_LIMIT;
		}

		const refsPromises = files.map((file, i) => {
			const extension = ((file.originalname.match(extensionRe) || [])[0] || "").toLowerCase();
			return FileRef.storeFileAsResource(account, model, username, resourceNames[i] + extension, file.buffer, { [this.refIdsField]: [id] });
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
		const refsPromises = urls.map((url, index) => FileRef.storeUrlAsResource(account, model, username, resourceNames[index], url, { [this.refIdsField]: [id] }));
		const refs = await Promise.all(refsPromises);
		refs.forEach(r => {
			delete r.type;
		});

		await this.addRefs(account, model, id, username, sessionId, refs);
		return refs;
	}

	async detachResource(account, model, id, resourceId, username, sessionId) {
		const ref = await FileRef.removeResourceFromEntity(account, model, this.refIdsField, id, resourceId);
		const tickets = await this.getCollection(account, model);
		const ticketQuery = { _id: utils.stringToUUID(id) };
		const ticketFound = await tickets.findOne(ticketQuery);

		if (!ticketFound) {
			throw this.response("NOT_FOUND");
		}

		const comments = ticketFound.comments;
		comments.push(await this.createSystemComment(account, model, sessionId, id, username, "resource", ref.name, null));
		await tickets.updateOne(ticketQuery, { $set: { comments }, $pull: { refs: resourceId } });

		if (ref.type !== "http") {
			delete ref.link;
		}
		delete ref.type;

		return ref;
	}
}

module.exports = Ticket;
