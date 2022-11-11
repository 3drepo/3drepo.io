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
const { UUIDToString, stringToUUID } = require('../../../utils/helper/uuids');
const { createModelMessage, createProjectMessage } = require('../../chat');
const { isFederation: isFederationCheck, newRevisionProcessed, updateModelStatus } = require('../../../models/modelSettings');
const { addTicketLog } = require('../../../models/tickets.logs');
const { EVENTS: chatEvents } = require('../../chat/chat.constants');
const { events } = require('../../eventsManager/eventsManager.constants');
const { findProjectByModelId } = require('../../../models/projectSettings');
const { getRevisionByIdOrTag } = require('../../../models/revisions');
const { getTemplateById } = require('../../../models/tickets.templates');
const { logger } = require('../../../utils/logger');
const { serialiseTicket } = require('../../../schemas/tickets');
const { setNestedProperty } = require('../../../utils/helper/objects');
const { subscribe } = require('../../eventsManager/eventsManager');

const queueStatusUpdate = async ({ teamspace, model, corId, status }) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		await updateModelStatus(teamspace, UUIDToString(projectId), model, status, corId);
	} catch (err) {
		// do nothing - the model may have been deleted before the task came back.
	}
};

const queueTasksCompleted = async ({ teamspace, model, value, corId, user, containers }) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		await newRevisionProcessed(teamspace, UUIDToString(projectId), model, corId, value, user, containers);
	} catch (err) {
		// do nothing - the model may have been deleted before the task came back.
	}
};

const modelSettingsUpdated = async ({ teamspace, project, model, data, sender, isFederation }) => {
	const event = isFederation ? chatEvents.FEDERATION_SETTINGS_UPDATE : chatEvents.CONTAINER_SETTINGS_UPDATE;
	await createModelMessage(event, data, teamspace, project, model, sender);
};

const revisionUpdated = async ({ teamspace, project, model, data, sender }) => {
	await createModelMessage(chatEvents.CONTAINER_REVISION_UPDATE, { ...data, _id: UUIDToString(data._id) },
		teamspace, project, model, sender);
};

const revisionAdded = async ({ teamspace, project, model, revision, isFederation }) => {
	try {
		const { tag, author, timestamp } = await getRevisionByIdOrTag(teamspace, model, stringToUUID(revision),
			{ _id: 0, tag: 1, author: 1, timestamp: 1 });
		const event = isFederation ? chatEvents.FEDERATION_NEW_REVISION : chatEvents.CONTAINER_NEW_REVISION;

		await createModelMessage(event, { _id: revision, tag, author, timestamp: timestamp.getTime() },
			teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to send a model message to queue: ${err?.message}`);
	}
};

const modelAdded = async ({ teamspace, project, model, data, sender, isFederation }) => {
	const event = isFederation ? chatEvents.NEW_FEDERATION : chatEvents.NEW_CONTAINER;
	await createProjectMessage(event, { ...data, _id: model }, teamspace, project, sender);
};

const modelDeleted = async ({ teamspace, project, model, sender, isFederation }) => {
	const event = isFederation ? chatEvents.FEDERATION_REMOVED : chatEvents.CONTAINER_REMOVED;
	await createModelMessage(event, {}, teamspace, project, model, sender);
};

const modelTicketAdded = async ({ teamspace, project, model, ticket }) => {
	const [isFed, template] = await Promise.all([
		isFederationCheck(teamspace, model),
		getTemplateById(teamspace, ticket.type),
	]);
	const event = isFed ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
	const serialisedTicket = serialiseTicket(ticket, template);
	await createModelMessage(event, serialisedTicket, teamspace, project, model);
};

const constructUpdatedObject = (changes) => {
	const { modules = {}, properties, ...rootProps } = changes;
	const updateData = {};
	const determineUpdateData = (obj = {}, prefix = '') => {
		Object.keys(obj).forEach((key) => {
			const updateObjProp = `${prefix}${key}`;
			const newValue = obj[key].to;
			setNestedProperty(updateData, `${updateObjProp}`, newValue);
		});
	};

	determineUpdateData(rootProps);
	determineUpdateData(properties, 'properties.');
	Object.keys(modules).forEach((mod) => {
		determineUpdateData(modules[mod], `modules.${mod}.`);
	});

	return updateData;
};

const modelTicketUpdated = async ({ teamspace, project, model, ticket, author, changes, timestamp }) => {
	try {
		const [isFed, template] = await Promise.all([
			isFederationCheck(teamspace, model),
			getTemplateById(teamspace, ticket.type),
			addTicketLog(teamspace, project, model, ticket._id, { author, changes, timestamp }),
		]);

		const updateData = constructUpdatedObject(changes);
		const event = isFed ? chatEvents.FEDERATION_UPDATE_TICKET : chatEvents.CONTAINER_UPDATE_TICKET;
		const serialisedTicket = serialiseTicket({ _id: ticket._id, ...updateData }, template);
		await createModelMessage(event, serialisedTicket, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to process ticket updated event ${err.message}`);
	}
};

const ModelEventsListener = {};

ModelEventsListener.init = () => {
	subscribe(events.QUEUED_TASK_UPDATE, queueStatusUpdate);
	subscribe(events.QUEUED_TASK_COMPLETED, queueTasksCompleted);

	subscribe(events.MODEL_SETTINGS_UPDATE, modelSettingsUpdated);
	subscribe(events.NEW_REVISION, revisionAdded);
	subscribe(events.REVISION_UPDATED, revisionUpdated);
	subscribe(events.NEW_MODEL, modelAdded);
	subscribe(events.DELETE_MODEL, modelDeleted);
	subscribe(events.NEW_TICKET, modelTicketAdded);
	subscribe(events.UPDATE_TICKET, modelTicketUpdated);
};

module.exports = ModelEventsListener;
