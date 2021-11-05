
const amqp = require("amqplib/callback_api");
const conf = require("../../../src/v4/config");
const path = require("path");
const fs = require("fs");
const winston = require('winston');
//Note: these error codes corresponds to error_codes.h in bouncerclient
const ERRCODE_BOUNCER_CRASH = 12;
const ERRCODE_PARAM_READ_FAIL = 13;
const ERRCODE_BUNDLE_GEN_FAIL = 14;
const softFails = [7,10,15]; //failures that should go through to generate bundle

let channel = null;
let errorCode = 0;


const logger = winston.createLogger({
	transports: [new (winston.transports.File)({'filename': conf.logLocation? conf.logLocation : "./bouncer_worker.log"})]
});

const replaceSharedDirPlaceHolder = (command) => {
	const tagToReplace = '$SHARED_SPACE';
	// messages coming in has a placeholder for $SHARED_SPACE.
	// we need to do a find/replace to make it use rabbitmq sharedDir instead
	let cmd = command;
	const sharedDir = conf.cn_queue.shared_storage;
	cmd = cmd.replace(tagToReplace, sharedDir);
	const cmdArr = cmd.split(/\s+/);
	if (cmdArr[0] === 'import') {
		const data = fs.readFileSync(cmdArr[2], 'utf8');
		const result = data.replace(tagToReplace, sharedDir);
		fs.writeFileSync(cmdArr[2], result, 'utf8');
	}
	return cmd;
};


/**
 * handle queue message
 */
function handleMessage(commandMsg, rid, callback){
	const cmd = replaceSharedDirPlaceHolder(commandMsg);
	// command start with importToy is handled here instead of passing it to bouncer
	if(cmd.startsWith('importToy')){
		const  args = cmd.split(' ');
		let database = args[1];
		let model = args[2];
		callback(JSON.stringify({
			value: 0,
			database: database,
			project: model
		}), true);

	} else if(cmd.startsWith('genFed')){
		const cmdArr = cmd.split(' ');
		const cmdFile = require(cmdArr[1]);
		const cmdDatabase = cmdFile.database;
		const cmdProject = cmdFile.project;
		const user = cmdFile.owner;

		setTimeout(() => {
			callback(JSON.stringify({
				value: 0,
				database: cmdDatabase,
				project: cmdProject,
				user
			}), true);
		}, 1000);
	} else {
		const cmdArr = cmd.split(' ');
		const cmdFile = require(cmdArr[2]);
		const cmdDatabase = cmdFile.database;
		const cmdProject = cmdFile.project;
		const user = cmdFile.owner;
		callback(JSON.stringify({
			status: "processing",
			database: cmdDatabase,
			project: cmdProject,
			user
		}), false);

		setTimeout(() => {
			callback(JSON.stringify({
				value: errorCode,
				database: cmdDatabase,
				project: cmdProject,
				user
			}), true);
		}, 1000);
	}
}
/*
 * @param {sendAck} sendAck - Should an acknowledgement be sent with callback (true/false)
 */
function listenToQueue(ch, queueName, prefetchCount)
{
	ch.assertQueue(queueName, {durable: true});
	logger.info("Bouncer Client Queue started. Waiting for messages in %s of %s....", queueName, conf.cn_queue.host);
	ch.prefetch(prefetchCount);
	ch.consume(queueName, function(msg){
		if (!channel) return;

		logger.info(" [x] Received %s from %s", msg.content.toString(), queueName);
		handleMessage(msg.content.toString(), msg.properties.correlationId, function(reply, sendAck){
			if (!channel) return;

			if (sendAck)
				ch.ack(msg);
			logger.info("sending to reply queue(%s): %s", conf.cn_queue.callback_queue, reply);
			ch.sendToQueue(conf.cn_queue.callback_queue, new Buffer.from(reply), {correlationId: msg.properties.correlationId, appId: msg.properties.appId});
		});
	}, {noAck: false, consumerTag : `fakeBouncer${queueName}`});
}

function connectQ(callback){
	amqp.connect(conf.cn_queue.host, function(err,conn){
		if(err !== null)
		{
			logger.error("failed to establish connection to rabbit mq");
		}
		else
		{
			conn.createChannel(function(err, ch){
				channel = ch;

				ch.assertQueue(conf.cn_queue.callback_queue, { durable: true });
				listenToQueue(ch, conf.cn_queue.worker_queue, conf.cn_queue.task_prefetch || 4);
				listenToQueue(ch, conf.cn_queue.model_queue, conf.cn_queue.model_prefetch || 1);


				(callback || (() => {})) ();
			});
		}
	});
}

function disconnectQ(){
	channel.close();
	channel = null;
}

module.exports = {
	startBouncerWorker : (callback, error = 0) => {
		errorCode = error;
		logger.info("Initialising bouncer client queue...");
		connectQ(callback);
	 },
	stopBouncerWorker : () => {
		logger.info("Stoping bouncer client queue...");
		disconnectQ();
	}
};
