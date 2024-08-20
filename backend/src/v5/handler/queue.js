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

const { createResponseCode, templates } = require('../utils/responseCodes');
const amqp = require('amqplib');
const { cn_queue: queueConfig } = require('../utils/config');
const queueLabel = require('../utils/logger').labels.queue;
const logger = require('../utils/logger').logWithLabel(queueLabel);

const Queue = {};

let retry = 0;
let connClosed = false;
let connectionPromise;

let listeners = {};
let channelClosers = [];

const reconnect = () => {
	if (++retry <= queueConfig.maxRetries) {
		logger.logError(`Trying to reconnect[${retry}/${queueConfig.maxRetries}]...`);
		// eslint-disable-next-line no-use-before-define
		return connect();
	}
	logger.logError('Retries exhausted');
	throw createResponseCode(templates.queueConnectionError, 'Max number of retries reached.');
};

const callbackWrapper = (fn) => async (data) => {
	// A wrapper to gracefully perform error handling so a callback function can't crash the connection
	try {
		await fn(data);
	} catch (err) {
		logger.logError(`Callback function resulted in error ${err.message}`);
	}
};

const listenToQueue = async (conn, queueName, callback) => {
	const channel = await conn.createChannel();
	const { queue } = await channel.assertQueue(queueName);

	const { consumerTag } = await channel.consume(queue, callbackWrapper(callback), { noAck: true });

	channelClosers.push(async () => {
		await channel.cancel(consumerTag);
		await channel.close();
	});
};

const listenToExchange = async (conn, exchangeName, callback) => {
	const channel = await conn.createChannel();
	await channel.assertExchange(exchangeName, 'fanout', { durable: true });
	const { queue } = await channel.assertQueue('', { exclusive: true });
	await channel.bindQueue(queue, exchangeName, '');
	const { consumerTag } = await channel.consume(queue, callbackWrapper(callback), { noAck: true, exclusive: true });

	channelClosers.push(async () => {
		await channel.cancel(consumerTag);
		await channel.close();
	});
};

const hookupListeners = (conn) => Promise.all(
	Object.keys(listeners).map((channel) => {
		const { callbacks, isExchange } = listeners[channel];

		const listenFn = isExchange ? listenToExchange : listenToQueue;
		return Promise.all(callbacks.map((fn) => listenFn(conn, channel, fn)));
	}),
);

const connect = async () => {
	/* istanbul ignore next */
	if (connectionPromise) return connectionPromise;
	try {
		logger.logInfo(`Connecting to ${queueConfig.host}...`);
		connectionPromise = amqp.connect(queueConfig.host);
		const conn = await connectionPromise;
		retry = 0;
		connClosed = false;
		channelClosers = [];
		await hookupListeners(conn);

		conn.on('close',
			/* istanbul ignore next */
			() => {
				if (!connClosed) {
				// this can be called more than once for some reason. Use a boolean to distinguish first timers.
					connClosed = true;
					connectionPromise = undefined;
					logger.logInfo('Connection closed.');
					reconnect();
				}
			});

		conn.on('error',
			/* istanbul ignore next */
			(err) => {
				logger.logError(`Connection error: ${err.message}`);
			});
		return conn;
	} catch (err) {
		logger.logError(`Failed to establish connection to rabbit mq: ${err}.`);
		connectionPromise = undefined;
		return reconnect();
	}
};

Queue.listenToQueue = async (queue, callback) => {
	const conn = await connect();
	listeners[queue] = listeners[queue] || { callbacks: [] };
	listeners[queue].callbacks.push(callback);

	await listenToQueue(conn, queue, callback);
};

Queue.listenToExchange = async (exchange, callback) => {
	const conn = await connect();
	listeners[exchange] = listeners[exchange] || { callbacks: [], isExchange: true };
	listeners[exchange].callbacks.push(callback);
	await listenToExchange(conn, exchange, callback);
};

Queue.queueMessage = async (queueName, correlationId, msg) => {
	const conn = await connect();
	const channel = await conn.createChannel();
	await channel.assertQueue(queueName, { durable: true });

	const dataBuf = Buffer.from(msg);
	const meta = { correlationId, persistent: true };

	await channel.sendToQueue(queueName, dataBuf, meta);
	await channel.close();
};

Queue.broadcastMessage = async (exchangeName, msg) => {
	const conn = await connect();
	const channel = await conn.createChannel();
	await channel.assertExchange(exchangeName, 'fanout', { durable: true });

	const dataBuf = Buffer.from(msg);
	const meta = { persistent: true };

	await channel.publish(exchangeName, '', dataBuf, meta);
	await channel.close();
};

// you shouldn't need to use this outside of testing
Queue.close = async (reset = true) => {
	connClosed = true;

	if (connectionPromise) {
		const conn = await connectionPromise;
		await Promise.all(channelClosers.map((fn) => fn()));

		await conn.close();
		connectionPromise = undefined;
	}

	if (reset) listeners = {};
};

Queue.init = async () => {
	connClosed = false;
	await connect();
};

module.exports = Queue;
