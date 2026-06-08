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
const { getContainerFileName, getLogArchive } = require('../../modelProcessing');
const { getRevisionByIdOrTag, getRevisionFormat, onProcessingCompleted, updateProcessingStatus } = require('../../../models/revisions');
const { initialiseAutomatedProperties, onModelNameUpdated, onTemplateUpdated } = require('../../../processors/teamspaces/projects/models/commons/tickets');
const { isFederation: isFederationCheck, newRevisionProcessed, updateModelStatus } = require('../../../models/modelSettings');
const { modelTypes, processStatuses } = require('../../../models/modelSettings.constants');
const { publish, subscribe } = require('../../eventsManager/eventsManager');
const { DRAWINGS_HISTORY_COL } = require('../../../models/revisions.constants');
const { EVENTS: chatEvents } = require('../../chat/chat.constants');
const { createDrawingThumbnail } = require('../../../processors/teamspaces/projects/models/drawings');
const { templates: emailTemplates } = require('../../mailer/mailer.constants');
const { events } = require('../../eventsManager/eventsManager.constants');
const { findProjectByModelId } = require('../../../models/projectSettings');
const { generateFullSchema } = require('../../../schemas/tickets/templates');
const { getCalibrationStatus } = require('../../../processors/teamspaces/projects/models/drawings/calibrations');
const { getInfoFromCode } = require('../../../models/modelSettings.constants');
const { getRefEntryByQuery } = require('../../../models/fileRefs');
const { getTemplateById } = require('../../../models/tickets.templates');
const listenerErrorNotification = require('../listenerErrorNotification');
const { logger } = require('../../../utils/logger');
const { sendSystemEmail } = require('../../mailer');
const { serialiseComment } = require('../../../schemas/tickets/tickets.comments');
const { serialiseGroup } = require('../../../schemas/tickets/tickets.groups');
const { serialiseTicket } = require('../../../schemas/tickets');

const queueStatusUpdate = async ({ teamspace, model, modelType, corId, status }) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
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
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.QUEUED_TASK_UPDATE,
			listenerName: 'queueStatusUpdate',
			component: 'modelEvents',
			payload: {
				teamspace,
				model,
				corId,
				status,
			},
			error: err,
		});
	}
};

const queueTasksCompleted = async ({ teamspace, model, modelType, value, corId, user }) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		const errorInfo = getInfoFromCode(value);
		errorInfo.retVal = value;
		const revId = stringToUUID(corId);

		if (modelType === modelTypes.DRAWING) {
			// Revision status for drawings is tracked in the revision document - 3D will also move there eventually.
			await onProcessingCompleted(teamspace, projectId, model, revId, errorInfo, modelType);
		} else {
			await newRevisionProcessed(teamspace, projectId, model, revId, errorInfo, user);
		}
	} catch (err) {
		logger.logError(`Failed to process a completed revision for ${teamspace}.${model}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.QUEUED_TASK_COMPLETED,
			listenerName: 'queueTasksCompleted',
			component: 'modelEvents',
			payload: {
				teamspace,
				model,
				value,
				corId,
				user,
			},
			error: err,
		});
	}
};

const revisionAdded = async ({ teamspace, project, model, revId, modelType, calibration }) => {
	try {
		const {
			tag, author, timestamp, desc, rFile, format, statusCode, revCode,
		} = await getRevisionByIdOrTag(teamspace, model, modelType, revId,
			{ _id: 0, tag: 1, author: 1, timestamp: 1, desc: 1, rFile: 1, format: 1, statusCode: 1, revCode: 1 });

		if (modelTypes.DRAWING === modelType) {
			try {
				await createDrawingThumbnail(teamspace, project, model, revId);
			} catch (err) {
				// It is not critical error if we failed to create a thumbnail.
				// So catch the error and proceed
				logger.logError(`Failed to create thumbnail for drawing ${teamspace}.${model}.${revId}: ${err?.message}`);
				await listenerErrorNotification.notifyListenerFailure({
					eventName: events.MODEL_IMPORT_FINISHED,
					listenerName: 'revisionAdded.createDrawingThumbnail',
					component: 'modelEvents',
					payload: {
						teamspace,
						project,
						model,
						revId,
						modelType,
					},
					error: err,
				});
			}
		}

		const modelEvents = {
			[modelTypes.CONTAINER]: chatEvents.CONTAINER_NEW_REVISION,
			[modelTypes.FEDERATION]: chatEvents.FEDERATION_NEW_REVISION,
			[modelTypes.DRAWING]: chatEvents.DRAWING_NEW_REVISION,
		};

		await createModelMessage(modelEvents[modelType], deleteIfUndefined({
			_id: UUIDToString(revId),
			tag,
			statusCode,
			revCode,
			author,
			timestamp: timestamp.getTime(),
			desc,
			format: format ?? getRevisionFormat(rFile),
			calibration,
		}), teamspace, UUIDToString(project), model);
	} catch (err) {
		logger.logError(`Failed to send a model message to queue: ${err?.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.MODEL_IMPORT_FINISHED,
			listenerName: 'revisionAdded',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				revId,
				modelType,
				calibration,
			},
			error: err,
		});
	}
};

