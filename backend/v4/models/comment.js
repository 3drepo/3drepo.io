/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const get = require("lodash").get;
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const { cleanViewpoint, createViewpoint } = require("../models/viewpoint");
const db = require("../handler/db");
const FileRef = require("./fileRef");

const fieldTypes = {
	"action": "[object Object]",
	"comment": "[object String]",
	"consequence": "[object Number]",
	"created": "[object Number]",
	"guid": "[object Object]",
	"from": "[object String]",
	"likelihood": "[object Number]",
	"mitigation": "[object String]",
	"owner": "[object String]",
	"pinPosition": "[object Array]",
	"sealed": "[object Boolean]",
	"screenshot": "[object Object]",
	"to": "[object String]",
	"viewpoint": "[object Object]",
	"viewpointGuid": "[object Object]"
};

class CommentGenerator {
	constructor(owner) {
		this.guid = utils.generateUUID();
		this.created = (new Date()).getTime();
		this.owner = owner;
	}
}

class TextCommentGenerator extends CommentGenerator {
	constructor(owner, commentText, viewpoint, pinPosition) {
		super(owner);

		if (utils.typeMatch(commentText, fieldTypes.comment)) {
			this.comment = commentText;

			if (viewpoint && viewpoint.guid) {
				this.viewpoint = viewpoint.guid;
			}

			if (pinPosition && fieldTypes.pinPosition === Object.prototype.toString.call(pinPosition)) {
				this.pinPosition = pinPosition;
			}
		} else {
			throw responseCodes.INVALID_ARGUMENTS;
		}
	}
}

class SystemCommentGenerator extends CommentGenerator {
	constructor(owner, property, from, to) {
		super(owner);

		if (undefined !== from && fieldTypes.from !== Object.prototype.toString.call(from)) {
			if (utils.isObject(from)) {
				from = JSON.stringify(from);
			} else {
				from = from ? from.toString() : "";
			}
		}

		if (undefined !== to && fieldTypes.to !== Object.prototype.toString.call(to)) {
			if (utils.isObject(to)) {
				to = JSON.stringify(to);
			} else {
				to = to ? to.toString() : "";
			}
		}
		this.action = {
			property,
			from,
			to
		};
	}
}

class MitigationCommentGenerator extends TextCommentGenerator {
	constructor(owner, likelihood, consequence, mitigation, viewpoint, pinPosition) {
		super(owner, mitigation, viewpoint, pinPosition);

		likelihood = parseInt(likelihood);
		consequence = parseInt(consequence);

		if ((isNaN(likelihood) || fieldTypes.likelihood === Object.prototype.toString.call(likelihood)) &&
			(isNaN(consequence) || fieldTypes.consequence === Object.prototype.toString.call(consequence)) &&
			(undefined === mitigation || fieldTypes.mitigation === Object.prototype.toString.call(mitigation))) {
			this.likelihood = (isNaN(likelihood)) ? undefined : likelihood;
			this.consequence = (isNaN(consequence)) ? undefined : consequence;
			this.mitigation = mitigation;
		} else {
			throw responseCodes.INVALID_ARGUMENTS;
		}
	}
}

