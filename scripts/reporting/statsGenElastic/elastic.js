/**
*	Copyright (C) 2020 3D Repo Ltd
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

"use strict";
const Utils = require("./utils");
const { Client } = require("@elastic/elasticsearch");

const Elastic = {};

Elastic.createElasticClient = () => {
	const ELASTIC_CLOUD_AUTH = process.env.ELASTIC_CLOUD_AUTH.split(":");
	const ElasticClient = new Client({
		cloud: {
			id: process.env.ELASTIC_CLOUD_ID
		},
		auth: {
			username: ELASTIC_CLOUD_AUTH[0],
			password: ELASTIC_CLOUD_AUTH[1]
		},
		reload_connections: true,
		maxRetries: 5,
		request_timeout: 60
	});

	ElasticClient.cluster.health({},function(err,resp) {
		console.log("[ELASTIC] -- Client Health --",resp);
	});
	return ElasticClient;
};

Elastic.createElasticRecord = async (ElasticClient, Index, elasticBody, id, mapping) => {
	try {

		if (elasticBody) {
			id = id || Utils.hashCode(Object.values(elasticBody).toString());
		} else {
			id = id || Utils.hashCode(Object.values({}).toString());
		}

		const indexName = Index.toLowerCase(); // requirement of elastic that indexs be lowercase
		const configured = await ElasticClient.indices.exists({ index: indexName });
		if (!configured.body) {
			await ElasticClient.indices.create({
				index: indexName
			});
			console.log("[ELASTIC] Created index " + indexName);

			if (mapping) {
				await ElasticClient.indices.putMapping({
					index: Index,
					body: { properties: mapping }
				});
			}
			console.log("[ELASTIC] created mapping " + indexName);
		}

		if (elasticBody) {
			await ElasticClient.index({
				index: indexName,
				id: id,
				refresh: true,
				body: elasticBody
			});
			console.log("[ELASTIC] created doc " + indexName + " " + Object.values(elasticBody).toString());
		}
		return Promise.resolve();
	} catch (error) {
		console.error("[ELASTIC] ERROR:" + Index, elasticBody, error);
		Promise.reject();
		throw(error.body.error);
	}
};

Elastic.createElasticIndex = async (ElasticClient, Index, mapping) => {
	try {
		Elastic.createElasticRecord (ElasticClient, Index, undefined, undefined, mapping);
	} catch (error) {
		Promise.reject();
		throw(error.body.error);
	}
};

Elastic.createMissingIndicies = async (ElasticClient) => {
	// initialise indicies if missing

	const activityMapping = {
		"Teamspace" : { "type": "keyword" },
		"licenseType" : { "type": "text" },
		"Year" : { "type": "text" },
		"Month" : { "type": "text" },
		"DateTime" : { "type": "date" },
		"Issues" :  { "type": "double" },
		"Model Revisions" : { "type": "double" }
	};

	await Elastic.createElasticIndex(ElasticClient, Utils.teamspaceIndexPrefix + "-activity", activityMapping);

	const quotaMapping = {
		"Teamspace" : { "type": "keyword" },
		"Type" : { "type": "text" },
		"User Count" : { "type": "double" },
		"Max Users" : { "type": "double" },
		"Max Data(GB)" :  { "type": "double" },
		"Expiry Date" : { "type": "date" },
		"Expired" : { "type": "boolean" }
	};
	await Elastic.createElasticIndex(ElasticClient, Utils.teamspaceIndexPrefix + "-quota", quotaMapping);

	const usersMapping = {
		"Teamspace" : { "type": "keyword" },
		"Email" : { "type": "text" },
		"First Name" : { "type": "text" },
		"Last Name" : { "type": "text" },
		"Country" : { "type": "text" },
		"Company" : { "type": "text" },
		"Date Created" : { "type": "text" },
		"DateTime" : { "type": "date" },
		"Mail Optout" : { "type": "text" },
		"Verified" : { "type": "boolean" }
	};
	await Elastic.createElasticIndex(ElasticClient, Utils.teamspaceIndexPrefix + "-users", usersMapping);

	const loginMapping = {
		"Teamspace" : { "type": "keyword" },
		"Last Login" : { "type": "text" },
		"DateTime" : { "type": "date" }
	};
	await Elastic.createElasticIndex(ElasticClient, Utils.teamspaceIndexPrefix + "-login", loginMapping);

	const statsMapping = {
		"Month" : { "type": "text" },
		"Year" :{ "type": "text" },
		"Count" : { "type": "double" },
		"Total" :{ "type": "double" },
		"DateTime" : { "type": "date" }
	};
	await Elastic.createElasticIndex(ElasticClient, Utils.statsIndexPrefix, statsMapping);

};

module.exports = Elastic;
