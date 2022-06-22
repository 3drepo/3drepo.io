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

const { getModelById, newRevisionProcessed, updateModelStatus } = require('../../../models/modelSettings');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { EVENTS: chatEvents } = require('../../chat/chat.constants');
const { createModelMessage } = require('../../chat');
const { events } = require('../../eventsManager/eventsManager.constants');
const { findProjectByModelId } = require('../../../models/projectSettings');
const { getRevisionByIdOrTag } = require('../../../models/revisions');
const { logger } = require('../../../utils/logger');
const { subscribe } = require('../../eventsManager/eventsManager');

const queueStatusUpdate = async ({ teamspace, model, corId, status }) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		await updateModelStatus(teamspace, UUIDToString(projectId), model, status, corId);
	} catch (err) {
		// do nothing - the model may have been deleted before the task came back.
	}
};
const queueTasksCompleted = async ({
	teamspace, model, value, corId, user, containers,
}) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		await newRevisionProcessed(teamspace, UUIDToString(projectId), model, corId, value, user, containers);

		const { tag, author, timestamp } = await getRevisionByIdOrTag(teamspace, model, corId,
			{ _id: 0, tag: 1, author: 1, timestamp: 1 });
		const { federate } = await getModelById(teamspace, model, { _id: 0, federate: 1 });
		const event = federate ? chatEvents.FEDERATION_NEW_REVISION : chatEvents.CONTAINER_NEW_REVISION;
		await createModelMessage(event, { tag, author, timestamp }, teamspace, projectId, model);
	} catch (err) {
		// do nothing - the model may have been deleted before the task came back.
	}
};

const modelSettingsUpdated = async ({ teamspace, project, model, data, sender, isFederation }) => {
	try {
		const event = isFederation ? chatEvents.FEDERATION_SETTINGS_UPDATE : chatEvents.CONTAINER_SETTINGS_UPDATE;
		await createModelMessage(event, data, teamspace, project, model, sender);
	} catch (err) {
		logger.logError(`Failed to send a model message to queue: ${err?.message}`);
	}
};

const revisionUpdated = async ({ teamspace, project, model, data }) => {
	try {
		await createModelMessage(chatEvents.CONTAINER_REVISION_UPDATE, { ...data, _id: UUIDToString(data._id) },
			teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to send a model message to queue: ${err?.message}`);
	}
};

const modelDeleted = async ({ teamspace, project, model, isFederation }) => {
	try {
		const event = isFederation ? chatEvents.FEDERATION_REMOVED : chatEvents.CONTAINER_REMOVED;
		await createModelMessage(event, {}, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to send a model message to queue: ${err?.message}`);
	}
};

const ModelEventsListener = {};

ModelEventsListener.init = () => {
	subscribe(events.QUEUED_TASK_UPDATE, queueStatusUpdate);
	subscribe(events.QUEUED_TASK_COMPLETED, queueTasksCompleted);

	subscribe(events.MODEL_SETTINGS_UPDATE, modelSettingsUpdated);
	subscribe(events.REVISION_UPDATED, revisionUpdated);
	subscribe(events.DELETE_MODEL, modelDeleted);
};

module.exports = ModelEventsListener;
