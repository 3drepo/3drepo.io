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

import { createActions, createReducer } from 'reduxsauce';

export const { Types: ChatTypes, Creators: ChatActions } = createActions({
	handleConnect: [],
	handleDisconnect: [],
	handleReconnect: [],
	saveSocketId: ['socketId'],
	setJoinedRooms: ['joinedRooms'],
	joinRoom: ['teamspace', 'model'],
	callChannelActions: ['subchannelName', 'teamspace', 'model', 'handlers'],
	callCommentsChannelActions: ['subchannelName', 'teamspace', 'model', 'dataId', 'handlers'],
	subscribeToDm: ['event', 'handler', 'context'],
	unsubscribeToDm: ['event', 'handler']
}, { prefix: 'CHAT/' });

export interface IChatState {
	socketId: string;
	isDialogOpen: boolean;
}

export const INITIAL_STATE: IChatState = {
	socketId: null,
	isDialogOpen: false
};

const saveSocketId = (state = INITIAL_STATE, { socketId }) => {
	return { ...state, socketId };
};

const setJoinedRooms = (state = INITIAL_STATE, { joinedRooms }) => {
	return { ...state, joinedRooms };
};

export const reducer = createReducer(INITIAL_STATE, {
	[ChatTypes.SAVE_SOCKET_ID]: saveSocketId,
	[ChatTypes.SET_JOINED_ROOMS]: setJoinedRooms
});
