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
import { orderBy } from 'lodash';
import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ITicketsState } from './tickets.redux';
import { ticketWithGroups } from './ticketsGroups.helpers';
import { ITemplate, ITicket } from './tickets.types';
import { DEFAULT_STATUS_CONFIG } from '@controls/chip/chip.types';
import { selectCurrentProjectTemplateById, selectCurrentProjectTemplates } from '../projects/projects.selectors';
import { selectFederationById } from '../federations/federations.selectors';
import { selectContainerById } from '../containers/containers.selectors';
import { getState } from '@/v5/helpers/redux.helpers';

export const sortTicketsByCreationDate = (tickets: any[]) => orderBy(tickets, `properties.${BaseProperties.CREATED_AT}`, 'desc');

const getTemplateDefaultStatus = (template: ITemplate) => template.properties?.find(({ name }) => name === BaseProperties.STATUS)?.default;

const getTicketWithStatus = (ticket: ITicket, template: ITemplate) => {
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
	(state): (modelId) => boolean => (modelId) => modelId in state.ticketsByModelId,
);

export const selectTemplates = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => state.templatesByModelId[modelId] || [],
);

export const selectActiveTemplates = createSelector(
	selectTemplates,
	(templates) => templates.filter(({ deprecated }) => !deprecated),
);

export const selectTemplateById = createSelector(
	selectTicketsDomain,
	selectTemplates,
	(state, modelId, templateId) => templateId,
	(state, templates, templateId) => templates.find(({ _id }) => _id === templateId) || null,
);

export const selectTemplatesByIds = createSelector(
	selectTicketsDomain,
	selectCurrentProjectTemplates,
	(state, templateIds) => templateIds,
	(state, templates, templateIds) => templates.filter(({ _id }) => templateIds.includes(_id)),
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
	(ticketsList, groups, modelId): ITicket[] => {
		const storeState = getState();
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
		const tickets = modelsIds.flatMap((modelId) => {
			const modelTickets = selectTickets(storeState, modelId);
			const modelName = (selectFederationById(storeState, modelId) || selectContainerById(storeState, modelId))?.name;
			return modelTickets.map((t) => ({ ...t, modelName })); // modelName is added for column sorting
		});
		return sortTicketsByCreationDate(tickets);
	},
);

// This selector takes a variable number of params depending on the template origin:
// - template by project: (templateId)
// - template by model: (modelId, templateId)
// NOTE: the last param should always be the templateId
export const selectStatusConfigByTemplateId = createSelector(
	// select template by model
	selectTemplateById,
	// select template by project
	(state, ...args) => selectCurrentProjectTemplateById(state, args.at(-1)),
	(ticketTemplate, projectTemplate) => ticketTemplate?.config?.status || projectTemplate?.config?.status || DEFAULT_STATUS_CONFIG,
);

export const selectAreInitialFiltersPending = createSelector(
	selectTicketsDomain,
	(state) => state.areInitialFiltersPending,
);
