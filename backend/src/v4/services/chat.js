/**
 *  Copyright (C) 2014 3D Repo Ltd
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

"use strict";

module.exports.createApp = function (server, serverConfig) {
	const userToSocket = {};

	const config = require("../config");
	const session = require("./session").session(config);

	const logger = require("../logger.js");
	const middlewares = require("../middlewares/middlewares");
	const systemLogger = logger.systemLogger;

	const io = require("socket.io")(server, { path: "/" + serverConfig.subdirectory });
	const sharedSession = require("express-socket.io-session");
	const _ = require("lodash");

	const Queue = require("./queue");

	io.use((socket, next) => {
		if(socket.handshake.query["connect.sid"] && !socket.handshake.headers.cookie) {
			socket.handshake.headers.cookie = "connect.sid=" + socket.handshake.query["connect.sid"] + "; ";
		}

		next();
	});

	io.use(sharedSession(session, { autoSave: true }));
	initiateSocket();

	const credentialErrorEventName = "credentialError";
	const joinedEventName = "joined";

	function subscribeToEventMessages() {
		Queue.subscribeToEventMessages((msg) => {
			// consume event queue and fire msg to clients if they have subscribed related event
			if(msg.event && msg.channel && !msg.dm) {
				/*eslint-disable */
				// it is to avoid emitter getting its own message
				const emitter = userToSocket[msg.emitter] && userToSocket[msg.emitter].broadcast || io;
				emitter.to(msg.channel).emit(msg.event, msg.data);
			}
			if (msg.dm && msg.event && msg.data) {
				const recipient = userToSocket[msg.recipient];
				if (recipient) {
					recipient.send({event: msg.event, data: msg.data });
				}
			}
		});
	}

	const socketIdBySession = {};

	function initiateSocket() {
		subscribeToEventMessages();

		// on client connect
		io.on("connection", socket => {
			// socket error handler, frontend will attempt to reconnect
			socket.on("error", err => {
				systemLogger.logError("Chat server - socket error - " + err.message);
				systemLogger.logError(err.stack);
			});

			const sessionId = _.get(socket, "handshake.session.id")

			if (sessionId) {
				if (socketIdBySession[sessionId]) {
					delete userToSocket[socketIdBySession[sessionId]];
				}

				userToSocket[socket.client.id] = socket;
				socketIdBySession[sessionId] = socket.client.id;
				// save the new socket-id
				const db = require("../handler/db");
				db.updateMany("admin", "sessions", { _id: sessionId},
					{ $set: { "session.user.socketId": socket.client.id }}).catch(err => {
					systemLogger.logError("Chat server - DB update error - " + err.message);
				});
			}

//			systemLogger.logInfo(`${username} - ${sessionId} - ${socket.client.id} is in chat`, { username });

			socket.on("join", data => {
				// check permission if the user have permission to join room
				const auth = data.model ? middlewares.hasReadAccessToModelHelper : middlewares.isAccountAdminHelper;
				const modelNameSpace = data.model ?  `::${data.model}` : "";

				const sessionUsername = _.get(socket, "handshake.session.user.username");
				let usernamePromise = Promise.resolve(sessionUsername);

				if (!sessionUsername) {
					const db = require("../handler/db");
					usernamePromise = db.getCollection("admin", "sessions").then((coll) =>
						coll.findOne({ "session.user.socketId": socket.client.id})
					).then( entry =>  _.get(entry, "session.user.username"));
				}


				usernamePromise.then((username) => {
					if(!username) {
						systemLogger.logError("socket connection without credential");
						socket.emit(credentialErrorEventName, { message: "Connection without credential"});
						return;
					}


					auth(username, data.account, data.model).then(hasAccess => {
						if(hasAccess) {
							socket.join(`${data.account}${modelNameSpace}`);
							socket.emit(joinedEventName, { account: data.account, model: data.model});
						} else {
							socket.emit(credentialErrorEventName, { message: `You have no access to join room ${data.account}${modelNameSpace}`});
							systemLogger.logError(`${username} - ${sessionId} - ${socket.client.id} has no access to join room ${data.account}${modelNameSpace}`, {
								username,
								account: data.account,
								model: data.model
							});
						}
					}).catch( err => {
						socket.emit(credentialErrorEventName, { message: `You have no access to join room ${data.account}${modelNameSpace}`});
					});
				});
			});

			socket.on("leave", data => {

				const modelNameSpace = data.model ?  `::${data.model}` : "";

				socket.leave(`${data.account}${modelNameSpace}`);
				systemLogger.logInfo(`${username} - ${sessionId} - ${socket.client.id} has left room ${data.account}${modelNameSpace}`, {
					username,
					account: data.account,
					model: data.model
				});
			});
		});

	}

	// return app;
};
