/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { v4Path } = require('../../interop');
// eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require, require-sort/require-sort
const { systemLogger } = require(`${v4Path}/logger`);

const Logger = {};

Logger.logWithLabel = (label) => ({
	...systemLogger,
	logInfo: (msg, meta) => systemLogger.logInfo(msg, meta, label),
	logError: (msg, meta) => systemLogger.logError(msg, meta, label),
	logDebug: (msg, meta) => systemLogger.logDebug(msg, meta, label),
	logTrace: (msg, meta) => systemLogger.logTrace(msg, meta, label),
	logWarning: (msg, meta) => systemLogger.logWarning(msg, meta, label),
	logFatal: (msg, meta) => systemLogger.logFatal(msg, meta, label),
});

Logger.logger = systemLogger;

Logger.labels = {
	network: 'NET',
	event: 'EVENT',
	queue: 'AMQP',
	chat: 'CHAT',
	modelProcessing: 'MODPRO',
	aad: 'AAD',
	journaling: 'JRN',
	notifications: 'NOTIF',
};

module.exports = Logger;
