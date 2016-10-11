/**
 *	Copyright (C) 2016 3D Repo Ltd
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

var Queue = require('../services/queue');

function insertEventQueue(event, emitter, account, project, extraKeys, data){
	'use strict';

	let msg = {
		event,
		emitter,
		account,
		project,
		extraKeys,
		data

	};

	return Queue.insertEventMessage(msg);
}

function newIssue(emitter, account, project, data){
	'use strict';
	return insertEventQueue('newIssue', emitter, account, project, null, data);
}

function newComment(emitter, account, project, issueId, data){
	'use strict';
	return insertEventQueue('newComment', emitter, account, project, [issueId], data);
}

function projectUploaded(emitter, account, project, data){
	'use strict';
	return insertEventQueue('projectUploaded', emitter, account, project, null, data);
}

module.exports = {
	newIssue,
	newComment,
	projectUploaded
};
