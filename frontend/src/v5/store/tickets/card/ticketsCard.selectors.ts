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
import { selectRiskCategories, selectTemplateById, selectTemplates, selectTicketById, selectTickets } from '../tickets.selectors';
import { ITicketsCardState } from './ticketsCard.redux';
import { DEFAULT_PIN, getPinColorHex, formatPin, getTicketPins } from '@/v5/ui/routes/viewer/tickets/ticketsForm/properties/coordsProperty/coordsProperty.helpers';
import { IPin } from '@/v4/services/viewer/viewer';
import { selectSelectedDate } from '@/v4/modules/sequences';
import { sortBy, uniq, sortedUniqBy } from 'lodash';
import { toTicketCardFilter, templatesToFilters, getFiltersFromJobsAndUsers } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { selectFederationById, selectFederationJobs, selectFederationUsers } from '../../federations/federations.selectors';
import { selectContainerJobs, selectContainerUsers } from '../../containers/containers.selectors';
import { IJobOrUserList } from '../../jobs/jobs.types';

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

export const selectFilters = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.filters || {},
);

export const selectCardFilters = createSelector(
	selectFilters,
	(filters) => toTicketCardFilter(filters) || [],
);

const selectFilteredTicketIds = createSelector(
	selectTicketsCardDomain,
	(ticketCardState) => ticketCardState.filteredTicketIds || [],
);

export const selectFilteredTickets = createSelector(
	selectCardFilters,
	selectCurrentTickets,
	selectFilteredTicketIds,
	(filters, tickets, ids) => {
		if (!filters.length) return tickets;
		return tickets.filter((t) => ids.includes(t._id));
	},
);

export const selectTemplatesWithTickets = createSelector(
	selectCurrentTemplates,
	selectFilteredTickets,
	(templates, tickets) => {
		const idsOfTemplatesWithAtLeastOneTicket = uniq(tickets.map((t) => t.type));
		return templates.filter((t) => idsOfTemplatesWithAtLeastOneTicket.includes(t._id));
	},
);

export const selectAvailableTemplatesFilters = createSelector(
	selectFilters,
	selectTemplatesWithTickets,
	(usedFilters, allFilters) => templatesToFilters(allFilters).filter(({ module, property, type }) => !usedFilters[`${module}.${property}.${type}`]),
);

export const selectIsShowingPins = createSelector(
	selectTicketsCardDomain, (state) => state.isShowingPins,
);

export const selectTicketPins = createSelector(
	selectFilteredTickets,
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
const selectJobsAndUsersByModelId = createSelector(
	selectFederationById,
	selectFederationJobs,
	selectContainerJobs,
	selectFederationUsers,
	selectContainerUsers,
	(fed, fedJobs, contJobs, fedUsers, contUsers) => {
		const isFed = !!fed;
		const jobs = isFed ? fedJobs : contJobs;
		const users = isFed ? fedUsers : contUsers;
		return [...jobs, ...users] as IJobOrUserList;
	},
);

export const selectPropertyOptions = createSelector(
	selectTemplatesWithTickets,
	selectRiskCategories,
	selectJobsAndUsersByModelId,
	(state, modelId, module) => module,
	(state, modelId, module, property) => property,
	(templates, riskCategories, jobsAndUsers, module, property) => {
		const allValues = [];
		if (!module && property === 'Owner') return getFiltersFromJobsAndUsers(
			jobsAndUsers.filter((ju) => !!ju.firstName));
		templates.forEach((template) => {
			const matchingModule = module ? template.modules.find((mod) => (mod.name || mod.type) === module)?.properties : template.properties;
			const matchingProperty = matchingModule?.find(({ name, type: t }) => (name === property) && (['manyOf', 'oneOf'].includes(t)));
			if (!matchingProperty) return;
			switch (matchingProperty.values) {
				case 'riskCategories':
					allValues.push(...riskCategories.map((value) => ({ value, type: 'riskCategories' })));
					break;
				case 'jobsAndUsers':
					allValues.push(...jobsAndUsers.map((ju) => {
						const isUser = !!ju.firstName;
						return ({
							value: isUser ? ju.user : ju._id,
							displayValue: isUser ? `${ju?.firstName} ${ju?.lastName}` : null,
							type: 'jobsAndUsers',
						});
					}));
					break;
				default:
					allValues.push(...matchingProperty.values.map((value) => ({ value, type: 'default' })));
			}
		});
		return sortedUniqBy(sortBy(allValues, 'value'), 'value');
	},
);
