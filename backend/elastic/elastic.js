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

const { Client } = require('@elastic/elasticsearch');
const logger = require('../logger');
const systemLogger = logger.systemLogger;
const Utils = require('./utils');
const { cloudId, cloudAuth } = require('../config').elastic;
const Elastic = {};

Elastic.teamspaceIndexPrefix = "io-teamspace";

const loginRecordMapping = {
	"username" : { "type": "text" },
	"loginTime" : { "type": "date" },
	"ipAddr" : { "type": "ip" },
	"location.country" : { "type": "text" },
	"location.city" : { "type": "text" },
	"referrer" : { "type": "text" },
	"application.name": { "type": "text" },
	"application.version": { "type": "text" },
	"application.type": { "type": "text" },
	"engine.name": { "type": "text" },
	"engine.version": { "type": "text" },
	"os.name": { "type": "text" },
	"os.version": { "type": "text" },
	"device": { "type": "text" }
};

const createElasticClient = async () => {
	const elasticCredentials = cloudAuth.split(":");
	const config = {
		cloud: {
			id: cloudId,
		},
		auth: {
			username: elasticCredentials[0],
			password: elasticCredentials[1]
		},
		reload_connections: true,
		maxRetries: 5,
		request_timeout: 60,
	};
	const internalElastic = new Client(config);
	try {
		await internalElastic.cluster.health();
		systemLogger.logInfo(`Succesfully connected to ${cloudId.trim()}`);
	} catch (err) {
		systemLogger.logError('Health check failed on elastic connection, please check settings.');
		Utils.exitApplication();
	}
	return internalElastic;
};

const elasticClientPromise = createElasticClient();

const createElasticRecord = async (elasticIndex, elasticBody, id, mapping) => {
	try {
		const elasticClient = await elasticClientPromise;
		let internalID = id;
		if (internalID === undefined) {
			internalID = Utils.hashCode(Object.values(elasticBody || {}).toString());
		}

		const indexName = elasticIndex.toLowerCase(); // requirement of elastic that indexs be lowercase
		const { body } = await elasticClient.indices.exists({ index: indexName });
		if (!body) {
			await elasticClient.indices.create({
				index: indexName,
			});
			systemLogger.logInfo(`Created index ${indexName}`);
			if (mapping) {
				await elasticClient.indices.putMapping({
					index: indexName,
					body: { properties: mapping },
				});
			}
			systemLogger.logInfo(`Created mapping ${indexName}`);
		}

		if (elasticBody) {
			await elasticClient.index({
				index: indexName,
				id: internalID,
				refresh: true,
				body: elasticBody,
			});
			systemLogger.logInfo(`created doc ${indexName} ${Object.values(elasticBody).toString()}`);
		}
	} catch (error) {
		systemLogger.logError(`createElasticRecord ${error} ${elasticIndex}`);
	}
};

Elastic.createRecord = async (index, elasticBody) => {
	if (elasticBody) {
		await createElasticRecord(index, elasticBody, undefined, loginRecordMapping);
	}
};

module.exports = Elastic;
