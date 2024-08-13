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

const { times } = require('lodash');
const { UUIDToString, stringToUUID, generateUUIDString } = require('../../../../../src/v5/utils/helper/uuids');
const { templates } = require('../../../../../src/v5/utils/responseCodes');
const { src } = require('../../../helper/path');
const { generateRandomString, generateUUID, generateRandomDate, generateRandomObject, generateTemplate } = require('../../../helper/services');

const { modelTypes, getInfoFromCode } = require(`${src}/models/modelSettings.constants`);

jest.mock('../../../../../src/v5/models/modelSettings');
const ModelSettings = require(`${src}/models/modelSettings`);

jest.mock('../../../../../src/v5/models/projectSettings');
const ProjectSettings = require(`${src}/models/projectSettings`);

jest.mock('../../../../../src/v5/models/revisions');
const Revisions = require(`${src}/models/revisions`);

jest.mock('../../../../../src/v5/models/tickets.logs');
const TicketLogs = require(`${src}/models/tickets.logs`);

jest.mock('../../../../../src/v5/models/tickets.templates');
const TicketTemplates = require(`${src}/models/tickets.templates`);

jest.mock('../../../../../src/v5/schemas/tickets/tickets.comments');
const CommentSchemas = require(`${src}/schemas/tickets/tickets.comments`);

jest.mock('../../../../../src/v5/schemas/tickets/tickets.groups');
const TicketGroupSchemas = require(`${src}/schemas/tickets/tickets.groups`);

jest.mock('../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);
const { templates: mailTemplates } = require(`${src}/services/mailer/mailer.constants`);

jest.mock('../../../../../src/v5/services/modelProcessing');
const ModPro = require(`${src}/services/modelProcessing`);

jest.mock('../../../../../src/v5/services/chat');
const ChatService = require(`${src}/services/chat`);
const { EVENTS: chatEvents } = require(`${src}/services/chat/chat.constants`);

const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);
const EventsListener = require(`${src}/services/eventsListener/eventsListener`);

const eventTriggeredPromise = (event) => new Promise(
	(resolve) => EventsManager.subscribe(event, () => setTimeout(resolve, 10)),
);

const testQueueTaskUpdate = () => {
	describe(events.QUEUED_TASK_UPDATE, () => {
		test(`Should trigger updateModelStatus if there is a ${events.QUEUED_TASK_UPDATE} (${modelTypes.CONTAINER})`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				status: generateRandomString(),
			};
			await EventsManager.publish(events.QUEUED_TASK_UPDATE, data);
			await waitOnEvent;
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledTimes(1);
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledWith(data.teamspace, project,
				data.model, data.status, data.corId);
		});

		test(`Should trigger updateProcessingStatus if there is a ${events.QUEUED_TASK_UPDATE} (${modelTypes.DRAWING})`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });
			ModelSettings.getModelType.mockResolvedValueOnce(modelTypes.DRAWING);
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateUUIDString(),
				status: generateRandomString(),
			};
			await EventsManager.publish(events.QUEUED_TASK_UPDATE, data);
			await waitOnEvent;
			expect(Revisions.updateProcessingStatus).toHaveBeenCalledTimes(1);
			expect(Revisions.updateProcessingStatus).toHaveBeenCalledWith(data.teamspace, project,
				data.model, modelTypes.DRAWING, stringToUUID(data.corId), data.status);

			expect(ModelSettings.updateModelStatus).not.toHaveBeenCalled();
		});

		test(`Should fail gracefully on error if there is a ${events.QUEUED_TASK_UPDATE}`, async () => {
			ProjectSettings.findProjectByModelId.mockRejectedValueOnce(templates.projectNotFound);
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				status: generateRandomString(),
			};
			await EventsManager.publish(events.QUEUED_TASK_UPDATE, data);
			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.updateModelStatus).toHaveBeenCalledTimes(0);
		});

		test(`Should fail gracefully on error if there is a ${events.QUEUED_TASK_UPDATE} (Rejected with an error object)`,
			async () => {
				ProjectSettings.findProjectByModelId.mockRejectedValueOnce(new Error(generateRandomString()));
				const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_UPDATE);
				const data = {
					teamspace: generateRandomString(),
					model: generateRandomString(),
					corId: generateRandomString(),
					status: generateRandomString(),
				};
				await EventsManager.publish(events.QUEUED_TASK_UPDATE, data);
				await waitOnEvent;
				expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
				expect(ProjectSettings.findProjectByModelId)
					.toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
				expect(ModelSettings.updateModelStatus).toHaveBeenCalledTimes(0);
			});
	});
};

