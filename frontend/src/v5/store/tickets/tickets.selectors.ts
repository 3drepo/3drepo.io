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
import { createPropertiesWithGroups, ticketWithGroups } from './ticketsGroups.helpers';
import { ITicket, TicketWithModelIdAndName } from './tickets.types';
import { selectContainers } from '../containers/containers.selectors';
import { selectFederations } from '../federations/federations.selectors';

export const sortTicketsByCreationDate = (tickets: any[]) => orderBy(tickets, `properties.${BaseProperties.CREATED_AT}`, 'desc');

const selectTicketsDomain = (state): ITicketsState => state.tickets || {};

export const selectTicketsHaveBeenFetched = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => modelId in state.ticketsByModelId,
);

export const selectTicketsByContainersAndFederations = createSelector(
	selectTicketsDomain,
	(state, containersAndFederationsIds: string[]) => containersAndFederationsIds,
	selectContainers,
	selectFederations,
	(state, containersAndFederationsIds, containers, federations) => {
		const modelIdToName = [...containers, ...federations].reduce((acc, { _id, name }) => {
			// eslint-disable-next-line no-param-reassign
			acc[_id] = name;
			return acc;
		}, {});
		const ticketsWithModelId: TicketWithModelIdAndName[] = containersAndFederationsIds.flatMap((modelId) => (
			(state.ticketsByModelId[modelId] || []).map((ticket) => ({ modelId, modelName: modelIdToName[modelId], ...ticket }))
		));
		return sortTicketsByCreationDate(ticketsWithModelId);
	},
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

const selectTicketsRaw = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => state.ticketsByModelId[modelId] || [],
);

export const selectTickets = createSelector(
	selectTicketsRaw,
	selectTicketsGroups,
	(ticketsList, groups): ITicket[] => {
		const tickets = [];
		ticketsList.forEach((ticket) => {
			tickets.push({ ...ticket, properties: createPropertiesWithGroups(ticket.properties, groups) });
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
	selectTicketByIdRaw,
	selectTicketsGroups,
	(ticket, groups) => {
		if (!ticket) {
			return ticket;
		}
		return ticketWithGroups(ticket, groups);
	},
);

export const selectRiskCategories = createSelector(
	selectTicketsDomain,
	(state) => state.riskCategories,
);
