/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const { codeExists, templates } = require('../utils/responseCodes');
const { copyFile, mkdir, rm, stat, writeFile } = require('fs/promises');
const { listenToQueue, queueMessage } = require('../handler/queue');
const { events } = require('./eventsManager/eventsManager.constants');
const { generateUUIDString } = require('../utils/helper/uuids');
const { publish } = require('./eventsManager/eventsManager');
const { cn_queue: queueConfig } = require('../utils/config');
const processingLabel = require('../utils/logger').labels.modelProcessing;
const logger = require('../utils/logger').logWithLabel(processingLabel);

const ModelProcessing = {};

const SHARED_SPACE_TAG = '$SHARED_SPACE';
const {
	callback_queue: callbackq,
	worker_queue: jobq,
	model_queue: modelq,
	shared_storage: sharedDir,
} = queueConfig;

const onCallbackQMsg = async ({ content, properties }) => {
	logger.logInfo(`[Received][${properties.correlationId}] ${content}`);
	try {
		const { status, database: teamspace, project: model, user, value, message } = JSON.parse(content);
		if (status) {
			publish(events.QUEUED_TASK_UPDATE,
				{ teamspace, model, corId: properties.correlationId, status, user });
		} else {
			const fedDataPath = `${sharedDir}/${properties.correlationId}/obj.json`;

			const isFed = !!await stat(fedDataPath).catch(() => false);
			const fedData = { };
			if (isFed) {
				// eslint-disable-next-line
				const { subProjects } = require(fedDataPath);
				fedData.containers = subProjects;
			}

			publish(events.QUEUED_TASK_COMPLETED,
				{ teamspace, model, corId: properties.correlationId, user, value, message, ...fedData });
		}
	} catch (err) {
		logger.logError(`[${properties.correlationId}] Failed to process message: ${err?.message}`);
	}
};

ModelProcessing.queueModelUpload = async (teamspace, model, data, { originalname, path }) => {
	const revId = generateUUIDString();
	const fileNameSanitised = originalname.replace(/[ *"/\\[\]:;|=,<>$]/g, '_');
	const fileLoc = `${revId}/${fileNameSanitised}`;

	try {
		const json = {
			...data,
			file: `${SHARED_SPACE_TAG}/${fileLoc}`,
			database: teamspace,
			project: model,
			revId,
		};

		await mkdir(`${sharedDir}/${revId}`);

		await Promise.all(
			[
				copyFile(path, `${sharedDir}/${fileLoc}`),
				writeFile(`${sharedDir}/${revId}.json`, JSON.stringify(json)),

			],
		);

		const msg = `import -f ${SHARED_SPACE_TAG}/${revId}.json`;

		await queueMessage(modelq, revId, msg);

		publish(events.QUEUED_TASK_UPDATE, { teamspace, model, corId: revId, status: 'queued' });
	} catch (err) {
		// Clean up files we created
		Promise.all([
			rm(`${sharedDir}/${fileLoc}`),
			rm(`${sharedDir}/${revId}.json`),
		]).catch((cleanUpErr) => {
			logger.logError(`Failed to remove files (clean up on failure : ${cleanUpErr}`);
		});

		if (err?.code && codeExists(err.code)) {
			throw err;
		}

		logger.logError('Failed to queue model job', err?.message);
		throw templates.queueInsertionFailed;
	}
};

ModelProcessing.queueFederationUpdate = async (teamspace, federation, info) => {
	const corId = generateUUIDString();
	try {
		const data = {
			...info,
			database: teamspace,
			project: federation,
			subProjects: info.containers.map((container) => ({ database: teamspace, project: container })),
		};
		delete data.containers;

		const filePath = `${SHARED_SPACE_TAG}/${corId}/obj.json`;

		await mkdir(`${sharedDir}/${corId}`);
		await writeFile(`${sharedDir}/${corId}/obj.json`, JSON.stringify(data));

		await queueMessage(jobq, corId, `genFed ${filePath} ${teamspace}`);
		publish(events.QUEUED_TASK_UPDATE, { teamspace, model: federation, corId, status: 'queued' });
	} catch (err) {
		// Clean up files we created
		rm(`${sharedDir}/${corId}/obj.json`).catch((cleanUpErr) => {
			logger.logError(`Failed to remove files (clean up on failure : ${cleanUpErr}`);
		});

		if (err?.code && codeExists(err.code)) {
			throw err;
		}

		logger.logError('Failed to queue federate job', err?.message);
		throw templates.queueInsertionFailed;
	}
};

ModelProcessing.init = () => listenToQueue(callbackq, onCallbackQMsg);

module.exports = ModelProcessing;
