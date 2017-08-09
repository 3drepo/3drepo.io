'use strict';

let config = require('../../config');
let q = require('../../services/queue');
let log_iface = require("../../logger.js");
let systemLogger = log_iface.systemLogger;

if(config.cn_queue){

	q.connect(config.cn_queue.host, {


		shared_storage: config.cn_queue.shared_storage,
		logger: systemLogger,
		callback_queue: config.cn_queue.callback_queue,
		worker_queue: config.cn_queue.worker_queue,
		event_exchange: config.cn_queue.event_exchange
		
	}).then(() => {

		return q.channel.assertQueue(q.workerQName, { durable: true });

	}).then(() => {

		return q.channel.purgeQueue(q.workerQName);
	}).then(() => {

		return q.channel.assertQueue(q.modelQName, { durable: true });

	}).then(() => {

		return q.channel.purgeQueue(q.modelQName);

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



