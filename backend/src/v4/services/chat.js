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

const { v5Path } = require("../../interop");
const { subscribe: subscribeV5 } = require(`${v5Path}/services/eventsManager/eventsManager`);
const EventsV5 = require(`${v5Path}/services/eventsManager/eventsManager.constants`).events;

const socketIdToSockets = {};
const sessionToSocketIds = {};

const subscribeToSessionV5Events = () => {
	subscribeV5(EventsV5.SESSION_CREATED, ({ sessionID, socketId }) => {
		if(socketIdToSockets[socketId]) {
			if(!sessionToSocketIds[sessionID]) {
				sessionToSocketIds[sessionID] = new Set();
			}
			sessionToSocketIds[sessionID].add(socketId);
		}
	});
};

module.exports.createApp = function (server, serverConfig) {

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

	subscribeToSessionV5Events();

	const credentialErrorEventName = "credentialError";
	const joinedEventName = "joined";

	function subscribeToEventMessages() {
		Queue.subscribeToEventMessages(async (msg) => {
			try {
				if(msg.event && msg.channel && !msg.dm) {
					const emitter = socketIdToSockets[msg.emitter]?.broadcast || io;
					emitter.to(msg.channel).emit(msg.event, msg.data);
				}
				if (msg.dm && msg.event && msg.data) {
					const recipients = sessionToSocketIds[msg.recipient];
					if (recipients) {
						recipients.forEach((socketId) => {
							const recipientSocket = socketIdToSockets[socketId];
							if(recipientSocket) {
								recipientSocket.send({event: msg.event, data: msg.data });
							}
						});
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

			const sessionID = socket?.handshake?.session?.id;

			if(sessionID && socket?.handshake?.session?.user?.username) {
				if(!sessionToSocketIds[sessionID]) {
					sessionToSocketIds[sessionID] = new Set();
				}
				sessionToSocketIds[sessionID].add(socket.id);
			}

			socket.on("disconnect", () => {
				if(sessionToSocketIds[sessionID]) {
					if(sessionToSocketIds[sessionID].size === 1) {
						delete sessionToSocketIds[sessionID];
					} else {
						sessionToSocketIds[sessionID].delete(socket.id);
					}
				}
				delete socketIdToSockets[socket.id];
			});

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
						systemLogger.logError(`${username} - ${sessionID} - ${socket.id} has no access to join room ${data.account}${modelNameSpace}`, {
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
				systemLogger.logInfo(`${sessionID} - ${socket.id} has left room ${data.account}${modelNameSpace}`, {
					account: data.account,
					model: data.model
				});
			});
		});

	}

	// return app;
};
