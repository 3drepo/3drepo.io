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
const View = require("./viewpoint");
const User = require("./user");
const Job = require("./job");

const utils = require("../utils");
const responseCodes = require("../response_codes.js");
const C = require("../constants");
const db = require("../handler/db");

const Comment = require("./comment");
const ChatEvent = require("./chatEvent");

const getResponse = (responseCodeType) => (type) => responseCodes[responseCodeType + "_" + type];

class Ticket {
	constructor(collName, responseCodeType, fieldTypes, ownerPrivilegeAttributes) {
		this.collName = collName;
		this.response = getResponse(responseCodeType);
		this.fieldTypes = fieldTypes;
		this.ownerPrivilegeAttributes = ownerPrivilegeAttributes;
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
					View.setViewpointScreenshot(this.collName, account, model, id, viewpoint);
				}

				if (0 === i) {
					ticketToClean.viewpoint = viewpoint;
				}
			});
		}

		if (ticketToClean.comments) {
			ticketToClean.comments.forEach((comment) => {
				commentIdKeys.forEach((key) => {
					// checking for position as some issue stored the viewpoint on the comment section (old schema)
					if (comment[key] && _.isObject(comment[key])) {
						comment[key] = utils.uuidToString(comment[key]);
					}
				});

				if (comment.viewpoint) {
					const commentViewpoint = ticketToClean.viewpoints.find((vp) =>
						vp.guid === comment.viewpoint
					);

					if (commentViewpoint) {
						comment.viewpoint = commentViewpoint;
					}
				}
			});
		}

		if (ticketToClean.thumbnail && ticketToClean.thumbnail.flag) {
			ticketToClean.thumbnail = account + "/" + model + "/" + this.collName + "/" + id + "/thumbnail.png";
		}

		// Return empty arrays as frontend expects them
		// Return empty objects as frontend expects them
		Object.keys(this.fieldTypes).forEach((field) => {
			if (!ticketToClean[field]) {
				if ("[object Array]" === this.fieldTypes[field]) {
					ticketToClean[field] = [];
				} else if ("[object Object]" === this.fieldTypes[field]) {
					ticketToClean[field] = {};
				}
			}
		});

		delete ticketToClean.viewpoints;
		delete ticketToClean.viewCount;

		return ticketToClean;
	}

	async findByUID(account, model, uid, projection) {
		if ("[object String]" === Object.prototype.toString.call(uid)) {
			uid = utils.stringToUUID(uid);
		}

		const tickets = await db.getCollection(account, model + "." + this.collName);
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
		data = _.omit(data, attributeBlacklist);
		data = _.pick(data, Object.keys(this.fieldTypes));

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

		const tickets = await db.getCollection(account, model + "." + this.collName);
		await tickets.update({_id}, {$set: data});

		// 7. Return the updated data and the old ticket
		const updatedTicket =  this.clean(account, model,{...oldTicket, ...data});
		oldTicket = this.clean(account, model, oldTicket);
		delete data.comments;

		return {oldTicket, updatedTicket, data};
	}
}

module.exports = Ticket;
