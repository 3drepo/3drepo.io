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
const sharedSession = require('express-socket.io-session');

const RealTimeMsging = {};

const socketWrapper = (callback) => (socket) => callback({
	id: socket.id,
	sessionId: socket?.handshake?.session?.id,
	onError: (fn) => socket.on('error', fn),
	onDisconnect: (fn) => socket.on('disconnect', fn),
	onJoin: (fn) => socket.on('join', fn),
	onLeave: (fn) => socket.on('leave', fn),
	emit: socket.emit,
	join: socket.join,
	leave: socket.leave,

});

RealTimeMsging.createApp = (server, sessionService, sessionHeader, onNewSockets) => {
	const service = SocketIO(server, { path: '/chat' });
	service.use(sharedSession(sessionService, { autoSave: true }));
	service.use(({ handshake }, next) => {
		if (handshake.query[sessionHeader] && !handshake.headers.cookie) {
			// eslint-disable-next-line no-param-reassign
			handshake.headers.cookie = `${sessionHeader}=${handshake.query[sessionHeader]}; `;
		}
		next();
	});

	const newSocketsFn = socketWrapper(onNewSockets);
	service.on('connection', (socket) => {
		newSocketsFn(socket);
	});

	return () => new Promise((resolve) => service.close(resolve));
};

module.exports = RealTimeMsging;
