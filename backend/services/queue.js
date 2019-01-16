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
		this.connect();
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
				systemLogger.logError("[AMQP] connection closed ");
				this.channel = null;
			});

			conn.on("error", (err)  => {
				const message = "[AMQP] connection error " + err.message;
				systemLogger.logError(message);
				Mailer.sendQueueFailedEmail({message}).catch(() => {});
			});

			return conn.createChannel();
		}).then(channel => {
			this.channel = channel;
			this.subscribeToQueues();
			return channel;
		}).catch((err) => {
			const message = "Failed to connect to rabbitmq: " + err.message;
			systemLogger.logError(message);
			Mailer.sendQueueFailedEmail({message}).catch(() => {});
		});
	}

	subscribeToQueues() {
		this.consumeCallbackQueue();
		this.consumeEventQueue();
	}

	consumeCallbackQueue() {
		return this.getChannel().then((channel) => {
			return channel.assertQueue(this.callbackQName).then((queue) => {
				return channel.consume(queue.q, this.processCallbackMsg.bind(this), { noAck: true });
			});
		}).catch((err) => {
			systemLogger.logError("Failed to consume callback queue: " + err.message);
		});
	}

	consumeEventQueue() {
		this.getChannel().then((channel) => {
			return channel.assertExchange(this.eventExchange, "fanout", {
				durable: true
			}).then(() => {
				return channel.assertQueue("", { exclusive: true });
			}).then(queue => {
				return channel.bindQueue(queue.q, this.eventExchange, "").then(() => {
					return channel.consume(queue.q, (rep) => {
						/*eslint-disable */
						console.log("[ConsumeEventQueue]: New message found, queue: " , queue.q , rep.content.data);
						if (this.eventCallback) {
							this.eventCallback(JSON.parse(rep.content));
						}

					}, { noAck: true });
				});
			});
		}).catch((err) => {
			systemLogger.logError("Failed to consume event queue: " + err.message);
		});
	}

	getChannel() {
		return this.channel ? Promise.resolve(this.channel) : this.connect();
	}

	/** *****************************************************************************
	 * Dispatch work to queue to import a model via a file uploaded by User
	 * @param {string} corID - correlation ID for this request
	 * @param {filePath} filePath - Path to uploaded file
	 * @param {orgFileName} orgFileName - Original file name of the file
	 * @param {databaseName} databaseName - name of database to commit to
	 * @param {modelName} modelName - name of model to commit to
	 * @param {userName} userName - name of user
	 * @param {copy} copy - use fs.copy or fs.move, default fs.move
	 * @param {tag} tag - revision tag
	 * @param {desc} desc - revison description
	 *******************************************************************************/
	importFile(corID, filePath, orgFileName, databaseName, modelName, userName, copy, tag, desc) {
		const jsonFilename = `${this.sharedSpacePath}/${corID}.json`;

		return this._moveFileToSharedSpace(corID, filePath, orgFileName, copy).then(obj => {
			const json = {
				file: obj.filePath,
				database: databaseName,
				project: modelName,
				owner: userName
			};

			if (tag) {
				json.tag = tag;
			}

			if (desc) {
				json.desc = desc;
			}

			return this.writeFile(jsonFilename, JSON.stringify(json)).then(() => {
				const msg = `import -f ${jsonFilename}`;
				return this._dispatchWork(corID, msg, true);
			});

		});
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
					const msg = `genFed ${filename} ${account}`;
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
						resolve({ filePath, newFileDir });
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
			return channel.assertQueue(queueName, { durable: true }).then(info => {

				if (info.consumerCount <= 0) {
					systemLogger.logInfo("No consumer in queue. Sending email alert...");

					Mailer.sendNoConsumerAlert().then(() => {
						systemLogger.logInfo("Email sent.");
					}).catch((err) => {
						systemLogger.logError("Failed to send email: " + err.message);
					});
				}
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
			const message = "Failed to dispatch work:"  + err.message;
			systemLogger.logError(message);
			Mailer.sendQueueFailedEmail({message}).catch(() => {});
			return Promise.reject(responseCodes.QUEUE_CONN_ERR);
		});
	}

	insertEventMessage(msg) {
		this.getChannel().then((channel) => {
			return channel.assertExchange(this.eventExchange, "fanout", {
				durable: true
			}).then(() => {
				/*eslint-disable */
				console.log("!!! New event message", msg);
				return channel.publish(
					this.eventExchange,
					"",
					new Buffer.from(JSON.stringify(msg)), {
						persistent: true
					}
				);
			});

		}).catch((err) => {
			systemLogger.logError("Failed to insert event:"  + err.message);
		});
	}

	processCallbackMsg(res) {
		systemLogger.logInfo("Job request id " + res.properties.correlationId
				+ " returned with: " + res.content);
		const resData = JSON.parse(res.content);

		const resErrorCode = resData.value;
		const resErrorMessage = resData.message;
		const resDatabase = resData.database;
		const resProject = resData.project;
		const resUser = resData.user ? resData.user : "unknown";

		const ModelHelper = require("../models/helper/model");

		if ("processing" === resData.status) {
			ModelHelper.setStatus(resDatabase, resProject, "processing");
		} else {
			if (resErrorCode === 0) {
				ModelHelper.importSuccess(resDatabase, resProject, this.sharedSpacePath);
			} else {
				ModelHelper.importFail(resDatabase, resProject, resUser, resErrorCode, resErrorMessage, true);
			}
		}
	}

	subscribeToEventMessages(callback) {
		this.eventCallback = callback;
	}
}

module.exports = new ImportQueue();
