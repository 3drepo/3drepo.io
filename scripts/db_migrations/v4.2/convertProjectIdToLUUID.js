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
	console.log('usage: node convertProjectIdToLUUID.js mongodb://username:passwordq@hostname:port/');
	process.exit();
}

const updateProject = (coll) => async (project) => {
	await coll.deleteOne({_id: project._id});
	project._id = convertToLUUID(project._id.toString());
	await coll.insertOne(project);
	return true;
}

const updateProjects = (connection) =>  async (dbItem) => {
	const coll = connection.db(dbItem.name).collection("projects");
	const res = await coll.find().toArray();
	return await Promise.all(res.map(updateProject(coll)))
};


const run = async () => {
	try {
		// Connect using MongoClient
		const connection = await MongoClient.connect(url);
		const {databases} = await connection.admin().listDatabases();
		await Promise.all(databases.map(updateProjects(connection)));
		process.exit();
	} catch(e) {
		console.log("Error!");
		console.log(e);
		process.exit(-1);
	}
};

run();