const testQueueTaskCompleted = () => {
	describe(events.QUEUED_TASK_COMPLETED, () => {
		test(`Should trigger newRevisionProcessed if there is a ${events.QUEUED_TASK_COMPLETED} (${modelTypes.CONTAINER})`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });

			ModelSettings.getModelType.mockResolvedValueOnce(modelTypes.CONTAINER);
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: 0,
				user: generateRandomString(),
				containers: [generateRandomString()],
			};
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);
			const dataInfo = getInfoFromCode(data.value);
			dataInfo.retVal = data.value;

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });

			expect(ModelSettings.getModelType).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getModelType).toHaveBeenCalledWith(data.teamspace, data.model);

			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(1);
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledWith(data.teamspace, project, data.model,
				data.corId, dataInfo, data.user, data.containers);
		});

		test(`Should trigger onProcessingCompleted if there is a ${events.QUEUED_TASK_COMPLETED} (${modelTypes.DRAWING})`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });
			ModelSettings.getModelType.mockResolvedValueOnce(modelTypes.DRAWING);
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: 0,
				user: generateRandomString(),
			};
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);
			const dataInfo = getInfoFromCode(data.value);
			dataInfo.retVal = data.value;

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });

			expect(ModelSettings.getModelType).toHaveBeenCalledTimes(1);
			expect(ModelSettings.getModelType).toHaveBeenCalledWith(data.teamspace, data.model);

			expect(Revisions.onProcessingCompleted).toHaveBeenCalledTimes(1);
			expect(Revisions.onProcessingCompleted).toHaveBeenCalledWith(data.teamspace, project, data.model,
				data.corId, dataInfo, modelTypes.DRAWING);
			expect(ModelSettings.newRevisionProcessed).not.toHaveBeenCalled();
		});

		test(`Should fail gracefully on error if there is a ${events.QUEUED_TASK_COMPLETED}`, async () => {
			ProjectSettings.findProjectByModelId.mockRejectedValueOnce(templates.projectNotFound);
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: generateRandomString(),
				user: generateRandomString(),
				containers: [generateRandomString()],
			};
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(0);
		});

		test(`Should fail gracefully on error if there is a ${events.QUEUED_TASK_COMPLETED} (Rejected with an error object)`, async () => {
			ProjectSettings.findProjectByModelId.mockRejectedValueOnce(new Error(generateRandomString()));
			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: generateRandomString(),
				user: generateRandomString(),
				containers: [generateRandomString()],
			};
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(0);
		});

		test(`Should trigger newRevisionProcessed if there is a ${events.QUEUED_TASK_COMPLETED} (federation)`, async () => {
			const project = generateRandomString();
			ProjectSettings.findProjectByModelId.mockResolvedValueOnce({ _id: project });

			const waitOnEvent = eventTriggeredPromise(events.QUEUED_TASK_COMPLETED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				corId: generateRandomString(),
				value: 1,
				user: generateRandomString(),
				containers: [generateRandomString()],
			};

			const dataInfo = getInfoFromCode(data.value);
			dataInfo.retVal = data.value;
			EventsManager.publish(events.QUEUED_TASK_COMPLETED, data);

			await waitOnEvent;
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledTimes(1);
			expect(ProjectSettings.findProjectByModelId).toHaveBeenCalledWith(data.teamspace, data.model, { _id: 1 });
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledTimes(1);
			expect(ModelSettings.newRevisionProcessed).toHaveBeenCalledWith(data.teamspace, project, data.model,
				data.corId, dataInfo, data.user, data.containers);
		});
	});
};

