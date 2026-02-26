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

const { UUIDToString, generateUUID, generateUUIDString } = require('../utils/helper/uuids');
const { codeExists, templates } = require('../utils/responseCodes');
const { copyFile, mkdir, rm, writeFile } = require('fs/promises');
const { createWriteStream, readdirSync } = require('fs');
const { listenToQueue, queueMessage } = require('../handler/queue');
const { modelTypes, processStatuses } = require('../models/modelSettings.constants');
const { DRAWINGS_HISTORY_COL } = require('../models/revisions.constants');
const Path = require('path');
const { addRevision } = require('../models/revisions');
const archiver = require('archiver');
const { events } = require('./eventsManager/eventsManager.constants');
const { execFile } = require('child_process');
const { publish } = require('./eventsManager/eventsManager');
const { cn_queue: queueConfig } = require('../utils/config');
const processingLabel = require('../utils/logger').labels.modelProcessing;
const logger = require('../utils/logger').logWithLabel(processingLabel);
const { storeFile } = require('./filesManager');

const ClashProcessing = {};

const SHARED_SPACE_TAG = '$SHARED_SPACE';
const {
	callback_queue: callbackq,
	model_queue: modelq,
	shared_storage: sharedDir,
} = queueConfig;

ClashProcessing.queueClashRun = async (teamspace, project, corId, userId, config) => {
	try {
		await mkdir(`${sharedDir}/${corId}`);
		await writeFile(`${sharedDir}/${corId}/clashConfig.json`, JSON.stringify(config));
		const msg = ` processClash ${project} ${teamspace} ${SHARED_SPACE_TAG}/${corId}/clashConfig.json`;
		await queueMessage(modelq, corId, msg);

		publish(events.CLASH_QUEUED_TASK_CREATED, { teamspace, corId, userId });
	} catch (err) {
		// Clean up the file we created
		await rm(`${sharedDir}/${corId}/clashConfig.json`)
			.catch((cleanUpErr) => {
				logger.logError(`Failed to remove files (clean up on failure : ${cleanUpErr}`);
			});

		if (err?.code && codeExists(err.code)) {
			throw err;
		}

		logger.logError('Failed to queue clash test run', err?.message);
		throw templates.queueInsertionFailed;
	}
};

ClashProcessing.init = () => listenToQueue(callbackq, () => {});

module.exports = ClashProcessing;
