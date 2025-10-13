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
import { orderBy, get } from 'lodash';
import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { ITicketsState } from './tickets.redux';
import { ticketWithGroups } from './ticketsGroups.helpers';
import { ITemplate, ITicket } from './tickets.types';
import { DEFAULT_STATUS_CONFIG } from '@controls/chip/chip.types';
import { selectCurrentProjectTemplateById } from '../projects/projects.selectors';
import { selectFederationById } from '../federations/federations.selectors';
import { selectContainerById } from '../containers/containers.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { TicketSortingProperty } from './card/ticketsCard.types';
import { INITIAL_COLUMNS } from '@/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTable.helper';

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
	(state, modelId) => modelId,
	(state, modelId) => modelId in state.ticketsByModelId,
);

const removeDeprecated = (template: ITemplate): ITemplate => {
	const removeDeprecatedItems = (properties: any[])  => properties.filter((prop) => !prop.deprecated);

	return {
		...template,
		properties: removeDeprecatedItems(template.properties ?? []),
		modules: removeDeprecatedItems(template.modules ?? [])
			.map((module) => (
				{
					...module, 
					properties: removeDeprecatedItems(module.properties ?? []),
				}
			)),
	};
};

export const selectTemplates = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => (state.templatesByModelId[modelId] || []).map(removeDeprecated),
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
) as (state: object, modelId: string, templateId: string) => ITemplate;

export const selectTicketsGroups = createSelector(
	selectTicketsDomain,
	(state) => state.groupsByGroupId,
);

export const selectTicketsRaw = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => {
		const ticketIds = state.ticketsByModelId[modelId] || [];
		return ticketIds.map((ticketId) => state.ticketsData[ticketId]);
	},
);

export const selectTicketsWithGroups = createSelector(
	selectTicketsRaw,
	selectTicketsGroups,
	(state, modelId) => modelId,
	(ticketsList, groups, modelId): ITicket[] => {
		const storeState = getState();
		return ticketsList.map((ticket) => {
			const ticketWithStatus = getTicketWithStatus(ticket, selectTemplateById(storeState, modelId, ticket.type));
			return ticketWithGroups(({ ...ticketWithStatus, modelId }), groups);
		});
	},
);
export const selectSorting = createSelector(
	selectTicketsDomain,
	(state) => state.sorting,
);

export const selectTicketsData = createSelector(
	selectTicketsDomain,
	(state) => state.ticketsData,
);

export const selectTickets = createSelector(
	selectTicketsWithGroups,
	selectSorting,
	(tickets, { property, order }) => {
		if (property === TicketSortingProperty.TICKET_CODE) {
			const ticketCodeSorting = [
				(ticket) => selectTemplateById(getState(), ticket.modelId, ticket.type).code,
				(ticket) => ticket.number,
			];
			return orderBy(tickets, ticketCodeSorting, [order, order]);
		}
		return orderBy(tickets, property, order);
	},
);

export const selectTicketByIdRaw = createSelector(
	selectTicketsDomain,
	(_, modelId, ticketId) => ticketId,
	(state, ticketId) => state.ticketsData[ticketId] || null,
) as (state:object, containerOrFederation:string, ticketId: string) => ITicket;

export const selectTicketById = createSelector(
	selectTickets,
	(_, modelId, ticketId) => ticketId,
	(tickets, ticketId) => tickets.find(({ _id }) => _id === ticketId) || null,
) as (state:object, containerOrFederation:string, ticketId: string) => ITicket;

export const selectTicketsById = createSelector(
	selectTicketsData,
	(_, ticketIds: string[]) => ticketIds,
	(ticketsData, ticketIds) => {
		return ticketIds.reduce((acc, ticketId) => {
			const ticket = ticketsData[ticketId];
			if (ticket) {
				acc.push(ticket);
			}
			return acc;
		}, []);
	},
) as (state:object, ticketIds: string[]) => ITicket[];

export const selectRiskCategories = createSelector(
	selectTicketsDomain,
	(state) => state.riskCategories,
);

export const selectTicketsByModelIdDictionary = createSelector(
	selectTicketsDomain,
	(state) => state.ticketsByModelId,
);

export const selectTicketsByContainersAndFederations = createSelector(
	selectTicketsByModelIdDictionary,
	(_, modelsIds: string[]) => modelsIds,
	(_, modelsIds) => {
		const tickets = modelsIds.flatMap((modelId) => {
			const modelTickets = selectTickets(getState(), modelId);
			const modelName = (selectFederationById(getState(), modelId) || selectContainerById(getState(), modelId))?.name;
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

export const selectTicketPropertyByName = createSelector(
	selectTicketsData,
	(_, ticketId: string, propertyName: string) => ({ ticketId, propertyName }),
	(ticketsData, { ticketId, propertyName }) => {
		const ticket = ticketsData[ticketId];
		if (!ticket) return undefined;
		
		// Handle nested property access (e.g., "properties.status", "title", etc.)
		return get(ticket, propertyName);
	},
) as (state: any, ticketId: string, propertyName: string) => any;


// Selectors for loading properties tracking
export const selectPropertiesFetched = createSelector(
	selectTicketsDomain,
	(state) => state.fetchedProperties || {},
);

const initialPropertiesFetched = new Set(INITIAL_COLUMNS);

export const selectPropertyFetched = createSelector(
	selectPropertiesFetched,
	(state, ticketId: string, property: string) => ({ ticketId, property }),
	(propertiesFetched, { ticketId, property }): boolean =>  
		initialPropertiesFetched.has(property) || 
	(propertiesFetched[ticketId] || {}) [property] || false,
) as (state: any, ticketId: string, property: string) => boolean;

export const selectPropertyFetchedForTickets = createSelector(
	selectPropertiesFetched,
	(state, ticketIds: string[], property: string) => ({ ticketIds, property }),
	(propertiesFetched, { ticketIds, property }): boolean =>
		initialPropertiesFetched.has(property) || 
		ticketIds.every((ticketId) => (propertiesFetched[ticketId] || {}) [property] || false),
) as (state: any, ticketIds: string[], property: string) => boolean;