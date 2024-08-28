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
const { addGroupUpdateLog, addImportedLogs, addTicketLog } = require('../../../models/tickets.logs');
const { createModelMessage, createProjectMessage } = require('../../chat');
const { deleteIfUndefined, setNestedProperty } = require('../../../utils/helper/objects');
const { getModelType, isFederation: isFederationCheck, newRevisionProcessed, updateModelStatus } = require('../../../models/modelSettings');
const { getRevisionByIdOrTag, getRevisionFormat, onProcessingCompleted, updateProcessingStatus } = require('../../../models/revisions');
const { EVENTS: chatEvents } = require('../../chat/chat.constants');
const { createDrawingThumbnail } = require('../../../processors/teamspaces/projects/models/drawings');
const { templates: emailTemplates } = require('../../mailer/mailer.constants');
const { events } = require('../../eventsManager/eventsManager.constants');
const { findProjectByModelId } = require('../../../models/projectSettings');
const { generateFullSchema } = require('../../../schemas/tickets/templates');
const { getInfoFromCode } = require('../../../models/modelSettings.constants');
const { getLogArchive } = require('../../modelProcessing');
const { getTemplateById } = require('../../../models/tickets.templates');
const { logger } = require('../../../utils/logger');
const { modelTypes } = require('../../../models/modelSettings.constants');
const { sendSystemEmail } = require('../../mailer');
const { serialiseComment } = require('../../../schemas/tickets/tickets.comments');
const { serialiseGroup } = require('../../../schemas/tickets/tickets.groups');
const { serialiseTicket } = require('../../../schemas/tickets');
const { subscribe } = require('../../eventsManager/eventsManager');

