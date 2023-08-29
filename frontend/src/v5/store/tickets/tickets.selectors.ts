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
import { ITicketsState } from './tickets.redux';
import { createPropertiesWithGroups } from './ticketsGroups.helpers';
import { Properties, TicketWithModelId } from './tickets.types';
import { sortTicketsByCreationDate } from './tickets.helpers';

const selectTicketsDomain = (state): ITicketsState => state.tickets || {};

export const selectTicketsHaveBeenFetched = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => modelId in state.ticketsByModelId,
);

export const selectTickets = createSelector(
	selectTicketsDomain,
	(state, modelId) => modelId,
	(state, modelId) => sortTicketsByCreationDate(state.ticketsByModelId[modelId] || []),
);

export const selectTicketsByContainersAndFederations = createSelector(
	selectTicketsDomain,
	(state, containersAndFederationsIds: string[]) => containersAndFederationsIds,
	(state, containersAndFederationsIds) => {
		const ticketsWithModelId: Array<TicketWithModelId> = containersAndFederationsIds.flatMap((modelId) => (
			(state.ticketsByModelId[modelId] || []).map((ticket) => ({ modelId, ...ticket }))
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

export const selectTicketByIdRaw = createSelector(
	selectTickets,
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

		let { properties } = ticket;
		properties = createPropertiesWithGroups(properties, groups);
		const finalTicket = {
			...ticket,
			properties,
		};

		if (ticket.modules) {
			let { modules } = ticket;
			modules = Object.keys(modules).reduce((partialModules, key) => {
				// eslint-disable-next-line no-param-reassign
				partialModules[key] = createPropertiesWithGroups(modules[key], groups);
				return partialModules;
			}, {} as Record<string, Properties>);

			finalTicket.modules = modules;
		}
		return finalTicket;
	},
);

export const selectRiskCategories = createSelector(
	selectTicketsDomain,
	(state) => state.riskCategories,
);
