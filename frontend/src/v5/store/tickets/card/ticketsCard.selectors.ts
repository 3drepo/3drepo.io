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
import { TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { createSelector } from 'reselect';
import { isEmpty } from 'lodash';
import { selectTemplateById, selectTemplates, selectTicketById, selectTickets } from '../tickets.selectors';
import { ITicket } from '../tickets.types';
import { ITicketsCardState } from './ticketsCard.redux';
import { getTicketDefaultPinColor } from '@/v5/ui/routes/viewer/tickets/ticketsForm/properties/coordsProperty/pin.helpers.component';

const selectTicketsCardDomain = (state): ITicketsCardState => state.ticketsCard || {};

export const selectCurrentTickets = createSelector(
	(state) => state,
	selectCurrentModel,
	selectTickets,
);

export const selectCurrentTemplates = createSelector(
	(state) => state,
	selectCurrentModel,
	selectTemplates,
);

const ticketToPin = (ticket:ITicket, selectedId, color): IPin => ({
	id: ticket._id,
	position: ticket.properties.Pin,
	isSelected: ticket._id === selectedId,
	type: 'ticket',
	colour: hexToGLColor(color),
});

export const selectView = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.view,
);

export const selectReadOnly = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.readOnly,
);

export const selectSelectedTicketId = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.selectedTicketId,
);

export const selectSelectedTemplateId = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.selectedTemplateId,
);

export const selectSelectedTicketPinId = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.selectedTicketPinId,
);

export const selectTicketOverridesDict = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.overrides || { overrides: {}, transparencies: {} },
);

export const selectTicketOverrides = createSelector(
	selectTicketOverridesDict,
	(overridesDicts) => overridesDicts.overrides,
);

export const selectTicketTransparencies = createSelector(
	selectTicketOverridesDict,
	(overridesDicts) => overridesDicts.transparencies,
);

export const selectTicketHasOverrides = createSelector(
	selectTicketOverrides,
	selectTicketTransparencies,
	(overrides, transparencies) => !isEmpty(overrides) || !isEmpty(transparencies),
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
	selectCurrentTemplates,
	selectView,
	selectSelectedTicketId,
	(tickets, templates, view, selectedTicketId) => {
		if (view !== TicketsCardViews.List) return [];

		return tickets.reduce(
			(accum, ticket) => {
				const template = templates.find(({ _id }) => _id === ticket.type);
				const color = getTicketDefaultPinColor(ticket, template);
				return ticket.properties?.Pin ? [...accum, ticketToPin(ticket, selectedTicketId, color)] : accum;
			},
			[],
		);
	},
);
