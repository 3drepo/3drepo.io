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

const selectTicketsDomain = (state): ITicketsState => state.tickets || {};

export const selectModelTickets = createSelector(
	selectTicketsDomain,
	(_, modelId) => modelId,
	(state, modelId) => state.ticketsByModelId[modelId] || [],
);

export const selectModelTemplates = createSelector(
	selectTicketsDomain,
	(_, modelId) => modelId,
	(state, modelId) => state.templatesByModelId[modelId] || [],
);

export const selectModelTemplateById = createSelector(
	selectTicketsDomain,
	selectModelTemplates,
	(_, modelId, templateId) => templateId,
	(_, templates, templateId) => templates.find(({ _id }) => _id === templateId) || null,
);