const identifyReferences = (comment) => {
	const userRefs = new Set();
	const ticketRefs =  new Set();

	if (comment) {
		let inQuotes = false;
		const arrayOfLines = comment.split("\n");
		arrayOfLines.forEach((line) => {
			// New line resets the quote state. So a line is considered
			// within quotes if the previous line is already in quotes or
			// it contains the quote symbol
			inQuotes = line.trim() !== "" && (line[0] === ">" || inQuotes);
			if (!inQuotes) {
				const users = line.match(/@\S*/g);
				users && users.forEach((x) => userRefs.add(x.substr(1)));

				const tickets = line.match(/#\d+/g);
				tickets && tickets.forEach((x) => ticketRefs.add(parseInt(x.substr(1),10)));
			}
		});
	}

	return { userRefs: Array.from(userRefs), ticketRefs: Array.from(ticketRefs) };

};

const addComment = async function(account, model, colName, id, user, data, routePrefix, ticketType) {

	if (!(data.comment || "").trim() && !get(data,"viewpoint.screenshot")) {
		throw { resCode: responseCodes.ISSUE_COMMENT_NO_TEXT};
	}

	// 1. Fetch comments
	const _id = utils.stringToUUID(id) ;
	const col = await db.getCollection(account, model + "." + colName);
	const items = await col.find({ _id }, {comments: 1}).toArray();
	if (items.length === 0) {
		throw { resCode: responseCodes.ISSUE_NOT_FOUND };
	}

	// 2. Seal every comment
	const comments = items[0].comments || [];
	comments.forEach(c => c.sealed = true);

	// 3. Create the comment
	let viewpoint = null;

	if (data.viewpoint) {
		viewpoint = await createViewpoint(account, model, colName, routePrefix, id, data.viewpoint, true, ticketType);
	}

	const references = identifyReferences(data.comment);
	const comment = new TextCommentGenerator(user, data.comment, viewpoint);

	// 4. Append the new comment
	comments.push(comment);

	// 5. Update the item.
	const viewpointPush =  viewpoint ? {$push: { viewpoints: viewpoint }} : {};

	await col.update({ _id }, {...viewpointPush ,$set : {comments}});

	cleanViewpoint(routePrefix, viewpoint);

	// 6. Return the new comment.
	return { comment: {...comment, viewpoint, guid: utils.uuidToString(comment.guid)}, ...references };
};

const deleteComment =  async function(account, model, colName, id, guid, user) {
	// 1. Fetch comments
	const _id = utils.stringToUUID(id) ;
	const col = await db.getCollection(account, model + "." + colName);
	const item = await col.findOne({ _id }, {comments: 1, viewpoints: 1});

	if (item === 0) {
		throw { resCode: responseCodes.ISSUE_NOT_FOUND };
	}

	let comments = item.comments;
	const count = comments.length;
	let deleteScreenshotPromise = Promise.resolve();
	let viewpoints = item.viewpoints;

	// 3. Filter out the particular comment
	comments = comments.filter(c => {
		if(utils.uuidToString(c.guid) !== guid) {
			return true;
		}

		if (c.sealed) {
			throw { resCode: responseCodes.ISSUE_COMMENT_SEALED};
		}

		if (c.owner !== user) {
			throw { resCode: responseCodes.NOT_AUTHORIZED};
		}

		if (c.viewpoint) {
			let screenshot_ref = null;

			viewpoints = item.viewpoints.filter(v => {
				if (!v.guid.buffer.equals(c.viewpoint.buffer)) {
					return true;
				}

				screenshot_ref =  v.screenshot_ref;
				return false;
			});

			if (screenshot_ref) {
				deleteScreenshotPromise = FileRef.removeFile(account, model, colName, screenshot_ref);
			}
		}
		return false;
	});

	if(count === comments.length) {
		throw { resCode: responseCodes.ISSUE_COMMENT_INVALID_GUID};
	}

	// 4. Update the issue;
	await Promise.all([
		col.update({ _id }, {$set : {comments, viewpoints}}),
		deleteScreenshotPromise
	]);

	// 5. Return which comment was deleted
	return {guid};
};

const clean = (routePrefix, comment) =>  {
	["rev_id", "guid"].forEach((key) => {
		if (comment[key]) {
			comment[key] = utils.uuidToString(comment[key]);
		}
	});
	if(comment.viewpoint) {
		cleanViewpoint(routePrefix, comment.viewpoint);
	}
};

module.exports = {
	newSystemComment : (owner, property, from, to) => new SystemCommentGenerator(owner, property, from, to),
	newMitigationComment : (owner, likelihood, consequence, mitigation, viewpoint, pinPosition) => new MitigationCommentGenerator(owner, likelihood, consequence, mitigation, viewpoint, pinPosition),
	addComment,
	deleteComment,
	clean
};