const testModelProcessingCompleted = () => {
	describe(events.MODEL_IMPORT_FINISHED, () => {
		describe.each([
			[true, false, false],
		])('', (sendMail, success, userErr) => {
			test(`Should ${sendMail ? 'not ' : ''} send an email if model import ${success ? 'succeeded' : 'failed'}${!success && userErr ? ' due to an user error' : ''}`, async () => {
				const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
				const data = {
					teamspace: generateRandomString(),
					model: generateRandomString(),
					project: generateUUID(),
					success,
					message: generateRandomString(),
					userErr,
					revId: generateUUID(),
					user: generateRandomString(),
					modelType: modelTypes.FEDERATION,
				};

				const zipPath = generateRandomString();
				const logPreview = generateRandomString();
				if (sendMail) {
					ModPro.getLogArchive.mockResolvedValueOnce({ zipPath, logPreview });
				}

				EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

				await waitOnEvent;

				if (sendMail) {
					expect(ModPro.getLogArchive).toHaveBeenCalledTimes(1);
					expect(ModPro.getLogArchive).toHaveBeenCalledWith(UUIDToString(data.revId));

					const mailerData = {
						errInfo: {
							code: data.errCode,
							message: data.message,
						},
						teamspace: data.teamspace,
						model: data.model,
						user: data.user,
						project: UUIDToString(data.project),
						revId: UUIDToString(data.revId),
						modelType: data.modelType,
						logExcerpt: logPreview,

					};

					expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
					expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(mailTemplates.MODEL_IMPORT_ERROR.name, mailerData, [{ filename: 'logs.zip', path: zipPath }]);
				} else {
					expect(ModPro.getLogArchive).not.toHaveBeenCalled();
					expect(Mailer.sendSystemEmail).not.toHaveBeenCalled();
				}
			});
		});

		test('Should fail gracefully if an error was thrown', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				success: false,
				message: generateRandomString(),
				userErr: false,
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.FEDERATION,
			};

			ModPro.getLogArchive.mockRejectedValueOnce(generateRandomString());

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;
		});

		test('Should fail gracefully if an error was thrown (error object)', async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_IMPORT_FINISHED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateUUID(),
				success: false,
				message: generateRandomString(),
				userErr: false,
				revId: generateUUID(),
				user: generateRandomString(),
				modelType: modelTypes.FEDERATION,
			};

			ModPro.getLogArchive.mockRejectedValueOnce(new Error());

			EventsManager.publish(events.MODEL_IMPORT_FINISHED, data);

			await waitOnEvent;
		});
	});
};

