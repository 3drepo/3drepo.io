'use strict';

// little happy script to re-import toy project
// This script will remove project named Sample_Project and all models insdie this project

const log_iface = require("../backend/logger.js");
const systemLogger = log_iface.systemLogger;
const config = require("../backend/config.js");
const DB = require('../backend/db/db');
const ModelHelper = require('../backend/models/helper/model');
const Project = require('../backend/models/project');
const C = require("../backend/constants");

const username = process.argv[2];
const account = process.argv[3];

const middleware = require('../backend/middlewares/middlewares');
const SAMPLE_PROJECT = 'Sample_Project';

if(!username || !account){
	console.log(`Usage: NODE_ENV=<env> ${process.argv[0]} ${process.argv[1]} <username> <account>`);
	process.exit(-1);
}

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`This script will remove project named Sample_Project and all models insdie this project in account ${account}
		Are you sure? (YES/n)
	`, (answer) => {

	if(answer !== 'YES'){
		return process.exit(0);
	}

	rl.close();

	DB.getDB('default').then(db => {
		// set db to singleton modelFactory class
		require('../backend/models/factory/modelFactory').setDB(db);

	}).then(() => {

		return middleware.createQueueInstance();

	}).then(() => {

		return Project.findOne({account}, {name: SAMPLE_PROJECT});

	}).then(project => {

		if(project){
			return Promise.all(
				[].concat(
					project.models.map(m => ModelHelper.removeModel(account, m, true)),
					Project.delete(account, SAMPLE_PROJECT)
				)
			)
		}

	}).then(() => {

		return ModelHelper.importToyProject(username, account);

	}).then(() => {

		console.log('Done');
		process.exit(0);

	}).catch(err => {

		console.error(err);
		console.error(err.stack);
		process.exit(-1);

	});
});

