/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { EditableTicket } from '@/v5/store/tickets/tickets.types';
import { subscribeToRoomEvent } from './realtime.service';
import { ticketEvent } from './ticket.events';
import { get } from 'lodash';

export const enableRealtimeWatchPropertiesUpdateTicket = 
	(teamspace: string, project: string, modelId: string, isFed:boolean, properties:string[], callback: (...any) => void) => (
		subscribeToRoomEvent(
			{ teamspace, project, model: modelId },
			ticketEvent(isFed, 'UpdateTicket'),
			(ticket: Partial<EditableTicket>) => {
				const aWatchedPropertyChanged = properties.some((watchedProperty) => get(ticket, watchedProperty));
				if (aWatchedPropertyChanged) {
					callback(teamspace, project, modelId, isFed, ticket);
				}
			},
		)
	);

export const enableRealtimeWatchPropertiesNewTicket = 
	(teamspace: string, project: string, containerId: string, isFed:boolean, callback: (...any) => void) => (
		subscribeToRoomEvent(
			{ teamspace, project, model: containerId },
			ticketEvent(isFed, 'NewTicket'),
			(ticket: Partial<EditableTicket>) => {
				callback(teamspace, project, containerId, isFed, ticket);
			},
		)
	);


