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

"use strict";
const { Client } = require("@elastic/elasticsearch");
const logger = require("../logger");
const systemLogger = logger.systemLogger;
const elasticConfig = require("../config").elastic;
const Elastic = {};

const loginRecordIndex = "io-teamspace-loginrecord";
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

const indicesMappings = [
	{
		index: loginRecordIndex,
		mapping: loginRecordMapping
	}
];

const createElasticClient = async () => {
	if(!elasticConfig){
		return;
	}

	const elasticCredentials = elasticConfig.cloudAuth.split(":");
	const config = {
		cloud: {
			id: elasticConfig.cloudId
		},
		auth: {
			username: elasticCredentials[0],
			password: elasticCredentials[1]
		},
		reload_connections: elasticConfig.reload_connections,
		maxRetries: elasticConfig.maxRetries,
		request_timeout: elasticConfig.request_timeout
	};

	const client = new Client(config);
	try {
		await client.cluster.health();
		systemLogger.logInfo(`Succesfully connected to ${elasticConfig.cloudId.trim()}`);
		await establishIndices(client);
	} catch (err) {
		systemLogger.logError("Health check failed on elastic connection, please check settings.");
		return;
	}

	return client;
};

const establishIndices = async (elasticClient)=>{
	indicesMappings.forEach(async (indexMapping) => {
		const { body } = await elasticClient.indices.exists({ index: indexMapping.index });
		if (!body) {
			await elasticClient.indices.create({index: indexMapping.index });
			systemLogger.logInfo(`Created index ${indexMapping.index}`);
			if (indexMapping.mapping) {
				await elasticClient.indices.putMapping({
					index: indexMapping.index,
					body: { properties: indexMapping.mapping }
				});
			}
			systemLogger.logInfo(`Created mapping ${indexMapping.index}`);
		}
	}); 
}

const elasticClientPromise = createElasticClient();

const createElasticRecord = async (elasticIndex, elasticBody, id) => {
	try {
		const elasticClient = await elasticClientPromise;	
		
		if (elasticBody) {
			await elasticClient.index({
				index: elasticIndex,
				id: id,
				refresh: true,
				body: elasticBody
			});
			systemLogger.logInfo(`created doc ${elasticIndex} ${Object.values(elasticBody).toString()}`);
		}
	} catch (error) {
		systemLogger.logError(`createElasticRecord ${error} ${elasticIndex}`);
	}
};

Elastic.createLoginRecord = async (username, loginRecord) => {
	const elasticBody = {
		"Id" : loginRecord._id,
		"Username" : username,
		"LoginTime" : Date(loginRecord.loginTime),
		"IpAddress" : loginRecord.ipAddr,
		"Location.Country" : loginRecord.location.country,
		"Location.City" : loginRecord.location.city,
		"Referrer" : loginRecord.referrer,
		"Application.Name" : loginRecord.application.name,
		"Application.Version" : loginRecord.application.version,
		"Application.Type" : loginRecord.application.type,
		"Engine.Name" : loginRecord.engine.name,
		"Engine.Version" : loginRecord.engine.version,
		"OS.Name" : loginRecord.os.name,
		"OS.Version" : loginRecord.os.version,
		"Device" : loginRecord.device
	};

	await createElasticRecord(loginRecordIndex, elasticBody, elasticBody.Id);
};

module.exports = Elastic;
