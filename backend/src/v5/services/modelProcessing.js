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

const ModelProcessing = {};

const SHARED_SPACE_TAG = '$SHARED_SPACE';
const {
	callback_queue: callbackq,
	model_queue: modelq,
	drawing_queue: drawingq,
	shared_storage: sharedDir,
} = queueConfig;

const onCallbackQMsg = ({ content, properties }) => {
	logger.logInfo(`[Received][${properties.correlationId}] ${content}`);
	try {
		const { status, database: teamspace, project: model, user, value, message } = JSON.parse(content);
		if (status) {
			publish(events.QUEUED_TASK_UPDATE,
				{ teamspace, model, corId: properties.correlationId, status });
		} else {
			publish(events.QUEUED_TASK_COMPLETED,
				{ teamspace, model, corId: properties.correlationId, user, value, message });
		}
	} catch (err) {
		logger.logError(`[${properties.correlationId}] Failed to process message: ${err?.message}`);
	}
};

const queueDrawingUpload = async (teamspace, project, model, revId, data, fileBuffer) => {
	try {
		const pathToRevFolder = Path.join(sharedDir, revId);
		const file = Path.join(pathToRevFolder, `${revId}${data.format}`);
		const json = {
			...data,
			database: teamspace,
			project: model,
			revId,
			file: `${SHARED_SPACE_TAG}/${revId}/${revId}${data.format}`,
		};

		await mkdir(pathToRevFolder);

		await Promise.all(
			[
				writeFile(file, fileBuffer),
				writeFile(Path.join(pathToRevFolder, 'importParams.json'), JSON.stringify(json)),

			],
		);

		const msg = `processDrawing ${SHARED_SPACE_TAG}/${revId}/importParams.json`;

		await queueMessage(drawingq, revId, msg);

		publish(events.QUEUED_TASK_UPDATE, { teamspace, model, corId: revId, status: processStatuses.QUEUED });
	} catch (err) {
		logger.logError('Failed to queue drawing task', err.message);
		publish(events.QUEUED_TASK_COMPLETED, { teamspace, model, corId: revId, value: 4 });
	}
};

ModelProcessing.processDrawingUpload = async (teamspace, project, model, revInfo, file) => {
	const format = Path.extname(file.originalname).toLowerCase();
	const fileId = generateUUID();
	const { owner, ...revData } = revInfo;

	const incomplete = format !== '.pdf';

	if (incomplete) {
		revData.incomplete = true;
	} else {
		revData.image = fileId;
	}

	const rev_id = await addRevision(teamspace, project, model, modelTypes.DRAWING,
		{ ...revData, author: owner, format, rFile: [fileId] });

	const fileMeta = { name: file.originalname, rev_id, project, model };
	await storeFile(teamspace, DRAWINGS_HISTORY_COL, fileId, file.buffer, fileMeta);

	if (incomplete) {
		const queueMeta = { format, size: file.buffer.length, owner };
		await queueDrawingUpload(teamspace, project, model, UUIDToString(rev_id), queueMeta, file.buffer);
	} else {
		publish(events.QUEUED_TASK_COMPLETED, { teamspace, model, corId: rev_id, value: 0, user: owner });
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

		publish(events.QUEUED_TASK_UPDATE, { teamspace, model, corId: revId, status: processStatuses.QUEUED });
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

ModelProcessing.getLogArchive = async (corId) => {
	const filename = 'logs.zip';

	try {
		const taskDir = Path.join(sharedDir, corId);
		const zipPath = Path.join(taskDir, filename);
		const files = readdirSync(taskDir);
		const archive = archiver('zip', { zlib: { level: 1 } });

		const archiveReady = new Promise((resolve, reject) => {
			const output = createWriteStream(zipPath);
			output.on('close', resolve);
			output.on('error', reject);
			archive.on('error', reject);
			archive.pipe(output);
		});

		let logPreviewProm;
		files.forEach((file) => {
			if (file.endsWith('.log')) {
				const logPath = Path.join(taskDir, file);
				archive.file(logPath, { name: file });
				if (!logPreviewProm) {
					// we're trying to get the last n lines of a file here
					// going native is the most efficient (and painless...)

					/* istanbul ignore next */
					logPreviewProm = new Promise((resolve) => {
						const isWin = process.platform === 'win32';
						if (isWin) {
							// eslint-disable-next-line security/detect-child-process
							execFile('Get-Content', [logPath, '-Tail', '20'],
								{ shell: 'powershell.exe' }, (error, stdout) => {
									resolve(error ? undefined : stdout);
								});
						} else {
							// eslint-disable-next-line security/detect-child-process
							execFile('tail', [logPath, '-n20'],
								(error, stdout) => {
									resolve(error ? undefined : stdout);
								});
						}
					});
				}
			}
		});

		archive.finalize();
		await archiveReady;

		return { zipPath, logPreview: await logPreviewProm };
	} catch (err) {
		logger.logError(`Error while compressing log files for import error email: ${err.message}`);
		return undefined;
	}
};

ModelProcessing.init = () => listenToQueue(callbackq, onCallbackQMsg);

module.exports = ModelProcessing;
