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
	const socketIdToSockets = {};

	const { session } = require("./session");

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
		Queue.subscribeToEventMessages(async (msg) => {
			try {
			// consume event queue and fire msg to clients if they have subscribed related event
				if(msg.event && msg.channel && !msg.dm) {
					const emitter = socketIdToSockets[msg.emitter]?.broadcast || io;
					console.log(`${emitter === io ? "General" : "User"} emitter ${msg.emitter}`, Object.keys(socketIdToSockets));
					emitter.to(msg.channel).emit(msg.event, msg.data);
				}
				if (msg.dm && msg.event && msg.data) {
					const recipient = socketIdToSockets[msg.recipient];
					if (recipient) {
						recipient.send({event: msg.event, data: msg.data });
					}
				}
			} catch(err) {
				systemLogger.logError(`Failed to consume chat queue message: ${err?.message || err}`);
			}
		});
	}

	function initiateSocket() {
		subscribeToEventMessages();

		// on client connect
		io.on("connection", socket => {
			// socket error handler, frontend will attempt to reconnect
			socket.on("error", err => {
				systemLogger.logError("Chat server - socket error - " + err.message);
				systemLogger.logError(err.stack);
			});

			socketIdToSockets[socket.id] = socket;

			const sessionId = socket?.handshake?.session?.id;

			console.log("session joined", socket.id);

			socket.on("join", data => {
				// check permission if the user have permission to join room
				const auth = data.model ? middlewares.hasReadAccessToModelHelper : middlewares.isAccountAdminHelper;
				const modelNameSpace = data.model ?  `::${data.model}` : "";

				const username = _.get(socket, "handshake.session.user.username");
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
						systemLogger.logError(`${username} - ${sessionId} - ${socket.id} has no access to join room ${data.account}${modelNameSpace}`, {
							username,
							account: data.account,
							model: data.model
						});
					}
				}).catch(() => {
					socket.emit(credentialErrorEventName, { message: `You have no access to join room ${data.account}${modelNameSpace}`});
				});
			});

			socket.on("leave", data => {

				const modelNameSpace = data.model ?  `::${data.model}` : "";

				socket.leave(`${data.account}${modelNameSpace}`);
				systemLogger.logInfo(`${sessionId} - ${socket.id} has left room ${data.account}${modelNameSpace}`, {
					account: data.account,
					model: data.model
				});
			});
		});

	}

	// return app;
};
