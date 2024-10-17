/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const SocketIO = require('socket.io');

const RealTimeMsging = {};

const socketWrapper = (callback) => (socket) => {
	const roomsJoined = new Set();
	const wrapperObj = {
		id: socket.id,
		session: socket?.request?.session,
		onDisconnect: (fn) => socket.on('disconnect', fn),
		onJoin: (fn) => socket.on('join', fn),
		onLeave: (fn) => socket.on('leave', fn),
		emit: (event, msg) => socket.emit(event, msg),
		broadcast: (channel, event, data) => socket.to(channel).emit(event, data),
		join: (channel) => { socket.join(channel); roomsJoined.add(channel); },
		leave: (channel) => { socket.leave(channel); roomsJoined.delete(channel); },
		leaveAll: () => {
			roomsJoined.forEach((room) => {
				socket.leave(room);
			});
			roomsJoined.clear();
		},
	};
	callback(wrapperObj);
};

RealTimeMsging.createApp = (server, sessionService, onNewSockets) => {
	const service = SocketIO(server, { path: '/chat' });
	service.engine.use(sessionService);

	const newSocketsFn = socketWrapper(onNewSockets);
	service.on('connection', (socket) => {
		newSocketsFn(socket);
	});

	return {
		broadcast: (channel, event, data) => service.to(channel).emit(event, data),
		close: () => new Promise((resolve) => service.close(resolve)),
	};
};

module.exports = RealTimeMsging;
