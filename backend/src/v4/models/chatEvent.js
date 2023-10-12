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
const archiver = require("archiver");
const fs = require("fs");
const { v5Path } = require("../../interop");
const EventsManager = require(`${v5Path}/services/eventsManager/eventsManager`);
const EventsV5 = require(`${v5Path}/services/eventsManager/eventsManager.constants`).events;
const path = require("path");
const sharedSpacePath = require("../config").cn_queue.shared_storage;
const utils = require("../utils");
const Queue = require("../services/queue");
const { sendImportError } = require("../mailer/mailer");
const { systemLogger } = require("../logger");

const eventTypes = Object.freeze({
	CREATED: "Created",
	UPDATED: "Updated",
	DELETED: "Deleted"
});

async function insertEventQueue(event, emitter, account, model, extraKeys, data) {

	let channel = `notifications::${account}`;
	if (model) {
		const { findOneProject } = require("./project");

		const project = await findOneProject(account, { models: model }, { _id: 1 });

		if (!project) {
			// models must be inside a project
			return;
		}

		const projectId = utils.uuidToString(project._id);

		channel = `${account}::${projectId}::${model}`;
	}

	model = !model ? "" : `::${model}`;
	extraKeys = !extraKeys ? [] : extraKeys;
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

// Notifications chat events
function upsertedNotification(session, notification) {
	const msg = {
		event: notification.username + "::notificationUpserted",
		channel: `notifications::${notification.username}`,
		emitter: session,
		data: notification.notification
	};
	return Queue.insertEventMessage(msg);
}

const deletedNotification = function (session, notification) {
	const msg = {
		event: notification.username + "::notificationDeleted",
		channel: `notifications::${notification.username}`,
		emitter: session,
		data: { _id: notification.notification._id }
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
	return insertEventQueue("issue" + eventTypes.CREATED, emitter, account, model, null, data);
}

function issueChanged(emitter, account, model, _id, data) {
	return insertEventQueue("issue" + eventTypes.UPDATED, emitter, account, model, null, { _id, ...data });
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
	return insertEventQueue("risk" + eventTypes.UPDATED, emitter, account, model, null, { _id, ...data });
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

const subscribeToV5Events = () => {
	EventsManager.subscribe(EventsV5.NEW_GROUPS, async ({ teamspace, model, groups }) => {
		const module = require("./group");
		const groupsSerialised = await module.getList(teamspace, model, "master", undefined, groups.map(({ _id }) => _id), {}, false);
		if (groupsSerialised.length) {
			groupsSerialised.map((newGroup) => newGroups(undefined, teamspace, model, newGroup));
		}
	});

	EventsManager.subscribe(EventsV5.UPDATE_GROUP, async ({ teamspace, model, _id }) => {
		const module = require("./group");
		const groupSerialised = await module.findByUID(teamspace, model, "master", undefined, _id, false, false);
		if (groupSerialised) {
			groupChanged(undefined, teamspace, model, groupSerialised);
		}
	});

	EventsManager.subscribe(EventsV5.NEW_MODEL, async ({ teamspace, model }) => {
		newModel(null, teamspace, { _id: model });
	});

	EventsManager.subscribe(EventsV5.MODEL_SETTINGS_UPDATE, async ({ teamspace, model, data: { status } }) => {
		if (status && !["ok", "failed"].includes(status)) {
			modelStatusChanged(null, teamspace, model, { status });
		}
	});

	EventsManager.subscribe(EventsV5.MODEL_IMPORT_FINISHED, async ({ teamspace, model, corId, success, user, userErr, errCode, message }) => {
		const { revisionCount, findLatest } = require("./history");
		const notifications = require("./notification");
		const { findModelSettingById, prepareDefaultView } = require("./modelSetting");
		const rawSettings =  await findModelSettingById(teamspace, model);
		const [nRevisions, setting]  = await Promise.all([
			revisionCount(teamspace, model),
			prepareDefaultView(teamspace, model, rawSettings)
		]);

		const data = { user, nRevisions, ...setting };
		modelStatusChanged(null, teamspace, model, data);

		if(success) {
			const rev = await findLatest(teamspace, model, {tag: 1});
			if(rev) {
				const notes = await notifications.upsertModelUpdatedNotifications(teamspace, model, rev.tag || corId);
				notes.forEach((note) => upsertedNotification(null, note));
			}
		}

		if (message) {
			const notes = await notifications.insertModelUpdatedFailedNotifications(teamspace, model, user, message);
			notes.forEach((note) => upsertedNotification(null, note));

			if (!userErr) {
				const filename = "logs.zip";
				let zipPath;
				try {
					const sharedDir = path.join(sharedSpacePath, corId);
					zipPath = path.join(sharedDir, filename);
					const output = fs.createWriteStream(zipPath);
					const archive = archiver("zip", { zlib: { level: 1 } });

					const archiveReady = new Promise((resolve, reject) => {
						output.on("close", resolve);
						output.on("error", reject);
						archive.on("error", reject);
					});

					archive.pipe(output);

					const files = fs.readdirSync(sharedDir);
					files.forEach((file) => {
						if (file.endsWith(".log")) {
							archive.file(path.join(sharedDir, file), { name: file });
						}
					});

					archive.finalize();
					await archiveReady;
				} catch (err) {
					systemLogger.logError(`Error while compressing log files for import error email: ${err.message}`);
				}

				try {
					await sendImportError({
						account: teamspace,
						model,
						username: user,
						err: message,
						corID: corId,
						bouncerErr: errCode,
						...(zipPath ? { attachments: [{ filename, path: zipPath }] } : {})
					});
				} catch (err) {
					systemLogger.logError(`Error while sending import error email: ${err.message}`);
				}
			}
		}

	});

	EventsManager.subscribe(EventsV5.SESSIONS_REMOVED, ({ ids, elective }) => {
		if (!elective) {
			const msg = {
				event: "message",
				recipients: ids.map((sessionId) => `sessions::${sessionId}`),
				data: { event: "loggedOut", reason: "You have logged in else where" }
			};

			return Queue.insertEventMessage(msg);
		}
	});

};

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
	streamPresentation,
	endPresentation,
	subscribeToV5Events
};
