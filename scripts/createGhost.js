'use strict';

let log_iface = require("../backend/logger.js");
let systemLogger = log_iface.systemLogger;
let config = require("../backend/config.js");
let DB = require('../backend/db/db')(systemLogger);
let User = require('../backend/models/user');
let C = require("../backend/constants");
let ghosts = C.REPO_BLACKLIST_USERNAME;

DB.getDB('default').then( db => {
	// set db to singleton modelFactory class
	require('../backend/models/factory/modelFactory').setDB(db);

}).then(() => {
	
	let promises = [];
	
	ghosts.forEach(username => {
		promises.push(
			User.findByUserName(username).then(user => {

				if(user){
					console.log(`Ghost user ${username} already exists.`);
				} else {

					console.log(`Ghost user ${username} not found. Creating...`);

					return User.createUser(systemLogger, username, '', { email: 'support@3drepo.org' }, -1, true).then(() => {
						console.log(`Ghost user ${username} created.`);
					}).catch(err => {
						console.log(`Failed to create ghost user ${username}`, err);
					});
				}
				
			})
		);
	});

	return Promise.all(promises);

}).then(() => {

	console.log('Done');
	process.exit(0);

}).catch(err => {

	console.error(err.stack);
	process.exit(-1);

});