const testModelSettingsUpdate = () => {
	describe(events.MODEL_SETTINGS_UPDATE, () => {
		test(`Should create a ${chatEvents.FEDERATION_SETTINGS_UPDATE} chat event if there is a ${events.MODEL_SETTINGS_UPDATE} (federation)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_SETTINGS_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				modelType: modelTypes.FEDERATION,
			};
			EventsManager.publish(events.MODEL_SETTINGS_UPDATE, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.FEDERATION_SETTINGS_UPDATE,
				data.data,
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.CONTAINER_SETTINGS_UPDATE} chat event if there is a ${events.MODEL_SETTINGS_UPDATE} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.MODEL_SETTINGS_UPDATE);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				modelType: modelTypes.CONTAINER,
			};
			EventsManager.publish(events.MODEL_SETTINGS_UPDATE, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_SETTINGS_UPDATE,
				data.data,
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});
	});
};

const testRevisionUpdated = () => {
	describe(events.REVISION_UPDATED, () => {
		test(`Should create a ${chatEvents.CONTAINER_REVISION_UPDATE} chat event if there is a ${events.REVISION_UPDATED}`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.REVISION_UPDATED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { _id: generateUUID() },
				modelType: modelTypes.CONTAINER,
			};
			EventsManager.publish(events.REVISION_UPDATED, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_REVISION_UPDATE,
				{ ...data.data, _id: UUIDToString(data.data._id) },
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.DRAWING_REVISION_UPDATE} chat event if there is a ${events.REVISION_UPDATED} and model type is drawing`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.REVISION_UPDATED);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				data: { _id: generateUUID() },
				modelType: modelTypes.DRAWING,
			};
			EventsManager.publish(events.REVISION_UPDATED, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.DRAWING_REVISION_UPDATE,
				{ ...data.data, _id: UUIDToString(data.data._id) },
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});
	});
};
const testNewModel = () => {
	describe(events.NEW_MODEL, () => {
		test(`Should create a ${chatEvents.NEW_FEDERATION} chat event if there is a ${events.NEW_MODEL} (federation)`, async () => {
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				modelType: modelTypes.FEDERATION,
			};
			const waitOnEvent = eventTriggeredPromise(events.NEW_MODEL);
			await EventsManager.publish(events.NEW_MODEL, data);
			await waitOnEvent;
			expect(ChatService.createProjectMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createProjectMessage).toHaveBeenCalledWith(
				chatEvents.NEW_FEDERATION,
				{ ...data.data, _id: data.model },
				data.teamspace,
				data.project,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.NEW_CONTAINER} chat event if there is a ${events.NEW_MODEL} (container)`, async () => {
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: { [generateRandomString()]: generateRandomString() },
				modelType: modelTypes.CONTAINER,
				undefined,
			};
			const waitOnEvent = eventTriggeredPromise(events.NEW_MODEL);
			await EventsManager.publish(events.NEW_MODEL, data);
			await waitOnEvent;
			expect(ChatService.createProjectMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createProjectMessage).toHaveBeenCalledWith(
				chatEvents.NEW_CONTAINER,
				{ ...data.data, _id: data.model },
				data.teamspace,
				data.project,
				undefined,
			);
		});
	});
};
const testDeleteModel = () => {
	describe(events.DELETE_MODEL, () => {
		test(`Should create a ${chatEvents.FEDERATION_REMOVED} chat event if there is a ${events.DELETE_MODEL} (federation)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.DELETE_MODEL);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				modelType: modelTypes.FEDERATION,
			};
			EventsManager.publish(events.DELETE_MODEL, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.FEDERATION_REMOVED,
				{},
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});

		test(`Should create a ${chatEvents.CONTAINER_REMOVED} chat event if there is a ${events.DELETE_MODEL} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.DELETE_MODEL);
			const data = {
				teamspace: generateRandomString(),
				model: generateRandomString(),
				project: generateRandomString(),
				modelType: modelTypes.CONTAINER,
			};
			EventsManager.publish(events.DELETE_MODEL, data);

			await waitOnEvent;
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_REMOVED,
				{},
				data.teamspace,
				data.project,
				data.model,
				undefined,
			);
		});
	});
};
const testNewRevision = () => {
	describe(events.NEW_REVISION, () => {
		test(`Should create a ${chatEvents.CONTAINER_NEW_REVISION} chat event if there is a ${events.NEW_REVISION} (container)`, async () => {
			const tag = generateRandomString();
			const author = generateRandomString();
			const desc = generateRandomString();
			const format = generateRandomString();
			const rFile = [`${generateRandomString()}_${format}`];
			const timestamp = generateRandomDate();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp, rFile, desc });
			Revisions.getRevisionFormat.mockReturnValueOnce(`.${format}`);

			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateRandomString(),
				revision: generateRandomString(),
				modelType: modelTypes.CONTAINER,
			};
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;

			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model,
				modelTypes.CONTAINER, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1, desc: 1, rFile: 1, format: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.CONTAINER_NEW_REVISION,
				{ _id: data.revision, tag, author, timestamp: timestamp.getTime(), desc, format: `.${format}` },
				data.teamspace,
				UUIDToString(data.project),
				data.model,
			);
		});

		test(`Should create a ${chatEvents.DRAWING_NEW_REVISION} chat event if there is a ${events.NEW_REVISION} (drawing)`, async () => {
			const tag = generateRandomString();
			const author = generateRandomString();
			const desc = generateRandomString();
			const format = generateRandomString();
			const rFile = [generateRandomString()];
			const timestamp = generateRandomDate();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp, rFile, desc, format });

			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateRandomString(),
				revision: generateRandomString(),
				modelType: modelTypes.DRAWING,
			};
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;

			expect(Revisions.getRevisionFormat).not.toHaveBeenCalled();
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model, modelTypes.DRAWING,
				data.revision, { _id: 0, tag: 1, author: 1, timestamp: 1, desc: 1, rFile: 1, format: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.DRAWING_NEW_REVISION,
				{ _id: data.revision, tag, author, timestamp: timestamp.getTime(), desc, format },
				data.teamspace,
				UUIDToString(data.project),
				data.model,
			);
		});

		test(`Should create a ${chatEvents.FEDERATION_NEW_REVISION} chat event if if there is a ${events.NEW_REVISION} (federation)`, async () => {
			const tag = generateRandomString();
			const author = generateRandomString();
			const timestamp = generateRandomDate();
			Revisions.getRevisionByIdOrTag.mockResolvedValueOnce({ tag, author, timestamp });

			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);
			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateRandomString(),
				revision: generateRandomString(),
				modelType: modelTypes.FEDERATION,
			};
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model,
				modelTypes.FEDERATION, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1, desc: 1, rFile: 1, format: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				chatEvents.FEDERATION_NEW_REVISION,
				{ _id: data.revision, tag, author, timestamp: timestamp.getTime() },
				data.teamspace,
				UUIDToString(data.project),
				data.model,
			);
		});

		test(`Should fail gracefully on error if there is a ${events.NEW_REVISION} (container)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);

			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateRandomString(),
				revision: generateRandomString(),
				modelType: modelTypes.CONTAINER,
			};

			Revisions.getRevisionByIdOrTag.mockRejectedValueOnce(templates.revisionNotFound);
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model,
				modelTypes.CONTAINER, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1, desc: 1, rFile: 1, format: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(0);
		});

		test(`Should fail gracefully on error if there is a ${events.NEW_REVISION} (container)(Rejected with an error object)`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.NEW_REVISION);

			const data = {
				teamspace: generateRandomString(),
				project: generateUUID(),
				model: generateRandomString(),
				revision: generateRandomString(),
				modelType: modelTypes.CONTAINER,
			};

			Revisions.getRevisionByIdOrTag.mockRejectedValueOnce(new Error(generateRandomString()));
			EventsManager.publish(events.NEW_REVISION, data);

			await waitOnEvent;
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledTimes(1);
			expect(Revisions.getRevisionByIdOrTag).toHaveBeenCalledWith(data.teamspace, data.model,
				modelTypes.CONTAINER, data.revision,
				{ _id: 0, tag: 1, author: 1, timestamp: 1, desc: 1, rFile: 1, format: 1 });
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(0);
		});
	});
};
const testUpdateTicket = () => {
	const updateTicketTest = async (isFederation, changes, expectedData) => {
		const waitOnEvent = eventTriggeredPromise(events.UPDATE_TICKET);
		const template = generateTemplate();
		const data = {
			teamspace: generateRandomString(),
			project: generateRandomString(),
			model: generateRandomString(),
			ticket: { _id: generateRandomString(), title: generateRandomString() },
			author: generateRandomString(),
			timestamp: generateRandomDate(),
			changes,
		};

		TicketTemplates.getTemplateById.mockResolvedValueOnce(template);
		ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
		const event = isFederation ? chatEvents.FEDERATION_UPDATE_TICKET : chatEvents.CONTAINER_UPDATE_TICKET;
		EventsManager.publish(events.UPDATE_TICKET, data);

		await waitOnEvent;
		expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
		expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
		expect(TicketLogs.addTicketLog).toHaveBeenCalledTimes(1);
		expect(TicketLogs.addTicketLog).toHaveBeenCalledWith(data.teamspace, data.project, data.model,
			data.ticket._id, { author: data.author, changes: data.changes, timestamp: data.timestamp });
		expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
		expect(ChatService.createModelMessage).toHaveBeenCalledWith(
			event,
			{
				_id: data.ticket._id,
				...expectedData,
			},
			data.teamspace,
			data.project,
			data.model,
		);
	};
	describe(events.UPDATE_TICKET, () => {
		test(`Should fail gracefully on error if there is an ${events.UPDATE_TICKET} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.UPDATE_TICKET);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: { _id: generateRandomString(), title: generateRandomString() },
				author: generateRandomString(),
				timestamp: generateRandomDate(),
				changes: generateRandomString(),
			};

			ModelSettings.isFederation.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.UPDATE_TICKET, data);

			await waitOnEvent;
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
			expect(TicketLogs.addTicketLog).toHaveBeenCalledTimes(1);
			expect(TicketLogs.addTicketLog).toHaveBeenCalledWith(data.teamspace, data.project, data.model,
				data.ticket._id, { author: data.author, changes: data.changes, timestamp: data.timestamp });
			expect(ChatService.createModelMessage).not.toHaveBeenCalled();
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.CONTAINER_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} and title has been updated (Container)`, async () => {
			const changes = { title: { from: generateRandomString(), to: generateRandomString() } };
			const expectedData = { title: changes.title.to };
			await updateTicketTest(false, changes, expectedData);
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.CONTAINER_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} and a prop has been updated (Container)`, async () => {
			const changes = { properties: { prop: { from: generateRandomString(), to: generateRandomString() } } };
			const expectedData = { properties: { prop: changes.properties.prop.to } };
			await updateTicketTest(false, changes, expectedData);
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.CONTAINER_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} and a module prop has been updated (Container)`, async () => {
			const changes = {
				modules: {
					mod: {
						modProp: { from: generateRandomString(), to: generateRandomString() },
					},
				},
			};
			const expectedData = { modules: { mod: { modProp: changes.modules.mod.modProp.to } } };
			await updateTicketTest(false, changes, expectedData);
		});

		test(`Should trigger addTicketLog and create a ${chatEvents.FEDERATION_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} and title has been updated (Federation)`, async () => {
			const changes = { title: { from: generateRandomString(), to: generateRandomString() } };
			const expectedData = { title: changes.title.to };
			await updateTicketTest(true, changes, expectedData);
		});

		test(`Should serialise date values into timestamps and create a ${chatEvents.CONTAINER_UPDATE_TICKET} if there
				is a ${events.UPDATE_TICKET} and a module default date prop has been updated (Container)`, async () => {
			TicketTemplates.getTemplateById.mockResolvedValueOnce({ ...generateTemplate(), modules: [{ type: 'sequencing', properties: [] }] });
			const changes = {
				modules: {
					sequencing: {
						'Start Time': { from: generateRandomDate(), to: generateRandomDate() },
					},
				},
			};
			const expectedData = { modules: { sequencing: { 'Start Time': changes.modules.sequencing['Start Time'].to.getTime() } } };
			await updateTicketTest(false, changes, expectedData);
		});
	});
};

