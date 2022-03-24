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

import { io, Socket } from 'socket.io-client';

interface IRoomType {
	teamspace?: string;
	model?: string;
	project?: string;
	notifications?: boolean
}

export enum SocketEvents {
	CONNECT = 'connect',
	DISCONNECT = 'disconnect',
}

let socket:Socket = null;
const roomsJoined:Record<string, number> = {};

const roomTypeToId = (roomType:IRoomType) => (roomType.notifications ? 'notifications'
	: JSON.stringify(roomType, Object.keys(roomType).sort()));

const idToRoomType = (id: string): IRoomType => {
	if (id === 'notifications') return { notifications: true };
	return JSON.parse(id);
};

interface IChatConfig {
	host: string;
	path: string;
	reconnectionAttempts: number
}

export const joinRoom = (roomType : IRoomType) => {
	const joinedCount = (roomsJoined[roomTypeToId(roomType)] || 0);
	roomsJoined[roomTypeToId(roomType)] = joinedCount + 1;
	if (joinedCount > 0) return;

	socket.emit('join', roomType);
};

const reJoinRooms = () => {
	const roomTypes = Object.keys(roomsJoined).map(idToRoomType);
	roomTypes.forEach((roomType) => {
		socket.emit('join', roomType);
	});
};

export const leaveRoom = (roomType : IRoomType) => {
	roomsJoined[roomTypeToId(roomType)]--;
	const joinedCount = roomsJoined[roomTypeToId(roomType)];

	if (joinedCount !== 0) return;
	delete roomsJoined[roomTypeToId(roomType)];

	socket.emit('leave', roomType);
};

export const initializeSocket = ({ host, path, reconnectionAttempts }: IChatConfig) => {
	// hack to stop this connection interferring with v4
	// should be removed when this is fixed https://github.com/3drepo/3drepo.io/issues/3098
	// @ts-ignore
	socket = { on: () => {} };
	return;
	socket = io(host, {
		path,
		reconnectionAttempts,
		transports: ['websocket'],
		reconnection: true,
		reconnectionDelay: 500,
	});

	socket.on('connect', reJoinRooms);
};

const subscribeToEvent = (event, callback) => {
	socket.on(event, callback);
};

const unsubscribeToEvent = (event, callback) => {
	socket.off(event, callback);
};

export const subscribeToRoomEvent = (roomType: IRoomType, event: string, callback) => {
	joinRoom(roomType);
	subscribeToEvent(event, callback);

	return () => {
		unsubscribeToEvent(event, callback);
		leaveRoom(roomType);
	};
};

interface IDirectMessage {
	event: string;
	data: any;
}

export const subscribeToDM = (event: string, callback) => {
	const dmCallback = (message: IDirectMessage) => {
		if (message.event !== event) return;
		callback(message.data);
	};

	subscribeToEvent('message', dmCallback);

	return () => {
		unsubscribeToEvent('message', dmCallback);
	};
};

export const subscribeToSocketEvent = (socketEvent:SocketEvents, callback) => {
	subscribeToEvent(socketEvent.toString(), callback);

	return () => {
		unsubscribeToEvent(socketEvent.toString(), callback);
	};
};

export const getSocketId = () => socket.id;