const queueStatusUpdate = async ({ teamspace, model, corId, status }) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		const modelType = await getModelType(teamspace, model);
		const revId = stringToUUID(corId);
		if (modelType === modelTypes.DRAWING) {
			// status are stored in individual revisions on drawings. Eventually this will be the same for others.
			await updateProcessingStatus(teamspace, projectId, model, modelType, revId, status);
		} else {
			await updateModelStatus(teamspace, projectId, model, status, revId);
		}
	} catch (err) {
		logger.logError(`Failed to update model status for ${teamspace}.${model}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const queueTasksCompleted = async ({ teamspace, model, value, corId, user, containers }) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		const modelType = await getModelType(teamspace, model);
		const errorInfo = getInfoFromCode(value);
		errorInfo.retVal = value;
		const revId = stringToUUID(corId);

		if (modelType === modelTypes.DRAWING) {
			// Revision status for drawings is tracked in the revision document - 3D will also move there eventually.
			await onProcessingCompleted(teamspace, projectId, model, revId, errorInfo, modelType);
		} else {
			await newRevisionProcessed(teamspace, projectId, model, revId, errorInfo, user, containers);
		}
	} catch (err) {
		logger.logError(`Failed to process a completed revision for ${teamspace}.${model}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const revisionAdded = async ({ teamspace, project, model, revId, modelType }) => {
	try {
		const {
			tag, author, timestamp, desc, rFile, format, statusCode, revCode,
		} = await getRevisionByIdOrTag(teamspace, model, modelType, revId,
			{ _id: 0, tag: 1, author: 1, timestamp: 1, desc: 1, rFile: 1, format: 1, statusCode: 1, revCode: 1 });

		if (modelTypes.DRAWING === modelType) {
			createDrawingThumbnail(teamspace, project, model, revId).catch((err) => {
				// It is not critical error if we failed to create a thumbnail.
				// So catch the error and proceed
				logger.logError(`Failed to create thumbnail for drawing ${teamspace}.${model}.${revId}: ${err?.message}`);
			});
		}

		const modelEvents = {
			[modelTypes.CONTAINER]: chatEvents.CONTAINER_NEW_REVISION,
			[modelTypes.FEDERATION]: chatEvents.FEDERATION_NEW_REVISION,
			[modelTypes.DRAWING]: chatEvents.DRAWING_NEW_REVISION,
		};

		await createModelMessage(modelEvents[modelType], deleteIfUndefined({ _id: UUIDToString(revId),
			tag,
			statusCode,
			revCode,
			author,
			timestamp: timestamp.getTime(),
			desc,
			...deleteIfUndefined({ format: format ?? getRevisionFormat(rFile) }),
		}), teamspace, UUIDToString(project), model);
	} catch (err) {
		logger.logError(`Failed to send a model message to queue: ${err?.message}`);
	}
};

const modelProcessingCompleted = async ({ teamspace, project, model, success, message,
	userErr, revId, errCode, user, modelType }) => {
	if (success) {
		revisionAdded({ teamspace, project, model, revId, modelType });
	} else if (!userErr) {
		try {
			const { zipPath, logPreview } = (await getLogArchive(UUIDToString(revId))) || {};

			await sendSystemEmail(emailTemplates.MODEL_IMPORT_ERROR.name,
				{
					errInfo: {
						code: errCode,
						message,
					},
					teamspace,
					model,
					user,
					project: UUIDToString(project),
					revId: UUIDToString(revId),
					modelType,
					logExcerpt: logPreview,

				},
				zipPath ? [{ filename: 'logs.zip', path: zipPath }] : undefined,
			);
		} catch (err) {
			logger.logError('Failed to send email for model import failures');
			if (err.stack) {
				logger.logError(err.stack);
			}
		}
	}
};

const modelSettingsUpdated = async ({ teamspace, project, model, data, sender, modelType }) => {
	const modelEvents = {
		[modelTypes.CONTAINER]: chatEvents.CONTAINER_SETTINGS_UPDATE,
		[modelTypes.FEDERATION]: chatEvents.FEDERATION_SETTINGS_UPDATE,
		[modelTypes.DRAWING]: chatEvents.DRAWING_SETTINGS_UPDATE,
	};

	await createModelMessage(modelEvents[modelType], data, teamspace, UUIDToString(project), model, sender);
};

const revisionUpdated = async ({ teamspace, project, model, data, sender, modelType }) => {
	const modelEvents = {
		[modelTypes.CONTAINER]: chatEvents.CONTAINER_REVISION_UPDATE,
		[modelTypes.DRAWING]: chatEvents.DRAWING_REVISION_UPDATE,
	};

	await createModelMessage(modelEvents[modelType], { ...data, _id: UUIDToString(data._id) },
		teamspace, project, model, sender);
};

const modelAdded = async ({ teamspace, project, model, data, sender, modelType }) => {
	const modelEvents = {
		[modelTypes.CONTAINER]: chatEvents.NEW_CONTAINER,
		[modelTypes.FEDERATION]: chatEvents.NEW_FEDERATION,
		[modelTypes.DRAWING]: chatEvents.NEW_DRAWING,
	};

	await createProjectMessage(modelEvents[modelType], { ...data, _id: model }, teamspace, project, sender);
};

const modelDeleted = async ({ teamspace, project, model, sender, modelType }) => {
	const modelEvents = {
		[modelTypes.CONTAINER]: chatEvents.CONTAINER_REMOVED,
		[modelTypes.FEDERATION]: chatEvents.FEDERATION_REMOVED,
		[modelTypes.DRAWING]: chatEvents.DRAWING_REMOVED,
	};

	await createModelMessage(modelEvents[modelType], {}, teamspace, project, model, sender);
};

const ticketAdded = async ({ teamspace, project, model, ticket }) => {
	const [isFed, template] = await Promise.all([
		isFederationCheck(teamspace, model),
		getTemplateById(teamspace, ticket.type),
	]);

	const fullTemplate = generateFullSchema(template);

	const event = isFed ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
	const serialisedTicket = serialiseTicket(ticket, fullTemplate);
	await createModelMessage(event, serialisedTicket, teamspace, project, model);
};

const ticketsImported = async ({ teamspace, project, model, tickets }) => {
	const [isFed, template] = await Promise.all([
		isFederationCheck(teamspace, model),
		getTemplateById(teamspace, tickets[0].type),
		addImportedLogs(teamspace, project, model, tickets),
	]);

	const fullTemplate = generateFullSchema(template);
	const event = isFed ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
	await Promise.all(tickets.map(async (ticket) => {
		const serialisedTicket = serialiseTicket(ticket, fullTemplate);
		await createModelMessage(event, serialisedTicket, teamspace, project, model);
	}));
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

const ticketUpdated = async ({ teamspace, project, model, ticket, author, changes, timestamp }) => {
	try {
		const [isFed, template] = await Promise.all([
			isFederationCheck(teamspace, model),
			getTemplateById(teamspace, ticket.type),
			addTicketLog(teamspace, project, model, ticket._id, { author, changes, timestamp }),
		]);
		const fullTemplate = generateFullSchema(template);

		const updateData = constructUpdatedObject(changes);
		const event = isFed ? chatEvents.FEDERATION_UPDATE_TICKET : chatEvents.CONTAINER_UPDATE_TICKET;
		const serialisedTicket = serialiseTicket({ _id: ticket._id, ...updateData }, fullTemplate);
		await createModelMessage(event, serialisedTicket, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to process ticket updated event ${err.message}`);
	}
};

const ticketGroupUpdated = async ({ teamspace, project, model, ticket, _id, author, changes, timestamp }) => {
	try {
		const [isFed] = await Promise.all([
			isFederationCheck(teamspace, model),
			addGroupUpdateLog(teamspace, project, model, ticket._id, _id, { author, changes, timestamp }),
		]);

		const event = isFed ? chatEvents.FEDERATION_UPDATE_TICKET_GROUP : chatEvents.CONTAINER_UPDATE_TICKET_GROUP;
		const serialisedMsg = serialiseGroup({ _id, ticket, ...changes });
		await createModelMessage(event, serialisedMsg, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to process group updated event ${err.message}`);
	}
};

const ticketCommentAdded = async ({ teamspace, project, model, data }) => {
	try {
		const isFed = await isFederationCheck(teamspace, model);
		const event = isFed ? chatEvents.FEDERATION_NEW_TICKET_COMMENT : chatEvents.CONTAINER_NEW_TICKET_COMMENT;
		const serialisedComment = serialiseComment(data);
		await createModelMessage(event, serialisedComment, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to process comment added event ${err.message}`);
	}
};

const ticketCommentUpdated = async ({ teamspace, project, model, data }) => {
	try {
		const isFed = await isFederationCheck(teamspace, model);
		const event = isFed ? chatEvents.FEDERATION_UPDATE_TICKET_COMMENT : chatEvents.CONTAINER_UPDATE_TICKET_COMMENT;
		const serialisedComment = serialiseComment(data);
		await createModelMessage(event, serialisedComment, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to process comment updated event ${err.message}`);
	}
};

const ModelEventsListener = {};

ModelEventsListener.init = () => {
	subscribe(events.QUEUED_TASK_UPDATE, queueStatusUpdate);
	subscribe(events.QUEUED_TASK_COMPLETED, queueTasksCompleted);

	subscribe(events.MODEL_IMPORT_FINISHED, modelProcessingCompleted);
	subscribe(events.MODEL_SETTINGS_UPDATE, modelSettingsUpdated);
	subscribe(events.REVISION_UPDATED, revisionUpdated);
	subscribe(events.NEW_MODEL, modelAdded);
	subscribe(events.DELETE_MODEL, modelDeleted);
	subscribe(events.NEW_TICKET, ticketAdded);
	subscribe(events.TICKETS_IMPORTED, ticketsImported);
	subscribe(events.UPDATE_TICKET, ticketUpdated);
	subscribe(events.NEW_COMMENT, ticketCommentAdded);
	subscribe(events.UPDATE_COMMENT, ticketCommentUpdated);
	subscribe(events.UPDATE_TICKET_GROUP, ticketGroupUpdated);
};

module.exports = ModelEventsListener;
