'use strict';

let config = require('../../config');
let q = require('../../services/queue');
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;

if(config.cn_queue){

	q.connect(config.cn_queue.host, {

		sharedSpacePath: config.cn_queue.shared_storage,
		logger: systemLogger,
		callbackQName: config.cn_queue.callback_queue,
		workerQName: config.cn_queue.worker_queue 

	}).then(() => {

		return q.channel.assertQueue(q.workerQName, { durable: true });

	}).then(() => {

		return q.channel.purgeQueue(q.workerQName);

	}).then(() => {

		console.log('Queue purged.')
		process.exit(0);
		
	}).catch(err => {
		console.log(err);
		process.exit(-1);
	});

} else {
	console.log('No queue config found');
	process.exit(0);
}



