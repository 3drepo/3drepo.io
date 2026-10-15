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

import { debounce } from 'lodash';
import { EditableTicket, Group, ITicket } from '@/v5/store/tickets/tickets.types';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '../actionsDispatchers';
import { combineSubscriptions, subscribeToRoomEvent } from './realtime.service';
import { enableRealtimeNewTicket, ticketEvent, UPDATE_TICKETS_BATCH_INTERVAL, UPDATE_TICKETS_BATCH_SIZE } from './ticketTable.events';
import { addUpdatedAtTime, normalizeViewsInTicket } from '@/v5/store/tickets/tickets.helpers';
import { selectTemplateById, selectTicketByIdRaw } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { meshObjectsToV5GroupNode } from '@/v5/helpers/viewpoint.helpers';
import { getMeshIDsByQuery } from '@/v4/services/api';
import { fetchTicketGroup } from '../api/tickets';

const enableRealtimeUpdateTicket = (teamspace: string, project: string, containerOrFederation: string, isFed:boolean) => {
	let queuedTickets: Partial<ITicket>[] = [];
	// Bulk updated tickets will fire an event for every ticket
	// Debounce smaller batches and flush immediately when the batch reaches its size limit
	const debouncedApplyUpdates = debounce(() => {
		if (!queuedTickets.length) return;

		const tickets = queuedTickets.map(addUpdatedAtTime);
		TicketsActionsDispatchers.upsertTicketsSuccess(containerOrFederation, tickets);
		TicketsCardActionsDispatchers.applyFilterForTickets(teamspace, project, containerOrFederation, isFed, tickets.map(( ticket ) => ticket._id));
		queuedTickets = [];
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

const enableRealtimeNewTicketFilter = (teamspace: string, project: string, containerOrFederation: string, isFederation: boolean) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerOrFederation },
		ticketEvent(isFederation, 'NewTicket'),
		(ticket: ITicket) => {
 			TicketsCardActionsDispatchers.applyFilterForTicket(teamspace, project, containerOrFederation, isFederation, ticket._id);
		},
	)
);

export const enableRealtimeUpdateTicketGroup = (teamspace: string, project: string, containerOrFederation: string, isFed:boolean, revision: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerOrFederation },
		ticketEvent(isFed, 'UpdateTicketGroup'),

		async (group: Group) => {
			if (group.rules) {
				const { data } = await getMeshIDsByQuery(teamspace, containerOrFederation, group.rules, revision);
				// eslint-disable-next-line no-param-reassign
				group.objects = meshObjectsToV5GroupNode(data);
			// eslint-disable-next-line no-underscore-dangle
			} else if (group.objects.some((o) => !o._ids)) {
				const { objects } = await fetchTicketGroup(teamspace, project, containerOrFederation, group.ticket, group._id, false, revision);
				group.objects = objects;
			}
			TicketsActionsDispatchers.updateTicketGroupSuccess(group);
		},
	)
);

export const enableRealtimeTickets = (teamspace: string, project: string, containerOrFederation: string, isFederation: boolean, revision?: string) => 
	combineSubscriptions(
		enableRealtimeNewTicket(teamspace, project, containerOrFederation, isFederation, revision),
		enableRealtimeUpdateTicket(teamspace, project, containerOrFederation, isFederation),
		enableRealtimeUpdateTicketGroup(teamspace, project, containerOrFederation, isFederation, revision),
		enableRealtimeNewTicketFilter(teamspace, project, containerOrFederation, isFederation),
	);