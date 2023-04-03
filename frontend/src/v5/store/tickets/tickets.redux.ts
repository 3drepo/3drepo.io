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
import { isArray, mergeWith } from 'lodash';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../../helpers/actions.helper';
import { TeamspaceAndProjectId, TeamspaceId } from '../store.types';
import { ITemplate, ITicket, NewTicket } from './tickets.types';

const mergeWithArray = (objValue, srcValue) => mergeWith(objValue, srcValue, (target, src) => {
	if (isArray(target)) return src; // If its an array that is merging just use the newest
	return undefined;
});

const getTicketByModelId = (state, modelId, ticketId) => (
	state.ticketsByModelId?.[modelId].find(({ _id }) => _id === ticketId)
);

export const { Types: TicketsTypes, Creators: TicketsActions } = createActions({
	fetchTickets: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	fetchTicket: ['teamspace', 'projectId', 'modelId', 'ticketId', 'isFederation'],
	fetchTicketsSuccess: ['modelId', 'tickets'],
	fetchTemplates: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	fetchTemplate: ['teamspace', 'projectId', 'modelId', 'templateId', 'isFederation'],
	replaceTemplateSuccess: ['modelId', 'template'],
	fetchTemplatesSuccess: ['modelId', 'templates'],
	updateTicket: ['teamspace', 'projectId', 'modelId', 'ticketId', 'ticket', 'isFederation'],
	createTicket: ['teamspace', 'projectId', 'modelId', 'ticket', 'isFederation', 'onSuccess'],
	upsertTicketSuccess: ['modelId', 'ticket'],
	fetchRiskCategories: ['teamspace'],
	fetchRiskCategoriesSuccess: ['riskCategories'],
}, { prefix: 'TICKETS/' }) as { Types: Constants<ITicketsActionCreators>; Creators: ITicketsActionCreators };

export const INITIAL_STATE: ITicketsState = {
	ticketsByModelId: {},
	templatesByModelId: {},
	riskCategories: [],
};

export const fetchTicketsSuccess = (state: ITicketsState, { modelId, tickets }: FetchTicketsSuccessAction) => {
	state.ticketsByModelId[modelId] = tickets;
};

export const upsertTicketSuccess = (state: ITicketsState, { modelId, ticket }: UpsertTicketSuccessAction) => {
	if (!state.ticketsByModelId[modelId]) state.ticketsByModelId[modelId] = [];

	const modelTicket = getTicketByModelId(state, modelId, ticket._id);

	mergeWithArray(modelTicket, ticket);

	if (!modelTicket) {
		state.ticketsByModelId[modelId].push(ticket as ITicket);
	}
};

export const replaceTemplateSuccess = (state: ITicketsState, { modelId, template }: ReplaceTemplateSuccessAction) => {
	if (!state.templatesByModelId[modelId]) state.templatesByModelId[modelId] = [];

	const modelTemplate = state.templatesByModelId[modelId]
		.find((loadedTemplate) => loadedTemplate._id === template._id);

	if (modelTemplate) {
		mergeWithArray(modelTemplate, template);
	} else {
		state.templatesByModelId[modelId].push(template);
	}
};

export const fetchTemplatesSuccess = (state: ITicketsState, { modelId, templates }: FetchTemplatesSuccessAction) => {
	state.templatesByModelId[modelId] = templates;
};

export const fetchRiskCategoriesSuccess = (
	state: ITicketsState, { riskCategories }: FetchRiskCategoriesSuccessAction,
) => {
	state.riskCategories = riskCategories;
};

export const ticketsReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsTypes.FETCH_TICKETS_SUCCESS]: fetchTicketsSuccess,
	[TicketsTypes.FETCH_TEMPLATES_SUCCESS]: fetchTemplatesSuccess,
	[TicketsTypes.UPSERT_TICKET_SUCCESS]: upsertTicketSuccess,
	[TicketsTypes.REPLACE_TEMPLATE_SUCCESS]: replaceTemplateSuccess,
	[TicketsTypes.FETCH_RISK_CATEGORIES_SUCCESS]: fetchRiskCategoriesSuccess,
}));

export interface ITicketsState {
	ticketsByModelId: Record<string, ITicket[]>,
	templatesByModelId: Record<string, ITemplate[]>,
	riskCategories: string[],
}

export type FetchTicketsAction = Action<'FETCH_TICKETS'> & TeamspaceAndProjectId & { modelId: string, isFederation: boolean };
export type FetchTicketAction = Action<'FETCH_TICKET'> & TeamspaceAndProjectId & { modelId: string, ticketId: string, isFederation: boolean };
export type UpdateTicketAction = Action<'UPDATE_TICKET'> & TeamspaceAndProjectId & { modelId: string, ticketId: string, ticket: Partial<ITicket>, isFederation: boolean };
export type CreateTicketAction = Action<'CREATE_TICKET'> & TeamspaceAndProjectId & { modelId: string, ticket: NewTicket, isFederation: boolean, onSuccess: (ticketId) => void };
export type FetchTicketsSuccessAction = Action<'FETCH_TICKETS_SUCCESS'> & { modelId: string, tickets: ITicket[] };
export type UpsertTicketSuccessAction = Action<'UPSERT_TICKET_SUCCESS'> & { modelId: string, ticket: Partial<ITicket> };
export type ReplaceTemplateSuccessAction = Action<'REPLACE_TEMPLATE_SUCCESS'> & { modelId: string, template: ITemplate };
export type FetchTemplatesAction = Action<'FETCH_TEMPLATES'> & TeamspaceAndProjectId & { modelId: string, isFederation: boolean };
export type FetchTemplateAction = Action<'FETCH_TEMPLATES'> & TeamspaceAndProjectId & { modelId: string, templateId: string, isFederation: boolean };
export type FetchTemplatesSuccessAction = Action<'FETCH_TEMPLATES_SUCCESS'> & { modelId: string, templates: ITemplate[] };
export type FetchRiskCategoriesAction = Action<'FETCH_RISK_CATEGORIES'> & TeamspaceId;
export type FetchRiskCategoriesSuccessAction = Action<'FETCH_RISK_CATEGORIES_SUCCESS'> & { riskCategories: string[] };

export interface ITicketsActionCreators {
	fetchTickets: (
		teamspace: string,
		projectId: string,
		modelId: string,
		isFederation: boolean,
	) => FetchTicketsAction;
	fetchTicket: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		isFederation: boolean,
	) => FetchTicketAction;
	updateTicket: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		ticket: Partial<ITicket>,
		isFederation: boolean,
	) => UpdateTicketAction;
	createTicket: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticket: NewTicket,
		isFederation: boolean,
		onSuccess: (ticketId) => void,
	) => CreateTicketAction;
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
	fetchTemplate: (
		teamspace: string,
		projectId: string,
		modelId: string,
		templateId: string,
		isFederation: boolean,
	) => FetchTemplateAction;
	upsertTicketSuccess: (modelId: string, ticket: Partial<ITicket>) => UpsertTicketSuccessAction;
	replaceTemplateSuccess: (modelId: string, ticket: ITemplate) => ReplaceTemplateSuccessAction;
	fetchRiskCategories: (teamspace: string) => FetchRiskCategoriesAction;
	fetchRiskCategoriesSuccess: (riskCategories: string[]) => FetchRiskCategoriesSuccessAction;
}
