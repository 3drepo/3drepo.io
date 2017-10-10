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

function createLogger() {

	const config = require("./config.js");
	const winston = require("winston");
	require("winston-daily-rotate-file");
	
	// Custom logging levels for logger
	const customLevels = {
		levels: {
			nothing: -1,
			fatal: 0,
			error: 1,
			warn: 2,
			info: 3,
			debug: 4,
			trace: 5
		},
		colors: {
			trace: "magenta",
			debug: "white",
			info: "green",
			warn: "orange",
			error: "red",
			fatal: "grey"
		}
	};
	
	let fileOutTransport;
	
	if (config.logfile.logDirectory) {
		fileOutTransport = new winston.transports.DailyRotateFile({
			filename: config.logfile.logDirectory + "/3drepo",
			datePattern: "-yyyy-MM-dd.log",
			level: config.logfile.file_level
		});
	} else {
		fileOutTransport = new winston.transports.File({
			level: config.logfile.file_level,
			filename: config.logfile.filename
		});
	}
	
	const transports = [
		fileOutTransport
	];
	
	if (config.logfile.silent === undefined || config.logfile.silent === false) {
		transports.push(new winston.transports.Console({
			colorize: true,
			level: config.logfile.console_level,
		}));
	}
	
	// Creates logger which outputs to both the console
	// and a log file simultaneously
	// Levels are set separately in the config.
	return new(winston.Logger)({
		levels: customLevels.levels,
		colors: customLevels.colors,
		transports: transports
	});
}

/**
 * The repoLogger init and factory
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} id - Unique logger ID
 * @returns
 */
const repoLogger = function (req, res, id) {
	let self = this instanceof repoLogger ? this : Object.create(repoLogger.prototype);

	self.uid = id;

	if (req) {
		self.session = req.session;
		self.req = req;
	}

	self.res = res;

	self.logger = createLogger();
	self.startTime = (new Date())
		.getTime();

	return self;
};

/**
 * Function to log a message
 *
 * @private
 * @param {string} type - Log level
 * @param {string} msg - Message to log 
 * @param {Object} meta - Extra data to put into the log file
 */
repoLogger.prototype.logMessage = function (type, msg, meta) {
	let currentTime = (new Date())
		.getTime();
	let timeDiff = currentTime - this.startTime;

	let metadata = Object.assign({}, meta, {
		uid: this.uid,
	});

	this.session && this.session.user && (metadata.username = this.session.user.username);
	this.req && this.req.method && (metadata.method = this.req.method);
	this.req && this.req.originalUrl && (metadata.url = this.req.originalUrl);

	this.logger.log(type, (new Date())
		.toString() + "\t" + this.uid + "\t" + msg + " [" + timeDiff + " ms]", metadata);
};

/**
 * Function to log an info message
 * 
 * @param {string} msg - Information message
 * @param {Object} meta - Extra informative metadata
 */
repoLogger.prototype.logInfo = function (msg, meta) {
	this.logMessage("info", msg, meta);
};

/**
 * Function to log an error message
 * 
 * @param {string} msg - Error message
 * @param {Object} meta - Extra informative metadata
 */
repoLogger.prototype.logError = function (msg, meta) {
	this.logMessage("error", msg, meta);
};

/**
 * Function to log a debug message
 * 
 * @param {string} msg - Debug message
 * @param {Object} meta - Extra informative metadata
 */
repoLogger.prototype.logDebug = function (msg, meta) {
	this.logMessage("debug", msg, meta);
};

/**
 * Function to log a warning message
 * 
 * @param {string} msg - Warning message
 * @param {Object} meta - Extra informative metadata
 */
repoLogger.prototype.logWarning = function (msg, meta) {
	this.logMessage("warn", msg, meta);
};

/**
 * Function to log a warning message
 * 
 * @param {string} msg - Warning message
 * @param {Object} meta - Extra informative metadata
 */
repoLogger.prototype.logTrace = function (msg, meta) {
	this.logMessage("trace", msg, meta);
};

/**
 * Function to log a fatal message
 * 
 * @param {string} msg - Fatal message
 * @param {Object} meta - Extra informative metadata
 */
repoLogger.prototype.logFatal = function (msg, meta) {
	this.logMessage("fatal", msg, meta);
};

/**
 * Middleware to call at the start of every request to
 * initialize logger
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {function} next - Next middleware
 * @returns
 */
module.exports.startRequest = function (req, res, next) {

	const shortid = require("shortid");
	const C = require("./constants");

	req[C.REQ_REPO] = {};
	req[C.REQ_REPO].logger = new repoLogger(req, res, shortid.generate()); // Create logger for this request

	next();
};
	
module.exports.systemLogger = new repoLogger(null, null, "system");
