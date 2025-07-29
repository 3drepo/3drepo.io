/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { ITicketComment } from '@/v5/store/tickets/comments/ticketComments.types';
import { subscribeToRoomEvent } from './realtime.service';
import { TicketCommentsActionsDispatchers } from '../actionsDispatchers';

type CommentWithTicketId = ITicketComment & { ticket: string };

// Container
export const enableRealtimeContainerUpdateTicketComment = (
	teamspace: string,
	project: string,
	containerId: string,
) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		'containerUpdateTicketComment',
		({ ticket, ...comment }: Partial<CommentWithTicketId>) => (
			TicketCommentsActionsDispatchers.upsertCommentSuccess(ticket, comment)
		),
	)
);

export const enableRealtimeContainerNewTicketComment = (
	teamspace: string,
	project: string,
	containerId: string,
) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: containerId },
		'containerNewTicketComment',
		({ ticket, ...comment }: CommentWithTicketId) => TicketCommentsActionsDispatchers.upsertCommentSuccess(ticket, comment),
	)
);

// Federation
export const enableRealtimeFederationUpdateTicketComment = (
	teamspace: string,
	project: string,
	federationId: string,
) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: federationId },
		'federationUpdateTicketComment',
		({ ticket, ...comment }: Partial<CommentWithTicketId>) => (
			TicketCommentsActionsDispatchers.upsertCommentSuccess(ticket, comment)
		),
	)
);

export const enableRealtimeFederationNewTicketComment = (
	teamspace: string,
	project: string,
	federationId: string,
) => (
	subscribeToRoomEvent(
		{ teamspace, project, model: federationId },
		'federationNewTicketComment',
		({ ticket, ...comment }: CommentWithTicketId) => TicketCommentsActionsDispatchers.upsertCommentSuccess(ticket, comment),
	)
);
