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



module.exports.init = function (session, listener) {
	"use strict";

	let systemLogger = require("../logger.js").systemLogger;

	let sharedSession = require("express-socket.io-session");
	let config = require("../config.js");

	let socketio = require("socket.io")(listener, { path: config.api_server.chat_path });
	let dbInterface = require("../db/db_interface.js");

	let issueMonitoring   = {};
	let projectMonitoring = {};

	socketio.use(sharedSession(session, { autoSave: true }));

	socketio.sockets.on("connection", function (socket) {

		socket.on("error", function(err) {
			if (err) {
				systemLogger.logError(err.stack);
			}
			});

		socket.on("new_issue", function(data) {
			let username = socket.handshake.session.user.username;

			dbInterface(systemLogger).hasWriteAccessToProject(username, data.account, data.project, function(err) {
				if (!err.value)
				{
					let proj_account_key = data.account + "__" + data.project;

					if (projectMonitoring[proj_account_key])
					{
						for(let i = 0; i < projectMonitoring[proj_account_key].length; i++)
						{
							let clientSocket = projectMonitoring[proj_account_key][i];

							if (clientSocket !== socket) {
								clientSocket.emit("new_issue", data);
							}
						}
					}
				} else {
					systemLogger.logError("User " + username + " does not have access to read this issue.");
				}
			});
		});

		socket.on("open_issue", function(data) {
			let username = socket.handshake.session.user.username;

			dbInterface(systemLogger).hasReadAccessToProject(username, data.account, data.project, function(err) {
				if (!err.value)
				{
					if (!issueMonitoring[data.id]) {
						issueMonitoring[data.id] = [];
					}

					issueMonitoring[data.id].push(socket);

				} else {
					systemLogger.logError("User " + username + " does not have access to read this issue.");
				}
			});
		});

		socket.on("watch_project", function(data) {
			let username = socket.handshake.session.user.username;

			dbInterface(systemLogger).hasReadAccessToProject(username, data.account, data.project, function(err) {
				let proj_account_key = data.account + "__" + data.project;

				if (!err.value)
				{
					if (!projectMonitoring[proj_account_key]) {
						projectMonitoring[proj_account_key] = [];
					}

					projectMonitoring[proj_account_key].push(socket);

				} else {
					systemLogger.logError("User " + username + " does not have access to read this issue.");
				}
			});
		});

		socket.on("post_comment", function(data)
		{
			let username = socket.handshake.session.user.username;

			dbInterface(systemLogger).hasWriteAccessToProject(username, data.account, data.project, function(err) {
				if (!err.value)
				{
					if (issueMonitoring[data.id])
					{
						// Clean up the data to send back to the client
						delete data.account;
						delete data.project;
						data.owner = username;

						for(let i = 0; i < issueMonitoring[data.id].length; i++)
						{
							let clientSocket = issueMonitoring[data.id][i];

							if (clientSocket !== socket){
								clientSocket.emit("post_comment", data);
							}
						}
					}
				} else {
					systemLogger.logError("User " + username + " does not have access to post to this issue.");
				}
			});
		});
	});
};

