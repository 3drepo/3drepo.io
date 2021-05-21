/**
 *	Copyright (C) 2015 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/** *************************************************************************
 *  @file Contains functionality to dispatch work to the
 *       queue via amqp protocol. A compute node with a worker must be running
 *       to fulfil the tasks in order for the work to be done.
 ****************************************************************************/
"use strict";

const amqp = require("amqplib");
const fs = require("fs.extra");
const shortid = require("shortid");
const systemLogger = require("../logger").systemLogger;
const Mailer = require("../mailer/mailer");
const config = require("../config");
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

	writeFile(fileName, content) {
		// FIXME: v10 has native support of promise for fs. can remove when we upgrade.
		return new Promise((resolve, reject) => {
			fs.writeFile(fileName, content, { flag: "a+" }, err => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	mkdir(newDir) {
		return new Promise((resolve, reject) => {
			fs.mkdir(newDir, (err) => {
				if (!err || err && err.code === "EEXIST") {
					resolve();
				} else {
					reject(err);
				}
			});
		});
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
			this.consumeCallbackQueue(),
			this.consumeEventQueue()
		]);
	}

	// This should only be called by connect(). Do not ever use else where!
	consumeCallbackQueue() {
		return this.channel.assertQueue(this.callbackQName).then((queue) => {
			return this.channel.consume(queue.queue, this.processCallbackMsg.bind(this), { noAck: true });
		}).catch((err) => {
			systemLogger.logError("Failed to consume callback queue: " + err.message);
		});
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

	getSharedSpacePath() {
		return this.sharedSpacePath;
	}

	getSharedSpacePH() {
		return sharedSpacePH;
	}

	/** *****************************************************************************
	 * Dispatch work to queue to import a model via a file uploaded by User
	 * @param {string} corID - correlation ID for this request
	 *******************************************************************************/
	async importFile(corID, filePath, orgFileName, copy) {
		await this._moveFileToSharedSpace(corID, filePath, orgFileName, copy);

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

		return this.mkdir(this.sharedSpacePath).then(() => {
			return this.mkdir(newFileDir).then(() => {
				return this.writeFile(filename, JSON.stringify(defObj)).then(() => {
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
	_moveFileToSharedSpace(corID, orgFilePath, newFileName, copy) {
		const ModelHelper = require("../models/helper/model");
		newFileName = newFileName.replace(ModelHelper.fileNameRegExp, "_");

		const newFileDir = this.sharedSpacePath + "/" + corID + "/";
		const filePath = newFileDir + newFileName;

		return this.mkdir(newFileDir).then(() => {
			const move = copy ? fs.copy : fs.move;
			return new Promise((resolve, reject) => {
				move(orgFilePath, filePath, (moveErr) => {
					if (moveErr) {
						reject(moveErr);
					} else {
						resolve(`${corID}/${newFileName}`);
					}
				});
			});
		});
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
