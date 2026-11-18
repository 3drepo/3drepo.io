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

import { EditableTicket, ITicket } from '@/v5/store/tickets/tickets.types';
import { subscribeToRoomEvent } from './realtime.service';
import { debounce, get } from 'lodash';
import { addUpdatedAtTime, normalizeViewsInTicket } from '@/v5/store/tickets/tickets.helpers';
import { TicketsActionsDispatchers } from '../actionsDispatchers';
import { selectTemplateById, selectTicketByIdRaw } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';

export const ticketEvent = (isFed: boolean, eventType: string) => isFed ? `federation${eventType}` : `container${eventType}`;
export const UPDATE_TICKETS_BATCH_INTERVAL = 200;
export const UPDATE_TICKETS_BATCH_SIZE = 300;

export const enableRealtimeUpdateTicket = (teamspace: string, project: string, containerOrFederation: string, isFed:boolean) => {
	let queuedTickets: Partial<ITicket>[] = [];
	// Bulk updated tickets will fire an event for every ticket
	// We debounce in order to batch multiple ticket updates together
	const debouncedApplyUpdates = debounce(() => {
		if (!queuedTickets.length) return;

		const tickets = queuedTickets.map(addUpdatedAtTime);
		queuedTickets = [];
		TicketsActionsDispatchers.upsertTicketsSuccess(containerOrFederation, tickets);
	}, UPDATE_TICKETS_BATCH_INTERVAL);

	return subscribeToRoomEvent(
		{ teamspace, project, model: containerOrFederation },
		ticketEvent(isFed, 'UpdateTicket'),
		(ticket: Partial<EditableTicket>) => {
			const fullTicket = selectTicketByIdRaw(getState(), containerOrFederation, (ticket as any)._id);
			const template = fullTicket ? selectTemplateById(getState(), containerOrFederation, fullTicket.type) : undefined;
			normalizeViewsInTicket(ticket, template);

			queuedTickets.push(ticket as Partial<ITicket>);
			debouncedApplyUpdates();
			if (queuedTickets.length >= UPDATE_TICKETS_BATCH_SIZE) {
				debouncedApplyUpdates.flush();
			}
		},
	);
};

export const enableRealtimeNewTicket = (teamspace: string, project: string, containerOrFederation: string, isFed:boolean, revision?: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerOrFederation },
		ticketEvent(isFed, 'NewTicket'),
		(ticket: ITicket) => {
			TicketsActionsDispatchers.upsertTicketAndFetchGroups(teamspace, project, containerOrFederation, ticket, revision);
		},
	)
);

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


