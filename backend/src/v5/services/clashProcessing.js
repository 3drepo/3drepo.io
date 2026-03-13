/**
 *  Copyright (C) 2026 3D Repo Ltd
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
const { mkdir, rm } = require('fs/promises');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const { cn_queue: queueConfig } = require('../utils/config');
const { queueMessage } = require('../handler/queue');
const modProLabel = require('../utils/logger').labels.modelProcessing;
const logger = require('../utils/logger').logWithLabel(modProLabel);

const ClashProcessing = {};

const SHARED_SPACE_TAG = '$SHARED_SPACE';
const {
	clash_queue: clashq,
	shared_storage: sharedDir,
} = queueConfig;

ClashProcessing.queueClashRun = async (teamspace, project, corId, stream) => {
	const configPath = `${sharedDir}/${corId}/clashConfig.json`;
	try {
		await mkdir(`${sharedDir}/${corId}`);

		const writableStream = fs.createWriteStream(configPath);
		await pipeline(stream, writableStream);
		const msg = `processClash ${teamspace} ${project} ${SHARED_SPACE_TAG}/${corId}/clashConfig.json`;
		await queueMessage(clashq, corId, msg);
	} catch (err) {
		await rm(configPath).catch((cleanUpErr) => {
			logger.logError(`Failed to remove files (clean up on failure : ${cleanUpErr}`);
		});

		if (err?.code && codeExists(err.code)) {
			throw err;
		}

		logger.logError('Failed to queue clash test run', err?.message);
		throw templates.queueInsertionFailed;
	}
};

module.exports = ClashProcessing;
