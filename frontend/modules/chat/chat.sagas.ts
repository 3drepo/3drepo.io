/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { put, takeLatest, select } from 'redux-saga/effects';
import * as io from 'socket.io-client';

import { ChatTypes, ChatActions } from './chat.redux';
import { clientConfigService } from '../../services/clientConfig';
import { selectJoinedRooms } from './chat.selectors';
import { ChatChannel } from '../../services/chat/chat.channel';
import { ModelActions } from '../model';

let socket;

const channels = {};

function* initialise() {
	try {
		const { host, path, reconnectionAttempts } = clientConfigService.chatConfig;
		socket = io(host, {
			path,
			transports: ['websocket'],
			reconnection: true,
			reconnectionDelay: 500,
			reconnectionAttempts
		});

		socket.on('connect', handleConnect);
		socket.on('disconnect', handleDisconnect);
		socket.on('reconnect', handleReconnect);
	} catch (error) {
		console.error(error);
	}
}

function* handleConnect() {
	debugger
	yield put(ChatActions.saveSocketId(socket.id));
}

function* handleDisconnect(socketId) {
	console.error('The websocket for the chat service was disconnected');
	//DialogService.disconnected();
}

function* handleReconnect() {
	console.debug('Rejoining all rooms on reconnect');

	yield handleConnect();

	const joinedRooms: string[] = yield select(selectJoinedRooms);
	for (let index = 0; index < joinedRooms.length; index++) {
		const [teamspace, model] = joinedRooms[index].split('::');
		socket.emit('join', { account: teamspace, model });
	}
}

function* joinRoom({ teamspace, model }) {
	const room = `${teamspace}${model ? '::' + model : ''}`;
	const joinedRooms: any = yield select(selectJoinedRooms);

	if (!joinedRooms.includes(room)) {
		socket.emit('join', { account: teamspace, model });

		yield put(ChatActions.addRoom(room));
	}
}

function* getChannel({ teamspace, model = ''}) {
	const channelId: string = `${teamspace}${model ? `::${model}` : ''}`;

	if (!channels[channelId]) {
		channels[channelId] = new ChatChannel(socket, teamspace, model, () => {
			console.log('TEST')
		});
	}

	return channels[channelId];
}

export default function* ChatSaga() {
	//yield takeLatest(ModelActions.fetchSettingsSuccess, initialise)
	yield takeLatest(ChatTypes.FETCH, fetch);
	yield takeLatest(ChatTypes.JOIN_ROOM, joinRoom);
	yield takeLatest(ChatTypes.GET_CHANNEL, getChannel);
}
