/**
 *  Copyright (C) 2014 3D Repo Ltd
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
"use strict";

const config = require("./config.js");
const winston = require("winston");
require("winston-daily-rotate-file");

const { Client } = require("@elastic/elasticsearch");

const SystemLogger = {};

const logLabels = {
	network: "NET"
};

const outTag = '[OUT] ';
const activityRecordIndex = "io-activity";

const stringFormat = ({ level, message, label, timestamp, stack }) => `${timestamp} [${level}] [${label || "APP"}] ${message}${stack ? ` - ${stack}` : ""}`;

const logger = createLogger();

SystemLogger.formatResponseMsg = (
	resData
) => {
	if (config.logfile.jsonOutput) {
		return JSON.stringify(resData);
	} else {
		const {
			status,
			code,
			latency,
			contentLength,
			user,
			method,
			originalUrl
		} = resData;
		return `${outTag}${status}\t${code}\t${latency}\t${contentLength}\t${user}\t${method}\t${originalUrl}`;
	}
};

function createLogger() {
	const transporters = [];

	if (config.logfile.logDirectory) {
		transporters.push(
			new winston.transports.DailyRotateFile({
				filename: config.logfile.logDirectory + "/io-%DATE%.log",
				datePattern: "YYYY-MM-DD",
				timestamp: true,
				level: config.logfile.file_level
			})
		);
	}

	if (config.logfile.silent === undefined || config.logfile.silent === false) {
		transporters.push(new winston.transports.Console({
			timestamp: true,
			colorize: true,
			level: config.logfile.console_level
		}));
	}

	let format;
	if (!config.logfile.jsonOutput) {
		format = winston.format.combine(
			winston.format.errors({stack: true}),
			winston.format.timestamp(),
			winston.format.align(),
			winston.format.printf(stringFormat)
		);
		if (!config.logfile.noColors) {
			format = winston.format.combine(
				winston.format.colorize(),
				format
			);
		}
	} else {
		format = winston.format.combine(
			winston.format.errors({stack: true}),
			winston.format.timestamp(),
			winston.format.json()
		);
	}

	// Creates logger which outputs to both the console
	// and a log file simultaneously
	// Levels are set separately in the config.
	if (transporters.length > 0) {
		return winston.createLogger({
			transports: transporters,
			format
		});
	}
}

/**
 * Function to log a message
 *
 * @private
 * @param {string} type - Log level
 * @param {string} msg - Message to log
 * @param {Object} meta - Extra data to put into the log file
 */
const logMessage = (msg, meta, label) => {
	if (config.elastic && label === logLabels.network) {
		const [msgType, code, latency, contentLength, user, method, originalUrl] = msg.split('\t');
		if (msgType.indexOf(outTag) === 0) {
			const status = msgType.substring(outTag.length);
			createActivityRecord(status, code, latency, contentLength, user, method, originalUrl);
		}
	}

	return `${msg} ${meta ? JSON.stringify(meta, label) : ""}`;
};

/**
 * Function to log an info message
 *
 * @param {string} msg - Information message
 * @param {Object} meta - Extra informative metadata
 */
SystemLogger.logInfo = (msg, meta, label) => {
	logger && logger.info(logMessage(msg, meta, label), {label});
};

/**
 * Function to log an error message
 *
 * @param {string} msg - Error message
 * @param {Object} meta - Extra informative metadata
 */
SystemLogger.logError = (msg, meta, label) => {
	logger && logger.error(logMessage(msg, meta, label), {label});
};

/**
 * Function to log a debug message
 *
 * @param {string} msg - Debug message
 * @param {Object} meta - Extra informative metadata
 */
SystemLogger.logDebug = (msg, meta, label) => {
	logger && logger.debug(logMessage(msg, meta, label), {label});
};

/**
 * Function to log a warning message
 *
 * @param {string} msg - Warning message
 * @param {Object} meta - Extra informative metadata
 */
SystemLogger.logWarning = (msg, meta, label) => {
	logger && logger.warn(logMessage(msg, meta, label), {label});
};

/**
 * Function to log a warning message
 *
 * @param {string} msg - Warning message
 * @param {Object} meta - Extra informative metadata
 */
SystemLogger.logTrace = (msg, meta, label) => {
	logger && logger.trace(logMessage(msg, meta, label), {label});
};

/**
 * Function to log a fatal message
 *
 * @param {string} msg - Fatal message
 * @param {Object} meta - Extra informative metadata
 */
SystemLogger.logFatal = (msg, meta, label) => {
	logger && logger.fatal(logMessage(msg, meta, label), {label});
};

const createElasticRecord = (index, body, id) => {
	const elasticClient = new Client(config.elastic);
	if (elasticClient && body) {
		return elasticClient.create({
			index,
			id,
			refresh: true,
			body
		});
	}
};

const createActivityRecord = (status, code, latency, contentLength, user, method, originalUrl) => {
	const timestamp = new Date();
	const id = `${user}-${timestamp.valueOf()}`;
	const elasticBody = {
		status: parseInt(status),
		code,
		latency: parseInt(latency),
		contentLength: parseInt(contentLength),
		user,
		method,
		originalUrl,
		timestamp
	};

	return createElasticRecord(activityRecordIndex, elasticBody, id).catch((err) => {
		SystemLogger.logError(`Create ${activityRecordIndex} record on Elastic failed`, err);
	});
};

module.exports.systemLogger = SystemLogger;
module.exports.logLabels = logLabels;