const modelProcessingCompleted = async ({ teamspace, project, model, revId, user, modelType, data }) => {
	try {
		const { errorReason, status } = data;
		const calibration = modelType === modelTypes.DRAWING
			? await getCalibrationStatus(teamspace, project, model, revId)
			: undefined;

		if (status === processStatuses.OK) {
			await revisionAdded({ teamspace, project, model, revId, modelType, calibration });
		} else if (!errorReason.userErr) {
			try {
				const { zipPath, logPreview } = (await getLogArchive(UUIDToString(revId))) || {};

				let fileName = 'N/A';

				if (modelType === modelTypes.DRAWING) {
					const { name } = await getRefEntryByQuery(teamspace, DRAWINGS_HISTORY_COL,
						{ rev_id: revId }, { name: 1 });
					fileName = name;
				} else if (modelType === modelTypes.CONTAINER) {
					fileName = await getContainerFileName(UUIDToString(revId));
				}

				const { errorCode } = errorReason;
				const { internalError, message } = getInfoFromCode(errorCode);

				await sendSystemEmail(emailTemplates.MODEL_IMPORT_ERROR.name,
					{
						errInfo: {
							code: `${errorCode} ${internalError}`,
							message,
						},
						teamspace,
						model,
						user,
						project: UUIDToString(project),
						revId: UUIDToString(revId),
						modelType,
						fileName,
						logExcerpt: logPreview,

					},
					zipPath ? [{ filename: 'logs.zip', path: zipPath }] : undefined,
				);
			} catch (err) {
				logger.logError('Failed to send email for model import failures');
				if (err.stack) {
					logger.logError(err.stack);
				}
				await listenerErrorNotification.notifyListenerFailure({
					eventName: events.MODEL_IMPORT_FINISHED,
					listenerName: 'modelProcessingCompleted.importFailureEmail',
					component: 'modelEvents',
					payload: {
						teamspace,
						project,
						model,
						revId,
						user,
						modelType,
						data,
					},
					error: err,
				});
			}
		}

		publish(events.MODEL_SETTINGS_UPDATE, {
			teamspace,
			project,
			model,
			data,
			modelType,
		});
	} catch (err) {
		logger.logError(`Failed to process model import completed event for ${teamspace}.${model}: ${err.message}`);
		if (err.stack) {
			logger.logError(err.stack);
		}
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.MODEL_IMPORT_FINISHED,
			listenerName: 'modelProcessingCompleted',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				revId,
				user,
				modelType,
				data,
			},
			error: err,
		});
	}
};

const modelSettingsUpdated = async ({ teamspace, project, model, data, sender, modelType }) => {
	try {
		const modelEvents = {
			[modelTypes.CONTAINER]: chatEvents.CONTAINER_SETTINGS_UPDATE,
			[modelTypes.FEDERATION]: chatEvents.FEDERATION_SETTINGS_UPDATE,
			[modelTypes.DRAWING]: chatEvents.DRAWING_SETTINGS_UPDATE,
		};

		await createModelMessage(modelEvents[modelType], data, teamspace,
			UUIDToString(project), model, sender);

		if (data.name) {
			await onModelNameUpdated(teamspace, project, model);
		}
	} catch (err) {
		logger.logError(`Failed to send model settings updated event for ${teamspace}.${model}: ${err.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.MODEL_SETTINGS_UPDATE,
			listenerName: 'modelSettingsUpdated',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				data,
				sender,
				modelType,
			},
			error: err,
		});
	}
};

const revisionUpdated = async ({ teamspace, project, model, data, sender, modelType }) => {
	try {
		const modelEvents = {
			[modelTypes.CONTAINER]: chatEvents.CONTAINER_REVISION_UPDATE,
			[modelTypes.DRAWING]: chatEvents.DRAWING_REVISION_UPDATE,
		};

		await createModelMessage(modelEvents[modelType], { ...data, _id: UUIDToString(data._id) },
			teamspace, project, model, sender);
	} catch (err) {
		logger.logError(`Failed to send revision updated event for ${teamspace}.${model}: ${err.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.REVISION_UPDATED,
			listenerName: 'revisionUpdated',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				data,
				sender,
				modelType,
			},
			error: err,
		});
	}
};

