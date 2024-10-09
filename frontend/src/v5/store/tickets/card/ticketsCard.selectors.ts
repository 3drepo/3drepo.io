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
import { SequencingProperties, TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { createSelector } from 'reselect';
import { selectTemplateById, selectTemplates, selectTicketById, selectTickets } from '../tickets.selectors';
import { ITicketsCardState } from './ticketsCard.redux';
import { DEFAULT_PIN, getPinColorHex, formatPin, getTicketPins } from '@/v5/ui/routes/viewer/tickets/ticketsForm/properties/coordsProperty/coordsProperty.helpers';
import { IPin } from '@/v4/services/viewer/viewer';
import { selectSelectedDate } from '@/v4/modules/sequences';
import { ticketIsCompleted } from '@controls/chip/statusChip/statusChip.helpers';

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

export const selectViewProps = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.viewProps,
);

export const selectReadOnly = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.readOnly,
);

export const selectIsEditingGroups = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.isEditingGroups,
);

export const selectPinToDrop = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.pinToDrop,
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
	(ticketCardState) => ticketCardState.overrides || { overrides: {}, transparencies: {}, transformations: {} },
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

export const selectFilteringCompleted = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.filters.complete,
);

export const selectFilteringTemplates = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.filters.templates,
);

export const selectFilteringQueries = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.filters.queries,
);

export const selectTicketsFilteredByQueriesAndCompleted = createSelector(
	selectCurrentTickets,
	selectFilteringCompleted,
	selectFilteringQueries,
	selectCurrentTemplates,
	(tickets, isComplete, queries, templates) => tickets.filter((ticket) => {
		const template = templates.find((t) => t._id === ticket.type);
		const ticketCode = `${template.code}:${ticket.number}`;
		const ticketMatchesIsCompleted = ticketIsCompleted(ticket, template) === isComplete;
		if (!ticketMatchesIsCompleted) return false;

		if (!queries.length) return true;

		const ticketMatchesQuery = (query) => [ticketCode, ticket.title].some((str) => str.toLowerCase().includes(query.toLowerCase()));
		return queries.some(ticketMatchesQuery);
	}),
);

export const selectTicketsWithAllFiltersApplied = createSelector(
	selectTicketsFilteredByQueriesAndCompleted,
	selectFilteringTemplates,
	(tickets, filteredTemplates) => {
		if (!filteredTemplates.length) return tickets;
		return tickets.filter(({ type }) => filteredTemplates.includes(type));
	},
);

export const selectIsShowingPins = createSelector(
	selectTicketsCardDomain, (state) => state.isShowingPins,
);

export const selectTicketPins = createSelector(
	selectTicketsWithAllFiltersApplied,
	selectCurrentTemplates,
	selectView,
	selectSelectedTicketPinId,
	selectSelectedTicket,
	selectSelectedDate,
	selectIsShowingPins,
	(tickets, templates, view, selectedTicketPinId, selectedTicket, selectedSequenceDate, isShowingPins): IPin[] => {
		if (view === TicketsCardViews.New || !tickets.length || (view === TicketsCardViews.List && !isShowingPins)) return [];
		if (view === TicketsCardViews.Details) {
			return getTicketPins(templates, selectedTicket, selectedTicketPinId);
		}
		return tickets.reduce(
			(accum, ticket) => {
				const pin = ticket.properties?.Pin;
				if (!pin) return accum;
				const template = templates.find(({ _id }) => _id === ticket.type);
				const color = getPinColorHex(DEFAULT_PIN, template, ticket);

				const { sequencing } = ticket.modules;
				
				if (sequencing && selectedSequenceDate) {
					const startDate = sequencing[SequencingProperties.START_TIME];
					const endDate = sequencing[SequencingProperties.END_TIME];
					if (
						startDate && new Date(startDate) > new Date(selectedSequenceDate) ||
						endDate && new Date(endDate) < new Date(selectedSequenceDate)
					) return accum;
				}
				const isSelected = selectedTicketPinId === ticket._id;
				return [...accum, formatPin(ticket._id, pin, isSelected, color)];
			},
			[],
		);
	},
);

export const selectUnsavedTicket = createSelector(
	selectTicketsCardDomain, (state) => state.unsavedTicket || null,
);

export const selectNewTicketPins = createSelector(
	selectCurrentTemplates,
	selectUnsavedTicket,
	selectSelectedTicketPinId,
	getTicketPins,
);
