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
import { TeamspaceAndProjectId, TeamspaceId } from '../store.types';
import { ITemplate, ITicket, ITemplateDetails } from './tickets.types';

export const { Types: TicketsTypes, Creators: TicketsActions } = createActions({
	fetchModelTickets: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	fetchModelTicketsSuccess: ['modelId', 'tickets'],
	fetchTemplates: ['teamspace'],
	fetchTemplatesSuccess: ['teamspace', 'templates'],
	fetchTemplateDetails: ['teamspace', 'templateId'],
	fetchTemplateDetailsSuccess: ['teamspace', 'templateId', 'details'],
}, { prefix: 'TICKETS/' }) as { Types: Constants<ITicketsActionCreators>; Creators: ITicketsActionCreators };

export const INITIAL_STATE: ITicketsState = {
	ticketsByModelId: {},
	templatesByTeamspace: {},
};

export const fetchModelTicketsSuccess = (state, { modelId, tickets }: FetchModelTicketsSuccessAction) => {
	state.ticketsByModelId[modelId] = tickets;
};

export const fetchTemplatesSuccess = (state, { teamspace, templates }: FetchTemplatesSuccessAction) => {
	state.templatesByTeamspace[teamspace] = templates;
};

export const fetchTemplateDetailsSuccess = (state, {
	teamspace,
	templateId,
	details,
}: FetchTemplateDetailsSuccessAction) => {
	const templates = state.templatesByTeamspace[teamspace];
	Object.assign(templates.find(({ _id }) => _id === templateId), details);
};

export const ticketsReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsTypes.FETCH_MODEL_TICKETS_SUCCESS]: fetchModelTicketsSuccess,
	[TicketsTypes.FETCH_TEMPLATES_SUCCESS]: fetchTemplatesSuccess,
	[TicketsTypes.FETCH_TEMPLATE_DETAILS_SUCCESS]: fetchTemplateDetailsSuccess,
}));

export interface ITicketsState {
	ticketsByModelId: Record<string, ITicket[]>;
	templatesByTeamspace: Record<string, ITemplate[]>,
}

export type FetchModelTicketsAction = Action<'FETCH_MODEL_TICKETS'> & TeamspaceAndProjectId & { modelId: string, isFederation: boolean };
export type FetchModelTicketsSuccessAction = Action<'FETCH_MODEL_TICKETS_SUCCESS'> & { modelId: string, tickets: ITicket[] };
export type FetchTemplatesAction = Action<'FETCH_TEMPLATES'> & TeamspaceId;
export type FetchTemplatesSuccessAction = Action<'FETCH_TEMPLATES_SUCCESS'> & TeamspaceId & { templates: ITemplate[] };
export type FetchTemplateDetailsAction = Action<'FETCH_TEMPLATE_DETAILS'> & TeamspaceId & { templateId: string };
export type FetchTemplateDetailsSuccessAction = Action<'FETCH_TEMPLATE_DETAILS_SUCCESS'> & TeamspaceId & { templateId: string, details: ITemplateDetails };

export interface ITicketsActionCreators {
	fetchModelTickets: (
		teamspace: string,
		projectId: string,
		modelId: string,
		isFederation: boolean,
	) => FetchModelTicketsAction;
	fetchModelTicketsSuccess: (
		modelId: string,
		tickets: ITicket[],
	) => FetchModelTicketsSuccessAction;
	fetchTemplates: (teamspace: string) => FetchTemplatesAction;
	fetchTemplatesSuccess: (teamspace: string, templates: ITemplate[]) => FetchTemplatesSuccessAction;
	fetchTemplateDetails: (teamspace: string, templateId: string) => FetchTemplateDetailsAction;
	fetchTemplateDetailsSuccess: (
		teamspace: string,
		templateId: string,
		details: ITemplateDetails,
	) => FetchTemplateDetailsSuccessAction;
}
