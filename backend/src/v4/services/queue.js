/**
 *  Copyright (C) 2015 3D Repo Ltd
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

/** *************************************************************************
 *  @file Contains functionality to dispatch work to the
 *       queue via amqp protocol. A compute node with a worker must be running
 *       to fulfil the tasks in order for the work to be done.
 ****************************************************************************/
"use strict";

const amqp = require("amqplib");
const fs = require("fs").promises;
const shortid = require("shortid");
const systemLogger = require("../logger").systemLogger;
const Mailer = require("../mailer/mailer");
const config = require("../config");
const C = require("../constants");
const responseCodes = require("../response_codes");
const Utils = require("../utils");

const sharedSpacePH = "$SHARED_SPACE";

class ImportQueue {
	constructor() {
		if(!config.cn_queue ||
			!config.cn_queue.shared_storage ||
			!config.cn_queue.callback_queue ||
			!config.cn_queue.worker_queue ||
			!config.cn_queue.model_queue ||
			!config.cn_queue.event_exchange
		) {
			throw Error("Queue is not configured correctly.");
		}

		this.sharedSpacePath = config.cn_queue.shared_storage;
		this.callbackQName = config.cn_queue.callback_queue;
		this.workerQName = config.cn_queue.worker_queue;
		this.modelQName = config.cn_queue.model_queue;
		this.eventExchange = config.cn_queue.event_exchange;
		this.url = config.cn_queue.host;
		this.uid = shortid.generate();
		this.channel = null;
		this.initialised = this.connect();
	}

	connect() {
		if (this.channel) {
			return Promise.resolve(this.channel);
		}

		return amqp.connect(this.url).then(conn => {
			conn.on("close", () => {
				systemLogger.logError("[AMQP] connection closed");
				this.channel = null;
			});

			conn.on("error", (err)  => {
				const message = "[AMQP] connection error: " + err.message;
				systemLogger.logError(message);
				Mailer.sendQueueFailedEmail({message}).catch(() => {});
			});

			return conn.createChannel();
		}).then(channel => {
			this.channel = channel;
			return this.subscribeToQueues().then(() => channel);
		}).catch((err) => {
			const message = "Failed to connect to rabbitmq: " + err.message;
			systemLogger.logError(message);
			Mailer.sendQueueFailedEmail({message}).catch(() => {});
		});
	}

	subscribeToQueues() {
		return Promise.all([
			this.consumeEventQueue()
		]);
	}

	// This should only be called by connect(). Do not ever use else where!
	consumeEventQueue() {
		return this.channel.assertExchange(this.eventExchange, "fanout", {
			durable: true
		}).then(() => {
			return this.channel.assertQueue("", { exclusive: true });
		}).then(queue => {
			return this.channel.bindQueue(queue.queue, this.eventExchange, "").then(() => {
				return this.channel.consume(queue.queue, (rep) => {
					if (this.eventCallback) {
						this.eventCallback(JSON.parse(rep.content));
					}

				}, { noAck: true });
			});
		}).catch((err) => {
			systemLogger.logError("Failed to consume event queue: " + err.message);
		});
	}

	getChannel() {
		return this.initialised.then(() => {
			return this.channel ? Promise.resolve(this.channel) : this.connect();
		});
	}

	getTaskPath(corID) {
		return `${this.sharedSpacePath}/${corID}`;
	}

	/** *****************************************************************************
	 * Dispatch work to queue to import a model via a file uploaded by User
	 * @param {string} corID - correlation ID for this request
	 *******************************************************************************/
	async importFile(corID, filePath, orgFileName, copy) {
		if (orgFileName) {
			await this._moveFileToSharedSpace(corID, filePath, orgFileName, copy);
		}

		const msg = `import -f ${sharedSpacePH}/${corID}.json`;
		return this._dispatchWork(corID, msg, true);
	}

	/** *****************************************************************************
	 * Dispatch work to queue to create a federated model
	 * @param {string} corID - correlation ID for this request
	 * @param {account} account - username
	 * @param {defObj} defObj - object to describe the federated model like submodels and transformation
	 *******************************************************************************/
	createFederatedModel(corID, account, defObj) {
		const newFileDir = this.sharedSpacePath + "/" + corID;
		const filename = `${newFileDir}/obj.json`;

		return Utils.mkdir(this.sharedSpacePath).then(() => {
			return Utils.mkdir(newFileDir).then(() => {
				return Utils.writeFile(filename, JSON.stringify(defObj)).then(() => {
					const msg = `genFed ${sharedSpacePH}/${corID}/obj.json ${account}`;
					return this._dispatchWork(corID, msg);
				});
			});
		});
	}

