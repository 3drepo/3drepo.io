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

const { newRevisionProcessed, updateModelStatus } = require('../../../models/modelSettings');
const { UUIDToString } = require('../../../utils/helper/uuids');
const { EVENTS: chatEvents } = require('../../chat/chat.constants');
const { createModelMessage } = require('../../chat');
const { events } = require('../../eventsManager/eventsManager.constants');
const { findProjectByModelId } = require('../../../models/projectSettings');
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
	} catch (err) {
		// do nothing - the model may have been deleted before the task came back.
	}
};

const modelSettingsUpdated = async ({ teamspace, project, model, data, isFederation }) => {
	try {
		const event = isFederation ? chatEvents.FEDERATION_SETTINGS_UPDATE : chatEvents.CONTAINER_SETTINGS_UPDATE;
		await createModelMessage(event, data, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to send a model message to queue: ${err?.message}`);
	}
};

const ModelEventsListener = {};

ModelEventsListener.init = () => {
	subscribe(events.QUEUED_TASK_UPDATE, queueStatusUpdate);
	subscribe(events.QUEUED_TASK_COMPLETED, queueTasksCompleted);

	subscribe(events.MODEL_SETTINGS_UPDATE, modelSettingsUpdated);
};

module.exports = ModelEventsListener;
