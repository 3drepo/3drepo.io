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

var log_iface = require('../js/core/logger.js');
var logger = log_iface.logger;

var sharedSession = require("express-socket.io-session");
var config = require('../js/core/config.js');

module.exports.init = function (session, server) {
	var socketio = require('socket.io')(server, { path: config.api_server.chat_path });

	socketio.use(sharedSession(session, { autoSave: true }));

	socketio.sockets.on("connection", function (socket) {

		//console.log(JSON.stringify(socket));

		socket.on("error", function(err) {
			if (err)
				logger.log("error", err.stack);
			});

//		socket.on("open_issue", function(userdata) {

//		});

		socket.on("post_message", function(userdata)
		{
			console.log(JSON.stringify(userdata));
		});
	});
};

