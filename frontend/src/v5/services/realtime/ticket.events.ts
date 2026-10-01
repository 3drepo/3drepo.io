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
/* eslint-disable implicit-arrow-linebreak */

import { EditableTicket, Group, ITicket } from '@/v5/store/tickets/tickets.types';
import { addUpdatedAtTime, normalizeViewsInTicket } from '@/v5/store/tickets/tickets.helpers';
import { uniq } from 'lodash';
import { getMeshIDsByQuery } from '@/v4/services/api';
import { meshObjectsToV5GroupNode } from '@/v5/helpers/viewpoint.helpers';
import { getState } from '@/v5/helpers/redux.helpers';
import { subscribeToRoomEvent } from './realtime.service';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '../actionsDispatchers';
import { fetchTicketGroup } from '../api/tickets';
import { selectTemplateById, selectTicketByIdRaw } from '@/v5/store/tickets/tickets.selectors';

export const ticketEvent = (isFed: boolean, eventType: string) => isFed ? `federation${eventType}` : `container${eventType}`;

const UPDATE_TICKETS_BATCH_INTERVAL = 200;

// Container ticket
export const enableRealtimeUpdateTicket = (teamspace: string, project: string, containerId: string, isFed:boolean, revision?: string) => {
	let queuedTickets: Partial<ITicket>[] = [];
	let flushTimeout: ReturnType<typeof setTimeout> = null;

	const flush = (applyFilters = true) => {
		clearTimeout(flushTimeout);
		flushTimeout = null;
		if (!queuedTickets.length) return;

		const tickets = queuedTickets.map(addUpdatedAtTime);
		queuedTickets = [];
		const ticketIds = uniq(tickets.map(({ _id }) => _id));

		TicketsActionsDispatchers.upsertTicketsSuccess(containerId, tickets);
		ticketIds.forEach((ticketId) => TicketsActionsDispatchers.fetchTicketGroups(teamspace, project, containerId, ticketId, revision));
		if (applyFilters) {
			TicketsCardActionsDispatchers.applyFilterForTickets(teamspace, project, containerId, isFed, ticketIds);
		}
	};

	const unsubscribe = subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		ticketEvent(isFed, 'UpdateTicket'),
		(ticket: Partial<EditableTicket>) => {
			const fullTicket = selectTicketByIdRaw(getState(), containerId, (ticket as any)._id);
			const template = fullTicket ? selectTemplateById(getState(), containerId, fullTicket.type) : undefined;
			normalizeViewsInTicket(ticket, template);

			queuedTickets.push(ticket as Partial<ITicket>);
			flushTimeout ??= setTimeout(flush, UPDATE_TICKETS_BATCH_INTERVAL);
		},
	);

	return () => {
		unsubscribe();
		// Keep pending ticket data, but don't filter against a card that may belong to another model now
		flush(false);
	};
};

export const enableRealtimeNewTicket = (teamspace: string, project: string, containerId: string, isFed:boolean, revision?: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		ticketEvent(isFed, 'NewTicket'),
		(ticket: ITicket) => {
			TicketsActionsDispatchers.upsertTicketAndFetchGroups(teamspace, project, containerId, ticket, revision);
 			TicketsCardActionsDispatchers.applyFilterForTicket(teamspace, project, containerId, isFed, ticket._id);
		},
	)
);

export const enableRealtimeUpdateTicketGroup = (teamspace: string, project: string, containerId: string, isFed:boolean, revision: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		ticketEvent(isFed, 'UpdateTicketGroup'),

		async (group: Group) => {
			if (group.rules) {
				const { data } = await getMeshIDsByQuery(teamspace, containerId, group.rules, revision);
				// eslint-disable-next-line no-param-reassign
				group.objects = meshObjectsToV5GroupNode(data);
			// eslint-disable-next-line no-underscore-dangle
			} else if (group.objects.some((o) => !o._ids)) {
				const { objects } = await fetchTicketGroup(teamspace, project, containerId, group.ticket, group._id, false, revision);
				group.objects = objects;
			}
			TicketsActionsDispatchers.updateTicketGroupSuccess(group);
		},
	)
);