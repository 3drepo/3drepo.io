// node scripts/db_migrations/v2.10/convertGroupIdToLUUID.js mongodb://username:passwordq@hostname:port/db

'use strict';

const utils = require("../../../backend/utils");
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = process.argv[2];

function convertToLUUID(id) {
	if ("[object String]" === Object.prototype.toString.call(id)) {
		id = utils.stringToUUID(id);
	}

	return id;
}

if (!url){
	console.log('Please specify mongodb url');
	console.log('usage: node scripts/db_migrations/v2.8/convertGroupIdToLUUID.js mongodb://username:passwordq@hostname:port/db');
	process.exit();
}

let db;

// Connect using MongoClient
MongoClient.connect(url).then(_db => {

	db = _db;
	return db.admin().listDatabases();

}).then(dbObject => {

	let modelSettingPromises = [];
	let issuePromises = [];

	dbObject.databases.forEach(dbItem => {
		const thisDb = db.db(dbItem.name);

		console.log("Loading DB: " + dbItem.name);
		modelSettingPromises.push(
			new Promise((resolve, reject) => {
				(async () => {
					await thisDb.collection('settings').find().forEach(modelSetting => {
						const modelId = modelSetting._id;
						console.log("Loading Model: " + dbItem.name + "." + modelId);

						issuePromises.push(
							new Promise((resolve, reject) => {
								(async () => {
									await thisDb.collection(modelId + '.issues').find().forEach(issue => {
										if (issue.group_id) {
											convertToLUUID(issue.group_id);
										}

										for (var i = 0; issue.viewpoints && i < issue.viewpoints.length; i++) {
											if (issue.viewpoints[i].highlighted_group_id) {
												issue.viewpoints[i].highlighted_group_id =
													convertToLUUID(issue.viewpoints[i].highlighted_group_id);
											}
											if (issue.viewpoints[i].hidden_group_id) {
												issue.viewpoints[i].hidden_group_id =
													convertToLUUID(issue.viewpoints[i].hidden_group_id);
											}
											if (issue.viewpoints[i].shown_group_id) {
												issue.viewpoints[i].shown_group_id =
													convertToLUUID(issue.viewpoints[i].shown_group_id);
											}
											if (issue.viewpoints[i].group_id) {
												issue.viewpoints[i].group_id =
													convertToLUUID(issue.viewpoints[i].group_id);
											}
										}

										thisDb.collection(modelId + '.issues').updateOne({ '_id': issue._id }, issue);
									}, err => {
										err ? reject(err) : resolve();
									});
								})();
							})
						);
					}, err => {
						err ? reject(err) : resolve();
					});
				})();
			})
		);
	});

	return Promise.all(modelSettingPromises).then(() => { return Promise.all(issuePromises) });
	
}).then(() => {
	console.log('Done!');
	process.exit();
}).catch(err => {
	console.log(err);
	process.exit(-1);
})

