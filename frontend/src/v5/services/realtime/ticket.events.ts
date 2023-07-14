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
import { fillOverridesIfEmpty } from '@/v5/store/tickets/tickets.helpers';
import { getMeshIDsByQuery } from '@/v4/services/api';
import { meshObjectsToV5GroupNode } from '@/v5/helpers/viewpoint.helpers';
import { subscribeToRoomEvent } from './realtime.service';
import { TicketsActionsDispatchers } from '../actionsDispatchers';

// Container ticket
export const enableRealtimeContainerUpdateTicket = (teamspace: string, project: string, containerId: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		'containerUpdateTicket',
		(ticket: Partial<EditableTicket>) => {
			fillOverridesIfEmpty(ticket);
			TicketsActionsDispatchers.upsertTicketAndFetchGroups(teamspace, project, containerId, ticket);
		},
	)
);

export const enableRealtimeContainerNewTicket = (teamspace: string, project: string, containerId: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		'containerNewTicket',
		(ticket: ITicket) => TicketsActionsDispatchers.upsertTicketAndFetchGroups(teamspace, project, containerId, ticket),
	)
);

export const enableRealtimeContainerUpdateTicketGroup = (teamspace: string, project: string, containerId: string, revision: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		'containerUpdateTicketGroup',
		async (group: Group) => {
			if (group.rules) {
				const { data } = await getMeshIDsByQuery(teamspace, containerId, group.rules, revision);
				// eslint-disable-next-line no-param-reassign
				group.objects = meshObjectsToV5GroupNode(data);
			}
			TicketsActionsDispatchers.updateTicketGroupSuccess(group);
		},
	)
);

// Federation ticket
export const enableRealtimeFederationUpdateTicket = (teamspace: string, project: string, federationId: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: federationId },
		'federationUpdateTicket',
		(ticket: Partial<EditableTicket>) => {
			fillOverridesIfEmpty(ticket);
			TicketsActionsDispatchers.upsertTicketAndFetchGroups(teamspace, project, federationId, ticket);
		},
	)
);

export const enableRealtimeFederationNewTicket = (teamspace: string, project: string, federationId: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: federationId },
		'federationNewTicket',
		(ticket: ITicket) => TicketsActionsDispatchers.upsertTicketAndFetchGroups(teamspace, project, federationId, ticket),
	)
);

export const enableRealtimeFederationUpdateTicketGroup = (teamspace: string, project: string, federationId: string, revision: string) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: federationId },
		'federationUpdateTicketGroup',
		async (group: Group) => {
			if (group.rules) {
				const { data } = await getMeshIDsByQuery(teamspace, federationId, group.rules, revision);
				// eslint-disable-next-line no-param-reassign
				group.objects = meshObjectsToV5GroupNode(data);
			}
			TicketsActionsDispatchers.updateTicketGroupSuccess(group);
		},
	)
);
