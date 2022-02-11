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

import { io } from 'socket.io-client';
import { FederationsActionsDispatchers } from '../actionsDispatchers/federationsActions.dispatchers';

const CHAT_SERVER = 'http://local.3drepo.io:3000';

let socket = null;

export const initializeSocket = () => {
	socket = io(CHAT_SERVER, {
		path: '/chat',
		transports: ['websocket'],
	});
};

const joinRoom = (account, model) => {
	socket.emit('join', { account, model });
};

const leaveRoom = (account, model) => {
	socket.emit('leave', { account, model });
};

const subscribeToEvent = (event, callback) => {
	socket.on(event, callback);
};

const unsubscribeToEvent = () => {
	socket.off();
};

export const enableRealtimeFederationUpdates = (teamspace, model, projectId, federationId) => () => {
	joinRoom(teamspace, model);

	subscribeToEvent(`${teamspace}:${model}:issueUpdated`, (payload) => {
		FederationsActionsDispatchers.updateFederationSuccess(projectId, federationId, {
			name: payload.name,
		});
	});

	return () => {
		leaveRoom(teamspace, model);
		unsubscribeToEvent();
	};
};
