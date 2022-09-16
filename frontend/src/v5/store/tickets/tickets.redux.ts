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

import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';
import { TeamspaceAndProjectId } from '../store.types';
import { ITemplate, ITicket } from './tickets.types';

export const { Types: TicketsTypes, Creators: TicketsActions } = createActions({
	fetchTickets: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	fetchTicketsSuccess: ['modelId', 'tickets'],
	fetchTemplates: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	fetchTemplatesSuccess: ['modelId', 'templates'],
	fetchTemplateDetails: ['teamspace', 'projectId', 'modelId', 'templateId', 'isFederation'],
	fetchTemplateDetailsSuccess: ['modelId', 'templateId', 'details'],
}, { prefix: 'TICKETS/' }) as { Types: Constants<ITicketsActionCreators>; Creators: ITicketsActionCreators };

export const INITIAL_STATE: ITicketsState = {
	ticketsByModelId: {},
	templatesByModelId: {},
};

export const fetchTicketsSuccess = (state, { modelId, tickets }: FetchTicketsSuccessAction) => {
	state.ticketsByModelId[modelId] = tickets;
};

export const fetchTemplatesSuccess = (state, { modelId, templates }: FetchTemplatesSuccessAction) => {
	state.templatesByModelId[modelId] = templates;
};

export const ticketsReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsTypes.FETCH_TICKETS_SUCCESS]: fetchTicketsSuccess,
	[TicketsTypes.FETCH_TEMPLATES_SUCCESS]: fetchTemplatesSuccess,
}));

export interface ITicketsState {
	ticketsByModelId: Record<string, ITicket[]>;
	templatesByModelId: Record<string, ITemplate[]>,
}

export type FetchTicketsAction = Action<'FETCH_TICKETS'> & TeamspaceAndProjectId & { modelId: string, isFederation: boolean };
export type FetchTicketsSuccessAction = Action<'FETCH_TICKETS_SUCCESS'> & { modelId: string, tickets: ITicket[] };
export type FetchTemplatesAction = Action<'FETCH_TEMPLATES'> & TeamspaceAndProjectId & { modelId: string, isFederation: boolean };
export type FetchTemplatesSuccessAction = Action<'FETCH_TEMPLATES_SUCCESS'> & { modelId: string, templates: ITemplate[] };

export interface ITicketsActionCreators {
	fetchTickets: (
		teamspace: string,
		projectId: string,
		modelId: string,
		isFederation: boolean,
	) => FetchTicketsAction;
	fetchTicketsSuccess: (
		modelId: string,
		tickets: ITicket[],
	) => FetchTicketsSuccessAction;
	fetchTemplates: (
		teamspace: string,
		projectId: string,
		modelId: string,
		isFederation: boolean,
	) => FetchTemplatesAction;
	fetchTemplatesSuccess: (modelId: string, templates: ITemplate[]) => FetchTemplatesSuccessAction;
}
