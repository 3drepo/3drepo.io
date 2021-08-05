/**
 *  Copyright (C) 2016 3D Repo Ltd
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
const utils = require("../utils");
const Queue = require("../services/queue");

const eventTypes = Object.freeze({
	CREATED : "Created",
	UPDATED : "Updated",
	DELETED : "Deleted"
});

function insertEventQueue(event, emitter, account, model, extraKeys, data) {
	model = !model ? "" : `::${model}`;
	extraKeys =  !extraKeys ? [] : extraKeys;
	const channel = account + model;
	const extraPrefix = !(extraKeys || []).length ? "" : `::${extraKeys.join("::")}`;
	event = `${account}${model}${extraPrefix}::${event}`;

	const msg = {
		event,
		channel,
		emitter,
		data
	};

	return Queue.insertEventMessage(msg);
}

function insertEventQueueDM(event, recipient, data) {
	const msg = {
		event,
		recipient,
		data,
		dm: true
	};

	return Queue.insertEventMessage(msg);
}

// Notifications chat events
function upsertedNotification(session, notification) {
	const msg = {
		event : notification.username + "::notificationUpserted",
		channel : notification.username,
		emitter : session,
		data : notification.notification
	};
	return Queue.insertEventMessage(msg);
}

const deletedNotification = function(session, notification) {
	const msg = {
		event : notification.username + "::notificationDeleted",
		channel : notification.username,
		emitter : session,
		data : {_id:notification.notification._id}
	};

	return Queue.insertEventMessage(msg);
};

// Resources chat events
function resourcesCreated(emitter, account, model, data) {
	return insertEventQueue("resource" + eventTypes.CREATED, emitter, account, model, null, data);
}

function resourceDeleted(emitter, account, model, data) {
	return insertEventQueue("resource" + eventTypes.DELETED, emitter, account, model, null, data);
}

// Issues chat events
function newIssues(emitter, account, model, data) {
	console.log("chat newIssues");
	return insertEventQueue("issue" + eventTypes.CREATED, emitter, account, model, null, data);
}

function issueChanged(emitter, account, model, _id, data) {
	return insertEventQueue("issue" + eventTypes.UPDATED, emitter, account, model, null , {_id,...data});
}

// comments notifications
function newComment(emitter, account, model, _id, data) {
	return insertEventQueue("comment" + eventTypes.CREATED, emitter, account, model, [utils.uuidToString(_id)], data);
}

function commentChanged(emitter, account, model, _id, data) {
	return insertEventQueue("comment" + eventTypes.UPDATED, emitter, account, model, [utils.uuidToString(_id)], data);
}

function commentDeleted(emitter, account, model, _id, data) {
	return insertEventQueue("comment" + eventTypes.DELETED, emitter, account, model, [utils.uuidToString(_id)], data);
}

function modelStatusChanged(emitter, account, model, data) {
	return insertEventQueue("modelStatusChanged", emitter, account, model, null, data);
}

// Remotely logged out
function loggedOut(recipient) {
	return insertEventQueueDM("loggedOut" , recipient, { reason: 0 });
}

// Not sure if this one is being used.
function newModel(emitter, account, data) {
	return insertEventQueue("model" + eventTypes.CREATED, emitter, account, null, null, data);
}

// Groups chat events
function newGroups(emitter, account, model, data) {
	return insertEventQueue("group" + eventTypes.CREATED, emitter, account, model, null, data);
}

function groupChanged(emitter, account, model, data) {
	return insertEventQueue("group" + eventTypes.UPDATED, emitter, account, model, null, data);
}

function groupsDeleted(emitter, account, model, ids) {
	return insertEventQueue("group" + eventTypes.DELETED, emitter, account, model, null, ids);
}

// Risks chat events
function newRisks(emitter, account, model, data) {
	return insertEventQueue("risk" + eventTypes.CREATED, emitter, account, model, null, data);
}

function riskChanged(emitter, account, model, _id, data) {
	return insertEventQueue("risk" + eventTypes.UPDATED, emitter, account, model, null, {_id, ...data});
}

// Viewpoints notifications

function viewpointsCreated(emitter, account, model, data) {
	return insertEventQueue("view" + eventTypes.CREATED, emitter, account, model, null, data);
}

function viewpointsChanged(emitter, account, model, data) {
	return insertEventQueue("view" + eventTypes.UPDATED, emitter, account, model, null, data);
}

function viewpointsDeleted(emitter, account, model, ids) {
	return insertEventQueue("view" + eventTypes.DELETED, emitter, account, model, null, ids);
}

// Presentation stream
function streamPresentation(emitter, account, model, presentationId, data) {
	return insertEventQueue("stream", emitter, account, model, ["presentation", presentationId], data);
}

// Presentation stream
function endPresentation(emitter, account, model, presentationId) {
	return insertEventQueue("end", emitter, account, model, ["presentation", presentationId]);
}

module.exports = {
	newIssues,
	newComment,
	newGroups,
	commentChanged,
	commentDeleted,
	groupChanged,
	groupsDeleted,
	newRisks,
	riskChanged,
	viewpointsChanged,
	viewpointsCreated,
	viewpointsDeleted,
	modelStatusChanged,
	issueChanged,
	newModel,
	eventTypes,
	upsertedNotification,
	deletedNotification,
	resourcesCreated,
	resourceDeleted,
	loggedOut,
	streamPresentation,
	endPresentation
};
