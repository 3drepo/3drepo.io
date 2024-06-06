/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { Client } = require("@elastic/elasticsearch");

const config = require('../utils/config');
const { logger } = require('../utils/logger');

const Elastic = {};

const activityRecordIndex = "io-activity";

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

Elastic.createActivityRecord = (status, code, latency, contentLength, user, method, originalUrl) => {
	const host = config.host;
	const timestamp = new Date();
	const id = `${host}-${user}-${timestamp.valueOf()}`;
	const elasticBody = {
		status: parseInt(status),
		code,
		latency: parseInt(latency),
		contentLength: parseInt(contentLength),
		user,
		method,
		originalUrl,
		timestamp,
		host
	};

	return createElasticRecord(activityRecordIndex, elasticBody, id).catch((err) => {
		SystemLogger.logError(`Create ${activityRecordIndex} record on Elastic failed`, err);
	});
};

module.exports = Elastic;
