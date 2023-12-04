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

import { selectCurrentModel } from '@/v4/modules/model';
import { TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { createSelector } from 'reselect';
import { selectTemplateById, selectTemplates, selectTicketById, selectTickets } from '../tickets.selectors';
import { ITicketsCardState } from './ticketsCard.redux';
import { getTicketIsCompleted } from '../tickets.helpers';
import { DEFAULT_PIN, getPinColorHex, ticketToPin } from '@/v5/ui/routes/viewer/tickets/ticketsForm/properties/coordsProperty/coordsProperty.helpers';

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

export const selectTicketHasClearedOverrides = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => !ticketCardState.overrides,
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

export const selectTicketsFilters = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.ticketsFilters,
);

export const selectFilteringCompleted = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.ticketsFilters.complete,
);

export const selectFilteringTemplates = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.ticketsFilters.templates,
);

export const selectFilteringQueries = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.ticketsFilters.queries,
);

export const selectTicketsFilteredByCompleted = createSelector(
	selectCurrentTickets,
	selectFilteringCompleted,
	(tickets, isComplete) => tickets.filter((ticket) => getTicketIsCompleted(ticket) === isComplete),
);

export const selectTicketsWithAllFiltersApplied = createSelector(
	selectTicketsFilteredByCompleted,
	selectFilteringTemplates,
	selectFilteringQueries,
	selectCurrentTemplates,
	(tickets, filteredTemplates, queries, templates) => {
		const filteredByTemplates = filteredTemplates.length ? tickets.filter(({ type }) => filteredTemplates.includes(type)) : tickets;
		return queries.length ? filteredByTemplates.filter((ticket) => {
			const templateCode = templates.find((template) => template._id === ticket.type).code;
			const ticketCode = `${templateCode}:${ticket.number}`;
			return queries.some((q) => [ticketCode, ticket.title].some((str) => str.toLowerCase().includes(q.toLowerCase())));
		}) : filteredByTemplates;
	},
);


export const selectTicketPins = createSelector(
	selectTicketsWithAllFiltersApplied,
	selectCurrentTemplates,
	selectView,
	selectSelectedTicketPinId,
	(tickets, templates, view, selectedTicketPinId) => {
		if (view !== TicketsCardViews.List) return [];

		return (tickets).reduce(
			(accum, ticket) => {
				const template = templates.find(({ _id }) => _id === ticket.type);
				const color = getPinColorHex(DEFAULT_PIN, template, ticket);
				return ticket.properties?.Pin ? [...accum, ticketToPin(ticket, selectedTicketPinId, color)] : accum;
			},
			[],
		);
	},
);
