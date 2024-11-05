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

import { invoke } from 'lodash';
import { takeLatest } from 'redux-saga/effects';

import { setSocketIdHeader } from '@/v4/services/api/default';

import { dispatch } from '@/v5/helpers/redux.helpers';
import { IS_DEVELOPMENT } from '../../constants/environment';
import { clientConfigService } from '../../services/clientConfig';
import { ChatActions, ChatTypes } from './chat.redux';
import { Subscriptions } from './subscriptions';
import { ChannelSelector } from './channelsSelector';

const { host, path, reconnectionAttempts } = clientConfigService.chatConfig;
// const socket = io(host, {
// 	path,
// 	transports: ['websocket'],
// 	reconnection: true,
// 	reconnectionDelay: 500,
// 	reconnectionAttempts
// });
const dmSubscriptions = {};

let socket = null;

export const setSocket = (extSocket) => {
	socket = extSocket;
	socket.on('connect', () => dispatch(ChatActions.handleConnect()));
	socket.on('disconnect', () => dispatch(ChatActions.handleDisconnect()));
	socket.on('message', (data) =>  {
		if (!dmSubscriptions[data.event]) {
			return;
		}
		dmSubscriptions[data.event].invokeCallbacks(data.data);
	});
};

const channels = {};
const joinedRooms = [] as any;

function* handleConnect() {
	setSocketIdHeader(socket.id);
	for (let index = 0; index < joinedRooms.length; index++) {
		const [teamspace, model] = joinedRooms[index].split('::');
		socket.emit('join', { account: teamspace, model });
	}
}

function* handleDisconnect() {
	if (IS_DEVELOPMENT) {
		console.error('The websocket for the chat service was disconnected');
	}
}

function* joinRoom({ teamspace, model }) {
	const room = `${teamspace}${model ? '::' + model : ''}`;

	if (!joinedRooms.includes(room)) {
		yield socket.emit('join', { account: teamspace, model });
		joinedRooms.push(room);
	}
}

const getChannel = (teamspace, model = '') => {
	const channelId: string = `${teamspace}${model ? `::${model}` : ''}`;

	if (!channels[channelId]) {
		channels[channelId] = new ChannelSelector(socket, teamspace, model, () => {
			dispatch(ChatActions.joinRoom(teamspace, model));
		});
	}

	return channels[channelId];
};

const invokeChannelHandlers = (channel, handlers) => {
	for (const handler in handlers) {
		if (handlers.hasOwnProperty(handler)) {
			let args = handlers[handler];
			if (!Array.isArray(args)) {
				args = [args];
			}

			invoke(channel, handler, ...args);
		}
	}
};

function* callChannelActions({ subchannelName, teamspace, model = '', handlers = {}}) {
	const subchannel = yield getChannel(teamspace, model)[subchannelName];
	invokeChannelHandlers(subchannel, handlers);
}

function* callCommentsChannelActions({ subchannelName, teamspace, model = '', dataId, handlers = {} }) {
	const subchannel = yield getChannel(teamspace, model)[subchannelName];
	const commentsChannel = subchannel.getCommentsChatEvents(dataId);
	invokeChannelHandlers(commentsChannel, handlers);
}

function* subscribeToDm({event, handler, context}) {
	if (!dmSubscriptions[event]) {
		dmSubscriptions[event] =  new Subscriptions();
	}

	dmSubscriptions[event].subscribe(handler, context);
}

function* unsubscribeToDm({event, handler }) {
	if (!dmSubscriptions[event]) {
		return;
	}

	dmSubscriptions[event].unsubscribe(handler);
}

export default function* ChatSaga() {
	yield takeLatest(ChatTypes.JOIN_ROOM, joinRoom);
	yield takeLatest(ChatTypes.CALL_CHANNEL_ACTIONS, callChannelActions);
	yield takeLatest(ChatTypes.CALL_COMMENTS_CHANNEL_ACTIONS, callCommentsChannelActions);
	yield takeLatest(ChatTypes.HANDLE_CONNECT, handleConnect);
	yield takeLatest(ChatTypes.HANDLE_DISCONNECT, handleDisconnect);
	yield takeLatest(ChatTypes.HANDLE_RECONNECT, handleConnect);
	yield takeLatest(ChatTypes.SUBSCRIBE_TO_DM, subscribeToDm);
	yield takeLatest(ChatTypes.UNSUBSCRIBE_TO_DM, unsubscribeToDm);
}
