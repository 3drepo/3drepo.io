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

const get = require("lodash").get;
const responseCodes = require("../response_codes.js");
const utils = require("../utils");
const View = require("./viewpoint");
const db = require("../handler/db");

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

		if (fieldTypes.comment === Object.prototype.toString.call(commentText)) {
			if (commentText.length > 0 || (viewpoint &&
				fieldTypes.screenshot === Object.prototype.toString.call(viewpoint.screenshot))) {
				this.comment = commentText;

				if (viewpoint && viewpoint.guid) {
					this.viewpoint = viewpoint.guid;
				}

				if (pinPosition && fieldTypes.pinPosition === Object.prototype.toString.call(pinPosition)) {
					this.pinPosition = pinPosition;
				}
			} else {
				throw responseCodes.ISSUE_COMMENT_NO_TEXT;
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
			from = from ? from.toString() : "";
		}

		if (undefined !== to && fieldTypes.to !== Object.prototype.toString.call(to)) {
			to = to ? to.toString() : "";
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

const addComment = async function(account, model, colName, id, user, data) {
	if ((!data.comment || !data.comment.trim()) && !get(data,"viewpoint.screenshot")) {
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
		viewpoint = await View.clean({account, model}, data.viewpoint, fieldTypes.viewpoint);
		viewpoint.guid = utils.generateUUID();
	}

	const comment = new TextCommentGenerator(user, data.comment, viewpoint);

	// 4. Append the new comment
	comments.push(comment);

	// 5. Update the item.
	const viewpointPush =  viewpoint ? {$push: { viewpoints: viewpoint }} : {};

	await col.update({ _id }, {...viewpointPush ,$set : {comments}});

	View.setViewpointScreenshot(colName, account, model, id, viewpoint);

	// 6. Return the new comment.
	return {...comment, viewpoint, guid: utils.uuidToString(comment.guid)};
};

const deleteComment =  async function(account, model, colName, id, guid, user) {
	// 1. Fetch comments
	const _id = utils.stringToUUID(id) ;
	const col = await db.getCollection(account, model + "." + colName);
	const items = await col.find({ _id }, {comments: 1}).toArray();

	if (items.length === 0) {
		throw { resCode: responseCodes.ISSUE_NOT_FOUND };
	}

	let comments = items[0].comments;
	const count = comments.length;
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

		return false;
	});

	if(count === comments.length) {
		throw { resCode: responseCodes.ISSUE_COMMENT_INVALID_GUID};
	}

	// 4. Update the issue;
	await col.update({ _id }, {$set : {comments}});

	// 5. Return which comment was deleted
	return {guid};
};

module.exports = {
	newTextComment : (owner, commentText, viewpoint, pinPosition) => new TextCommentGenerator(owner, commentText, viewpoint, pinPosition),
	newSystemComment : (owner, property, from, to) => new SystemCommentGenerator(owner, property, from, to),
	newMitigationComment : (owner, likelihood, consequence, mitigation, viewpoint, pinPosition) => new MitigationCommentGenerator(owner, likelihood, consequence, mitigation, viewpoint, pinPosition),
	addComment,
	deleteComment
};
