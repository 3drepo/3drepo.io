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

const utils = require("../utils");

const fieldTypes = {
	"action": "[object Object]",
	"comment": "[object String]",
	"created": "[object Number]",
	"guid": "[object Object]",
	"owner": "[object String]",
	"rev_id": "[object Object]",
	"sealed": "[object Boolean]",
	"viewpoint": "[object Object]"
};

class CommentGenerator {
	constructor(owner, revId = undefined) {
		this.guid = utils.generateUUID();
		this.created = (new Date()).getTime();
		this.owner = owner;

		if (revId) {
			if ("[object String]" === Object.prototype.toString.call(revId)) {
				revId = utils.stringToUUID(revId);
			}

			this.rev_id = revId;
		}
	}
}

class TextCommentGenerator extends CommentGenerator {
	constructor(owner, revId, commentText, viewpointGUID) {
		super(owner, revId);
		this.comment = commentText;

		if (viewpointGUID) {
			this.viewpoint = viewpointGUID;
		}
	}
}

class SystemCommentGenerator extends CommentGenerator {
	constructor(owner, property, from, to) {
		super(owner);

		this.action = {
			property,
			from,
			to
		};
	}
}

module.exports = {
	newTextComment : (owner, revId, commentText, viewpointGUID) => new TextCommentGenerator(owner, revId, commentText, viewpointGUID),
	newSystemComment : (owner, property, from, to) => new SystemCommentGenerator(owner, property, from, to)
};
