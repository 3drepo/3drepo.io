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
const { copyFile, mkdir, rm, stat, writeFile } = require('fs/promises');
const { createWriteStream, readdirSync } = require('fs');
const { listenToQueue, queueMessage } = require('../handler/queue');
const { modelTypes, processStatuses } = require('../models/modelSettings.constants');
const Path = require('path');
const { addRevision } = require('../models/revisions');
const archiver = require('archiver');
const { events } = require('./eventsManager/eventsManager.constants');
const { exec } = require('child_process');
const { publish } = require('./eventsManager/eventsManager');
const { cn_queue: queueConfig } = require('../utils/config');
const processingLabel = require('../utils/logger').labels.modelProcessing;
const logger = require('../utils/logger').logWithLabel(processingLabel);
const { storeFile } = require('./filesManager');

const ModelProcessing = {};

const SHARED_SPACE_TAG = '$SHARED_SPACE';
const {
	callback_queue: callbackq,
	worker_queue: jobq,
	model_queue: modelq,
	drawing_queue: drawingq,
	shared_storage: sharedDir,
} = queueConfig;

const onCallbackQMsg = async ({ content, properties }) => {
	logger.logInfo(`[Received][${properties.correlationId}] ${content}`);
	try {
		const { status, database: teamspace, project: model, user, value, message } = JSON.parse(content);
		if (status) {
			publish(events.QUEUED_TASK_UPDATE,
				{ teamspace, model, corId: properties.correlationId, status });
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

const queueDrawingUpload = async (teamspace, project, model, revId, data) => {
	try {
		const json = {
			...data,
			database: teamspace,
			project: model,
			revId,
		};

		const pathToRevFolder = Path.join(sharedDir, revId);
		await mkdir(pathToRevFolder);

		await writeFile(Path.join(pathToRevFolder, 'importParams.json'), JSON.stringify(json));

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

	const rev_id = await addRevision(teamspace, project, model, modelTypes.DRAWING,
		{ ...revInfo, format, rFile: [fileId], incomplete: true });

	const fileMeta = { name: file.originalname, rev_id, project, model };
	await storeFile(teamspace, `${modelTypes.DRAWING}s.history`, fileId, file.buffer, fileMeta);

	// TODO: for a different issue, but we don't want push through pdfs - should process it in .io
	const queueMeta = { format, size: file.buffer.length };
	await queueDrawingUpload(teamspace, project, model, UUIDToString(rev_id), queueMeta);
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
	const revId = generateUUIDString();
	try {
		const data = {
			...info,
			database: teamspace,
			project: federation,
			subProjects: info.containers.map(({ _id, group }) => ({ database: teamspace, project: _id, group })),
			revId,
		};
		delete data.containers;

		const filePath = `${SHARED_SPACE_TAG}/${revId}/obj.json`;

		await mkdir(`${sharedDir}/${revId}`);
		await writeFile(`${sharedDir}/${revId}/obj.json`, JSON.stringify(data));

		await queueMessage(jobq, revId, `genFed ${filePath} ${teamspace}`);
		publish(events.QUEUED_TASK_UPDATE, { teamspace, model: federation, corId: revId, status: 'queued' });
	} catch (err) {
		// Clean up files we created
		rm(`${sharedDir}/${revId}/obj.json`).catch((cleanUpErr) => {
			logger.logError(`Failed to remove files (clean up on failure : ${cleanUpErr}`);
		});

		if (err?.code && codeExists(err.code)) {
			throw err;
		}

		logger.logError('Failed to queue federate job', err?.message);
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
							exec(`Get-Content ${logPath} -Tail 20`,
								{ shell: 'powershell.exe' }, (error, stdout) => {
									resolve(error ? undefined : stdout);
								});
						} else {
							// eslint-disable-next-line security/detect-child-process
							exec(`tail -n20 ${logPath}`,
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
