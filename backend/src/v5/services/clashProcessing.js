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
const { listenToQueue, queueMessage } = require('../handler/queue');
const { createWriteStream } = require('fs');
const { mkdir } = require('fs/promises');
const { pipeline } = require('stream/promises');

const { cn_queue: queueConfig } = require('../utils/config');
const clashesLabel = require('../utils/logger').labels.clashes;
const logger = require('../utils/logger').logWithLabel(clashesLabel);

const ClashProcessing = {};

const SHARED_SPACE_TAG = '$SHARED_SPACE';
const {
	callback_queue: callbackq,
	clash_queue: clashq,
	shared_storage: sharedDir,
} = queueConfig;

ClashProcessing.queueClashRun = async (teamspace, project, corId, stream) => {
	try {
		await mkdir(`${sharedDir}/${corId}`);

		const writableStream = createWriteStream(`${sharedDir}/${corId}/clashConfig.json`);
		await pipeline(stream, writableStream, { end: false });
		const msg = `processClash ${teamspace} ${project} ${SHARED_SPACE_TAG}/${corId}/clashConfig.json`;
		await queueMessage(clashq, corId, msg);
	} catch (err) {
		if (err?.code && codeExists(err.code)) {
			throw err;
		}

		logger.logError('Failed to queue clash test run', err?.message);
		throw templates.queueInsertionFailed;
	}
};

ClashProcessing.init = () => listenToQueue(callbackq, () => {});

module.exports = ClashProcessing;
