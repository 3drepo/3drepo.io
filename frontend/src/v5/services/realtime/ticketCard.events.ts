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

import { ITicket } from '@/v5/store/tickets/tickets.types';
import { TicketsCardActionsDispatchers } from '../actionsDispatchers';
import { combineSubscriptions, subscribeToRoomEvent } from './realtime.service';
import { enableRealtimeNewTicket, enableRealtimeUpdateTicket, enableRealtimeUpdateTicketGroup, tickeEvent } from './ticket.events';

export const enableRealtimeUpdateTicketFilter = (teamspace: string, project: string, containerOrFederation: string, isFederation: boolean) => (
 	subscribeToRoomEvent(
 		{ teamspace, project, model: containerOrFederation },
 		tickeEvent(isFederation, 'UpdateTicket'),
 		(ticket: Partial<ITicket>) => {
 			TicketsCardActionsDispatchers.applyFilterForTicket(teamspace, project, containerOrFederation, isFederation, ticket._id);
 		},
 	)
);

export const enableRealtimeNewTicketFilter = (teamspace: string, project: string, containerOrFederation: string, isFederation: boolean) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerOrFederation },
		tickeEvent(isFederation, 'NewTicket'),
		(ticket: ITicket) => {
 			TicketsCardActionsDispatchers.applyFilterForTicket(teamspace, project, containerOrFederation, isFederation, ticket._id);

		},
	)
);

export const enableRealtimeTickets = (teamspace: string, project: string, containerOrFederation: string, isFederation: boolean, revision) => 
	combineSubscriptions(
		enableRealtimeNewTicket(teamspace, project, containerOrFederation, isFederation, revision),
		enableRealtimeUpdateTicket(teamspace, project, containerOrFederation, isFederation, revision),
		enableRealtimeUpdateTicketGroup(teamspace, project, containerOrFederation, isFederation, revision),
		enableRealtimeUpdateTicketFilter(teamspace, project, containerOrFederation, isFederation),
		enableRealtimeNewTicketFilter(teamspace, project, containerOrFederation, isFederation),
	);