	/** *****************************************************************************
	 * Dispatch work to import toy model
	 * @param {string} corID - correlation ID for this request
	 * @param {string} database - database name
	 * @param {string} model - model id
	 * @param {string} modeDirName - the dir name of the model database dump staying in
	 *******************************************************************************/
	importToyModel(corID, database, model, options) {
		const skip = options.skip && JSON.stringify(options.skip) || "";
		const msg = `importToy ${database} ${model} ${options.modelDirName} ${skip}`;

		return this._dispatchWork(corID, msg);
	}

	/** *****************************************************************************
	 * Move a specified file to shared storage (area shared by queue workers)
	 * move the file to shared storage space, put it in a corID/newFileName
	 * note: using move(in fs.extra) instead of rename(in fs) as rename doesn"t allow cross device
	 * @param {corID} corID - Correlation ID
	 * @param {orgFilePath} orgFilePath - Path to where the file is currently
	 * @param {newFileName} newFileName - New file name to rename to
	 * @param {copy} copy - use fs.copy instead of fs.move if set to true
	 *******************************************************************************/
	async _moveFileToSharedSpace(corID, orgFilePath, newFileName, copy) {
		newFileName = newFileName.replace(C.FILENAME_REGEXP, "_");

		const newFileDir = `${this.sharedSpacePath}/${corID}/`;
		const filePath = newFileDir + newFileName;

		await Utils.mkdir(newFileDir);
		await fs.copyFile(orgFilePath, filePath);
		if (!copy) {
			await fs.rm(orgFilePath);
		}
		return `${corID}/${newFileName}`;
	}

	/** *****************************************************************************
	 * @param {corID} corID - correlation ID of upload
	 * @param {databaseName} databaseName - name of database to commit to
	 * @param {modelName} modelName - name of model to commit to
	 * @param {userName} userName - name of user
	 * @param {tag} tag - revision tag
	 * @param {desc} desc - revison description
	 *******************************************************************************/
	async writeImportData(corID, databaseName, modelName, userName, newFileName, tag, desc, importAnimations = true) {
		const jsonFilename = `${this.getTaskPath(corID)}.json`;

		const json = {
			file: `${sharedSpacePH}/${corID}/${newFileName}`,
			filename: newFileName,
			database: databaseName,
			project: modelName,
			owner: userName,
			revId: corID
		};

		if (tag) {
			json.tag = tag;
		}

		if (desc) {
			json.desc = desc;
		}

		if (importAnimations) {
			json.importAnimations = importAnimations;
		}

		await Utils.writeFile(jsonFilename, JSON.stringify(json));
	}

	/** *****************************************************************************
	 * Insert a job item in worker queue
	 *
	 * @param {corID} corID - Correlation ID
	 * @param {msg} orgFilePath - Path to where the file is currently
	 * @param {isModelImport} whether this job is a model import
	 *******************************************************************************/
	_dispatchWork(corID, msg, isModelImport) {
		return this.getChannel().then((channel) => {
			const queueName = isModelImport ? this.modelQName : this.workerQName;
			return channel.assertQueue(queueName, { durable: true }).then(() => {
				return channel.sendToQueue(queueName,
					new Buffer.from(msg), {
						correlationId: corID,
						appId: this.uid,
						persistent: true

					}
				);
			}).then(() => {
				systemLogger.logInfo(
					"Sent work to queue[" + queueName + "]: " + msg.toString()
					+ " with corr id: " + corID.toString()
				);
			});
		}).catch((err) => {
			const message = "Failed to dispatch work: "  + err.message;
			systemLogger.logError(message);
			Mailer.sendQueueFailedEmail({message}).catch(() => {});
			return Promise.reject(responseCodes.QUEUE_CONN_ERR);
		});
	}

	insertEventMessage(msg) {
		return  this.getChannel().then((channel) => {
			return channel.assertExchange(this.eventExchange, "fanout", {
				durable: true
			}).then(() => {
				return channel.publish(
					this.eventExchange,
					"",
					new Buffer.from(JSON.stringify(msg)), {
						persistent: true
					}
				);
			});

		}).catch((err) => {
			systemLogger.logError("Failed to insert event: "  + err.message);
		});
	}

	processCallbackMsg(res) {
		systemLogger.logInfo("Job request id " + res.properties.correlationId
				+ " returned with: " + res.content);

		const {value, message, database, project, user = "unknown" , status} = JSON.parse(res.content);

		const ModelHelper = require("../models/helper/model");

		if (status && Utils.isString(status)) {
			ModelHelper.setStatus(database, project, status, user);
		} else {
			if (value === 0) {
				ModelHelper.importSuccess(database, project, this.sharedSpacePath, user);
			} else {
				ModelHelper.importFail(database, project, this.sharedSpacePath, user, value, message);
			}
		}
	}

	subscribeToEventMessages(callback) {
		this.eventCallback = callback;
	}
}

module.exports = new ImportQueue();
