'use strict';

let log_iface = require("../backend/logger.js");
let systemLogger = log_iface.systemLogger;
var config = require("../backend/config.js");
let DB = require('../backend/db/db')(systemLogger);
let User = require('../backend/models/user');

let ghosts = [
	'login',
	'logout',
	'payment',
	'test',
	'os'
];

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

					return User.createUser(systemLogger, username, '', {}, -1).then(() => {
						console.log(`Ghost user ${username} created.`);
					}).catch(() => {
						console.log(`Failed to create ghost user ${username}`);
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

	console.error(err);
	process.exit(-1);

});