const testNewTicket = () => {
	const addTicketTest = async (isFederation) => {
		const waitOnEvent = eventTriggeredPromise(events.NEW_TICKET);
		const template = generateTemplate();
		const data = {
			teamspace: generateRandomString(),
			project: generateRandomString(),
			model: generateRandomString(),
			ticket: {
				type: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
			},
		};

		TicketTemplates.getTemplateById.mockResolvedValueOnce(template);
		ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
		const event = isFederation ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
		EventsManager.publish(events.NEW_TICKET, data);
		expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
		expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);

		await waitOnEvent;

		expect(TicketTemplates.getTemplateById).toHaveBeenCalledTimes(1);
		expect(TicketTemplates.getTemplateById).toHaveBeenCalledWith(data.teamspace, data.ticket.type);
		expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
		expect(ChatService.createModelMessage).toHaveBeenCalledWith(
			event,
			data.ticket,
			data.teamspace,
			data.project,
			data.model,
		);
	};

	const importTicketsTest = async (isFederation) => {
		const waitOnEvent = eventTriggeredPromise(events.TICKETS_IMPORTED);
		const template = generateTemplate();
		const type = generateRandomString();
		const data = {
			teamspace: generateRandomString(),
			project: generateRandomString(),
			model: generateRandomString(),
			tickets: times(10, () => ({
				type,
				...generateRandomObject(),
			})),
		};

		TicketTemplates.getTemplateById.mockResolvedValueOnce(template);
		ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
		const event = isFederation ? chatEvents.FEDERATION_NEW_TICKET : chatEvents.CONTAINER_NEW_TICKET;
		EventsManager.publish(events.TICKETS_IMPORTED, data);
		expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
		expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);

		expect(TicketLogs.addImportedLogs).toHaveBeenCalledTimes(1);
		expect(TicketLogs.addImportedLogs).toHaveBeenCalledWith(
			data.teamspace,
			data.project,
			data.model,
			data.tickets,
		);

		await waitOnEvent;

		expect(TicketTemplates.getTemplateById).toHaveBeenCalledTimes(1);
		expect(TicketTemplates.getTemplateById).toHaveBeenCalledWith(data.teamspace, type);
		expect(ChatService.createModelMessage).toHaveBeenCalledTimes(data.tickets.length);

		data.tickets.forEach((ticket) => {
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				event,
				ticket,
				data.teamspace,
				data.project,
				data.model,
			);
		});
	};

	describe(events.NEW_TICKET, () => {
		test(`Should create a ${chatEvents.CONTAINER_NEW_TICKET} if there
					is a ${events.NEW_TICKET} (Container)`, async () => {
			await addTicketTest(false);
		});

		test(`Should create a ${chatEvents.FEDERATION_NEW_TICKET} if there
					is a ${events.NEW_TICKET} (Federation)`, async () => {
			await addTicketTest(true);
		});

		test(`Should create ${chatEvents.CONTAINER_NEW_TICKET} events if there
					is a ${events.TICKETS_IMPORTED} (Container)`, async () => {
			await importTicketsTest(false);
		});

		test(`Should create ${chatEvents.FEDERATION_NEW_TICKET} events if there
					is a ${events.TICKETS_IMPORTED} (Federation)`, async () => {
			await importTicketsTest(true);
		});
	});
};