const modelAdded = async ({ teamspace, project, model, data, sender, modelType }) => {
	try {
		const modelEvents = {
			[modelTypes.CONTAINER]: chatEvents.NEW_CONTAINER,
			[modelTypes.FEDERATION]: chatEvents.NEW_FEDERATION,
			[modelTypes.DRAWING]: chatEvents.NEW_DRAWING,
		};

		await createProjectMessage(modelEvents[modelType], { ...data, _id: model }, teamspace, project, sender);
	} catch (err) {
		logger.logError(`Failed to send model added event for ${teamspace}.${model}: ${err.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.NEW_MODEL,
			listenerName: 'modelAdded',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				data,
				sender,
				modelType,
			},
			error: err,
		});
	}
};

const modelDeleted = async ({ teamspace, project, model, sender, modelType }) => {
	try {
		const modelEvents = {
			[modelTypes.CONTAINER]: chatEvents.CONTAINER_REMOVED,
			[modelTypes.FEDERATION]: chatEvents.FEDERATION_REMOVED,
			[modelTypes.DRAWING]: chatEvents.DRAWING_REMOVED,
		};

		await createModelMessage(modelEvents[modelType], {}, teamspace, project, model, sender);
	} catch (err) {
		logger.logError(`Failed to send model deleted event for ${teamspace}.${model}: ${err.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.DELETE_MODEL,
			listenerName: 'modelDeleted',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				sender,
				modelType,
			},
			error: err,
		});
	}
};

const templateUpdated = async ({ teamspace, template: templateId }) => {
	try {
		const template = await getTemplateById(teamspace, templateId);
		await onTemplateUpdated(teamspace, template);
	} catch (err) {
		logger.logError(`Failed to process template updated event ${err.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.TICKET_TEMPLATE_UPDATED,
			listenerName: 'templateUpdated',
			component: 'modelEvents',
			payload: {
				teamspace,
				template: templateId,
			},
			error: err,
		});
	}
};

const ticketAdded = async ({ teamspace, project, model, ticket }) => {
	try {
		const [isFed, template] = await Promise.all([
			isFederationCheck(teamspace, model),
			getTemplateById(teamspace, ticket.type),
		]);

		const fullTemplate = generateFullSchema(template);
		const [updatedTicket] = await initialiseAutomatedProperties(teamspace, project, model, [ticket], fullTemplate);

		const event = isFed ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
		const serialisedTicket = serialiseTicket(updatedTicket, fullTemplate);
		await createModelMessage(event, serialisedTicket, teamspace, project, model);
	} catch (err) {
		logger.logError(`Failed to process ticket added event ${err.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.NEW_TICKET,
			listenerName: 'ticketAdded',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				ticket,
			},
			error: err,
		});
	}
};

const ticketsImported = async ({ teamspace, project, model, tickets }) => {
	try {
		const [isFed, template] = await Promise.all([
			isFederationCheck(teamspace, model),
			getTemplateById(teamspace, tickets[0].type),
			addImportedLogs(teamspace, project, model, tickets),
		]);

		const fullTemplate = generateFullSchema(template);
		const updatedTickets = await initialiseAutomatedProperties(teamspace, project, model, tickets, fullTemplate);
		const event = isFed ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
		await Promise.all(updatedTickets.map(async (ticket) => {
			const serialisedTicket = serialiseTicket(ticket, fullTemplate);
			await createModelMessage(event, serialisedTicket, teamspace, project, model);
		}));
	} catch (err) {
		logger.logError(`Failed to process tickets imported event ${err.message}`);
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.TICKETS_IMPORTED,
			listenerName: 'ticketsImported',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				tickets,
			},
			error: err,
		});
	}
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
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.UPDATE_TICKET,
			listenerName: 'ticketUpdated',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				ticket,
				author,
				changes,
				timestamp,
			},
			error: err,
		});
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
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.UPDATE_TICKET_GROUP,
			listenerName: 'ticketGroupUpdated',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				ticket,
				_id,
				author,
				changes,
				timestamp,
			},
			error: err,
		});
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
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.NEW_COMMENT,
			listenerName: 'ticketCommentAdded',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				data,
			},
			error: err,
		});
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
		await listenerErrorNotification.notifyListenerFailure({
			eventName: events.UPDATE_COMMENT,
			listenerName: 'ticketCommentUpdated',
			component: 'modelEvents',
			payload: {
				teamspace,
				project,
				model,
				data,
			},
			error: err,
		});
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
	subscribe(events.TICKET_TEMPLATE_UPDATED, templateUpdated);
	subscribe(events.TICKETS_IMPORTED, ticketsImported);
	subscribe(events.UPDATE_TICKET, ticketUpdated);
	subscribe(events.NEW_COMMENT, ticketCommentAdded);
	subscribe(events.UPDATE_COMMENT, ticketCommentUpdated);
	subscribe(events.UPDATE_TICKET_GROUP, ticketGroupUpdated);
};

module.exports = ModelEventsListener;
