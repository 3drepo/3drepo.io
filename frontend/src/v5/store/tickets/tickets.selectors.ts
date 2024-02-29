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

import { createSelector } from 'reselect';
import { get, orderBy } from 'lodash';
import { BaseProperties, SafetibaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ITicketsState } from './tickets.redux';
import { ticketWithGroups } from './ticketsGroups.helpers';
import { ITemplate, ITicket } from './tickets.types';
import { DEFAULT_STATUS_CONFIG, TicketStatusTypes, TreatmentStatuses } from '@controls/chip/chip.types';

export const sortTicketsByCreationDate = (tickets: any[]) => orderBy(tickets, `properties.${BaseProperties.CREATED_AT}`, 'desc');

export const getTemplateDefaultStatus = (template: ITemplate) => template.properties?.find(({ name }) => name === BaseProperties.STATUS)?.default;

export const getTicketWithStatus = (ticket: ITicket, template: ITemplate) => {
	if (ticket.properties[BaseProperties.STATUS] || !template) return ticket;
	return {
		...ticket,
		properties: {
			...ticket.properties,
			[BaseProperties.STATUS]: getTemplateDefaultStatus(template),
		},
	};
};

const selectTicketsDomain = (state): ITicketsState => state.tickets || {};

export const selectTicketsHaveBeenFetched = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => modelId in state.ticketsByModelId,
);

export const selectTemplates = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => state.templatesByModelId[modelId] || [],
);

export const selectTemplateById = createSelector(
	selectTicketsDomain,
	selectTemplates,
	(state, modelId, templateId) => templateId,
	(state, templates, templateId) => templates.find(({ _id }) => _id === templateId) || null,
);

export const selectTicketsGroups = createSelector(
	selectTicketsDomain,
	(state) => state.groupsByGroupId,
);

export const selectTicketsRaw = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => state.ticketsByModelId[modelId] || [],
);

export const selectTickets = createSelector(
	selectTicketsRaw,
	selectTicketsGroups,
	(state, modelId) => modelId,
	(state) => state,
	(ticketsList, groups, modelId, storeState): ITicket[] => {
		const tickets = ticketsList.map((ticket) => {
			const ticketWithStatus = getTicketWithStatus(ticket, selectTemplateById(storeState, modelId, ticket.type));
			return ticketWithGroups(({ ...ticketWithStatus, modelId }), groups);
		});

		return orderBy(tickets, `properties.${BaseProperties.CREATED_AT}`, 'desc');
	},
);

export const selectTicketByIdRaw = createSelector(
	selectTicketsRaw,
	(_, modelId, ticketId) => ticketId,
	(tickets, ticketId) => tickets.find(({ _id }) => _id === ticketId) || null,
);

export const selectTicketById = createSelector(
	selectTickets,
	(_, modelId, ticketId) => ticketId,
	(tickets, ticketId) => tickets.find(({ _id }) => _id === ticketId) || null,
);

export const selectRiskCategories = createSelector(
	selectTicketsDomain,
	(state) => state.riskCategories,
);

export const selectTicketsByContainersAndFederations = createSelector(
	(state) => state,
	(state, modelsIds: string[]) => modelsIds,
	(storeState, modelsIds) => {
		const tickets = modelsIds.flatMap((modelId) => selectTickets(storeState, modelId));
		return sortTicketsByCreationDate(tickets);
	},
);

export const selectStatusConfigByTemplateId = createSelector(
	(state) => state,
	(state, modelId) => modelId,
	(state, modelId, templateId) => templateId,
	(storeState, modelId, templateId) => selectTemplateById(storeState, modelId, templateId)?.config?.status || DEFAULT_STATUS_CONFIG,
);

export const selectTicketIsCompleted = createSelector(
	(state) => state,
	(state, modelId) => modelId,
	(state, modelId, ticketId) => ticketId,
	(state, modelId, ticketId) => {
		const ticket = selectTicketById(state, modelId, ticketId);
		const config = selectStatusConfigByTemplateId(state, modelId, ticket.type);
		const statusType = config.values.find(({ name }) => name === ticket.properties[BaseProperties.STATUS]).type;
		const treatmentStatus = get(ticket, `modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`);

		const isCompletedIssueProperty = [TicketStatusTypes.DONE, TicketStatusTypes.VOID].includes(statusType);
		const isCompletedTreatmentStatus = [TreatmentStatuses.AGREED_FULLY, TreatmentStatuses.VOID].includes(treatmentStatus);

		return (isCompletedIssueProperty || isCompletedTreatmentStatus);
	},
);
