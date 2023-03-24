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

import { hexToGLColor } from '@/v4/helpers/colors';
import { selectCurrentModel } from '@/v4/modules/model';
import { IPin } from '@/v4/services/viewer/viewer';
import { theme } from '@/v5/ui/themes/theme';
import { createSelector } from 'reselect';
import { selectTemplateById, selectTicketById, selectTickets } from '../tickets.selectors';
import { ITicket } from '../tickets.types';
import { ITicketsCardState } from './ticketsCard.redux';

const selectTicketsCardDomain = (state): ITicketsCardState => state.ticketsCard || {};

export const selectCurrentTickets = createSelector(
	(state) => state,
	selectCurrentModel,
	selectTickets,
);

const ticketToPin = (ticket:ITicket, selectedId): IPin => ({
	id: ticket._id,
	position: ticket.properties.Pin,
	isSelected: ticket._id === selectedId,
	type: 'issue',
	colour: hexToGLColor(theme.palette.secondary.main),
});

export const selectView = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.view,
);

export const selectSelectedTicketId = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.selectedTicketId,
);

export const selectSelectedTemplateId = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.selectedTemplateId,
);

export const selectSelectedTicket = createSelector(
	(state) => state,
	selectCurrentModel,
	selectSelectedTicketId,
	selectTicketById,
);

export const selectSelectedTemplate = createSelector(
	(state) => state,
	selectCurrentModel,
	selectSelectedTemplateId,
	selectTemplateById,
);

export const selectTicketPins = createSelector(
	selectCurrentTickets,
	selectSelectedTicketId,
	(tickets, selectedTicketId) => {
		tickets.reduce(
			(accum, ticket) => (ticket.properties?.Pin ? [...accum, ticketToPin(ticket, selectedTicketId)] : accum),
			[],
		);
	},
);
