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
const repoLicense = require("../config").repoLicense;
const { v5Path } = require("../../interop");
const EventsV5 = require(`${v5Path}/services/eventsManager/eventsManager.constants`).events;
const EventsManager = require(`${v5Path}/services/eventsManager/eventsManager`);

const Elastic = {};

const loginRecordIndex = "io-teamspace-loginrecord";
const loginRecordMapping = {
	"Username" : { "type": "text" },
	"LoginTime" : {
		"type": "date",
		"format": "ccc MMM dd uuuu HH:mm:ss zZ (zzzz)||yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
	},
	"IpAddress" : { "type": "ip" },
	"Location.Country" : { "type": "text" },
	"Location.City" : { "type": "text" },
	"Referrer" : { "type": "text" },
	"Application.Name": { "type": "text" },
	"Application.Version": { "type": "text" },
	"Application.Type": { "type": "text" },
	"Engine.Name": { "type": "text" },
	"Engine.Version": { "type": "text" },
	"OS.Name": { "type": "text" },
	"OS.Version": { "type": "text" },
	"Device": { "type": "text" },
	"licenseKey": { "type": "keyword" }
};

const indicesMappings = [
	{
		index: loginRecordIndex,
		mapping: loginRecordMapping
	}
];

const createElasticClient = async () => {
	if(!elasticConfig) {
		return;
	}

	try {
		const client = new Client(elasticConfig);
		await client.cluster.health();
		systemLogger.logInfo(`Succesfully connected to ${elasticConfig.cloud.id.trim()}`);
		await establishIndices(client);
		return client;
	} catch (err) {
		systemLogger.logError("Health check failed on elastic connection, please check settings.",err);
		// eslint-disable-next-line
		process.exit(1);
	}

};

const establishIndices = async (client)=>{
	return Promise.all(indicesMappings.map(async ({index, mapping}) => {
		const { body } = await client.indices.exists({ index: index });
		if (!body) {
			await client.indices.create({index: index });
			systemLogger.logInfo(`Created index ${index}`);
			if (mapping) {
				await client.indices.putMapping({
					index: index,
					body: { properties: mapping }
				});
			}
			systemLogger.logInfo(`Created mapping ${index}`);
		}
	}));
};

const elasticClientPromise = createElasticClient();

Elastic.createElasticRecord = async (index, body, id) => {
	try {
		const elasticClient = await elasticClientPromise;
		if (elasticClient && body) {
			await elasticClient.create({
				index,
				id,
				refresh: true,
				body
			});
			systemLogger.logDebug(`created doc ${index} ${JSON.stringify(body)}`);
		}
	} catch (error) {
		systemLogger.logError(`createElasticRecord ${error} ${index}`,error);
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
		"Device" : loginRecord.device,
		"licenseKey": repoLicense
	};

	await Elastic.createElasticRecord(loginRecordIndex, elasticBody, elasticBody.Id);
};

Elastic.subscribeToV5Events = () => {
	EventsManager.subscribe(EventsV5.SUCCESSFUL_LOGIN_ATTEMPT, async ({username, loginRecord}) => {
		await Elastic.createLoginRecord(username, loginRecord);
	});
};

module.exports = Elastic;