const testNewComment = () => {
	const addCommentTest = async (isFederation) => {
		const waitOnEvent = eventTriggeredPromise(events.NEW_COMMENT);
		const data = {
			teamspace: generateRandomString(),
			project: generateRandomString(),
			model: generateRandomString(),
			data: {
				[generateRandomString()]: generateRandomString(),
				[generateRandomString()]: generateRandomString(),
			},
		};

		CommentSchemas.serialiseComment.mockImplementationOnce(() => data.data);
		ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
		const event = isFederation
			? chatEvents.FEDERATION_NEW_TICKET_COMMENT
			: chatEvents.CONTAINER_NEW_TICKET_COMMENT;
		EventsManager.publish(events.NEW_COMMENT, data);
		expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
		expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);

		await waitOnEvent;

		expect(CommentSchemas.serialiseComment).toHaveBeenCalledTimes(1);
		expect(CommentSchemas.serialiseComment).toHaveBeenCalledWith(data.data);
		expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
		expect(ChatService.createModelMessage).toHaveBeenCalledWith(
			event,
			data.data,
			data.teamspace,
			data.project,
			data.model,
		);
	};

	describe(events.NEW_COMMENT, () => {
		test(`Should create a ${chatEvents.CONTAINER_NEW_TICKET_COMMENT} if there is a ${events.NEW_COMMENT} (Container)`, async () => {
			await addCommentTest(false);
		});

		test(`Should create a ${chatEvents.FEDERATION_NEW_TICKET_COMMENT} if there is a ${events.NEW_COMMENT} (Federation)`, async () => {
			await addCommentTest(true);
		});

		test(`Should fail gracefully on error if there is an ${events.NEW_COMMENT} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.NEW_COMMENT);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: {
					[generateRandomString()]: generateRandomString(),
					[generateRandomString()]: generateRandomString(),
				},
			};

			ModelSettings.isFederation.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.NEW_COMMENT, data);

			await waitOnEvent;
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
			expect(ChatService.createModelMessage).not.toHaveBeenCalled();
		});
	});
};

const testUpdateComment = () => {
	describe(events.UPDATE_COMMENT, () => {
		const updateCommentTest = async (isFederation) => {
			const waitOnEvent = eventTriggeredPromise(events.UPDATE_COMMENT);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: {
					[generateRandomString()]: generateRandomString(),
					[generateRandomString()]: generateRandomString(),
				},
			};

			CommentSchemas.serialiseComment.mockImplementationOnce(() => data.data);
			ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
			const event = isFederation
				? chatEvents.FEDERATION_UPDATE_TICKET_COMMENT
				: chatEvents.CONTAINER_UPDATE_TICKET_COMMENT;
			EventsManager.publish(events.UPDATE_COMMENT, data);
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);

			await waitOnEvent;

			expect(CommentSchemas.serialiseComment).toHaveBeenCalledTimes(1);
			expect(CommentSchemas.serialiseComment).toHaveBeenCalledWith(data.data);
			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				event,
				data.data,
				data.teamspace,
				data.project,
				data.model,
			);
		};

		test(`Should create a ${chatEvents.CONTAINER_UPDATE_TICKET_COMMENT} if there is a ${events.UPDATE_COMMENT} (Container)`, async () => {
			await updateCommentTest(false);
		});

		test(`Should create a ${chatEvents.FEDERATION_UPDATE_TICKET_COMMENT} if there is a ${events.UPDATE_COMMENT} (Federation)`, async () => {
			await updateCommentTest(true);
		});

		test(`Should fail gracefully on error if there is an ${events.UPDATE_COMMENT} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.UPDATE_COMMENT);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				data: {
					[generateRandomString()]: generateRandomString(),
					[generateRandomString()]: generateRandomString(),
				},
			};

			ModelSettings.isFederation.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.UPDATE_COMMENT, data);

			await waitOnEvent;
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
			expect(ChatService.createModelMessage).not.toHaveBeenCalled();
		});
	});
};

const testUpdateTicketGroup = () => {
	describe(events.UPDATE_TICKET_GROUP, () => {
		const updateTicketGroupTest = async (isFederation) => {
			const waitOnEvent = eventTriggeredPromise(events.UPDATE_TICKET_GROUP);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: { _id: generateRandomString(), title: generateRandomString() },
				author: generateRandomString(),
				timestamp: generateRandomDate(),
				changes: generateRandomString(),
				_id: generateRandomString(),
			};

			ModelSettings.isFederation.mockResolvedValueOnce(isFederation);
			const expectedData = generateRandomObject();
			TicketGroupSchemas.serialiseGroup.mockReturnValueOnce(expectedData);

			const event = isFederation ? chatEvents.FEDERATION_UPDATE_TICKET_GROUP
				: chatEvents.CONTAINER_UPDATE_TICKET_GROUP;

			EventsManager.publish(events.UPDATE_TICKET_GROUP, data);

			await waitOnEvent;
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
			expect(TicketLogs.addGroupUpdateLog).toHaveBeenCalledTimes(1);
			expect(TicketLogs.addGroupUpdateLog).toHaveBeenCalledWith(data.teamspace, data.project, data.model,
				data.ticket._id, data._id, { author: data.author, changes: data.changes, timestamp: data.timestamp });

			expect(ChatService.createModelMessage).toHaveBeenCalledTimes(1);
			expect(ChatService.createModelMessage).toHaveBeenCalledWith(
				event,
				expectedData,
				data.teamspace,
				data.project,
				data.model,
			);
		};

		test(`Should create a ${chatEvents.CONTAINER_UPDATE_TICKET_GROUP} if there is a ${events.UPDATE_TICKET_GROUP} (Container)`, async () => {
			await updateTicketGroupTest(false);
		});

		test(`Should create a ${chatEvents.FEDERATION_UPDATE_TICKET_GROUP} if there is a ${events.UPDATE_TICKET_GROUP} (Federation)`, async () => {
			await updateTicketGroupTest(true);
		});

		test(`Should fail gracefully on error if there is an ${events.UPDATE_TICKET_GROUP} event`, async () => {
			const waitOnEvent = eventTriggeredPromise(events.UPDATE_TICKET_GROUP);
			const data = {
				teamspace: generateRandomString(),
				project: generateRandomString(),
				model: generateRandomString(),
				ticket: { _id: generateRandomString(), title: generateRandomString() },
				author: generateRandomString(),
				timestamp: generateRandomDate(),
				changes: generateRandomString(),
				_id: generateRandomString(),
			};

			ModelSettings.isFederation.mockRejectedValueOnce(generateRandomString());
			EventsManager.publish(events.UPDATE_TICKET_GROUP, data);

			await waitOnEvent;
			expect(ModelSettings.isFederation).toHaveBeenCalledTimes(1);
			expect(ModelSettings.isFederation).toHaveBeenCalledWith(data.teamspace, data.model);
			expect(TicketLogs.addGroupUpdateLog).toHaveBeenCalledTimes(1);
			expect(TicketLogs.addGroupUpdateLog).toHaveBeenCalledWith(data.teamspace, data.project, data.model,
				data.ticket._id, data._id, { author: data.author, changes: data.changes, timestamp: data.timestamp });
			expect(ChatService.createModelMessage).not.toHaveBeenCalled();
		});
	});
};

describe('services/eventsListener/eventsListener', () => {
	EventsListener.init();
	testQueueTaskUpdate();
	testQueueTaskCompleted();
	testModelSettingsUpdate();
	testModelProcessingCompleted();
	testRevisionUpdated();
	testNewModel();
	testDeleteModel();
	testNewRevision();
	testUpdateTicket();
	testNewTicket();
	testNewComment();
	testUpdateComment();
	testUpdateTicketGroup();
});
