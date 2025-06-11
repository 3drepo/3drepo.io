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
import { ModelId, TeamspaceId, TeamspaceProjectAndModel } from '../store.types';
import { ITemplate, ITicket, NewTicket, Group } from './tickets.types';
import { mergeWithArray } from '../store.helpers';
import { DEFAULT_TICKETS_SORTING, TicketsSorting, TicketsSortingOrder, TicketsSortingProperty } from './card/ticketsCard.types';

const getTicketByModelId = (state, modelId, ticketId) => (
	state.ticketsByModelId?.[modelId].find(({ _id }) => _id === ticketId)
);

export const { Types: TicketsTypes, Creators: TicketsActions } = createActions({
	fetchTickets: ['teamspace', 'projectId', 'modelId', 'isFederation', 'propertiesToInclude'],
	fetchTicketProperties: ['teamspace', 'projectId', 'modelId', 'ticketId', 'templateCode', 'isFederation', 'propertiesToInclude'],
	addFetchingTicketProperties: ['ticketId', 'properties'],
	removeFetchingTicketProperties: ['ticketId', 'properties'],
	fetchTicket: ['teamspace', 'projectId', 'modelId', 'ticketId', 'isFederation', 'revision'],
	fetchTicketsSuccess: ['modelId', 'tickets'],
	fetchTemplates: ['teamspace', 'projectId', 'modelId', 'isFederation', 'getDetails'],
	fetchTemplate: ['teamspace', 'projectId', 'modelId', 'templateId', 'isFederation'],
	replaceTemplateSuccess: ['modelId', 'template'],
	fetchTemplatesSuccess: ['modelId', 'templates'],
	updateTicket: ['teamspace', 'projectId', 'modelId', 'ticketId', 'ticket', 'isFederation', 'onError'],
	createTicket: ['teamspace', 'projectId', 'modelId', 'ticket', 'isFederation', 'onSuccess', 'onError'],
	upsertTicketSuccess: ['modelId', 'ticket'],
	fetchRiskCategories: ['teamspace'],
	fetchRiskCategoriesSuccess: ['riskCategories'],
	fetchTicketGroups: ['teamspace', 'projectId', 'modelId', 'ticketId', 'revision'],
	fetchTicketGroupsSuccess: ['groups'],
	upsertTicketAndFetchGroups: ['teamspace', 'projectId', 'modelId', 'ticket', 'revision'],
	updateTicketGroup: ['teamspace', 'projectId', 'modelId', 'ticketId', 'group', 'isFederation'],
	updateTicketGroupSuccess: ['group'],
	clearGroups: [],
	setSorting: ['property', 'order'],
	resetSorting: [],
	markPropertyAsFetched: ['ticketId', 'property'],
	clearFetchedProperties: [],
}, { prefix: 'TICKETS/' }) as { Types: Constants<ITicketsActionCreators>; Creators: ITicketsActionCreators };

export const INITIAL_STATE: ITicketsState = {
	ticketsByModelId: {},
	templatesByModelId: {},
	groupsByGroupId: {},
	riskCategories: [],
	sorting: DEFAULT_TICKETS_SORTING,
	fetchedProperties: {},
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

export const fetchTicketGroupsSuccess = (state: ITicketsState, { groups }: FetchTicketGroupsSuccessAction) => {
	groups.forEach((group) => {
		state.groupsByGroupId[group._id] = group;
	});
};

export const updateTicketGroupSuccess = (state: ITicketsState, { group }: UpdateTicketGroupSuccessAction) => {
	state.groupsByGroupId[group._id] = group;
};

export const fetchTemplatesSuccess = (state: ITicketsState, { modelId, templates }: FetchTemplatesSuccessAction) => {
	state.templatesByModelId[modelId] = templates;
};

export const fetchRiskCategoriesSuccess = (
	state: ITicketsState, { riskCategories }: FetchRiskCategoriesSuccessAction,
) => {
	state.riskCategories = riskCategories;
};

export const clearGroups = (state: ITicketsState) => {
	state.groupsByGroupId = {};
};

export const setSorting = (state: ITicketsState, { property, order }: SetSortingAction) => {
	state.sorting = { property, order };
};

export const resetSorting = (state: ITicketsState) => {
	state.sorting = { ...DEFAULT_TICKETS_SORTING };
};

export const markPropertyAsFetched = (state: ITicketsState, { ticketId, property }: MarkPropertyAsFetchedAction) => {
	if (!state.fetchedProperties[ticketId]) {
		state.fetchedProperties[ticketId] = new Set();
	}
	state.fetchedProperties[ticketId].add(property);
};

export const clearFetchedProperties = (state: ITicketsState) => {
	state.fetchedProperties = {};
};

export const ticketsReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsTypes.FETCH_TICKETS_SUCCESS]: fetchTicketsSuccess,
	[TicketsTypes.FETCH_TEMPLATES_SUCCESS]: fetchTemplatesSuccess,
	[TicketsTypes.UPSERT_TICKET_SUCCESS]: upsertTicketSuccess,
	[TicketsTypes.REPLACE_TEMPLATE_SUCCESS]: replaceTemplateSuccess,
	[TicketsTypes.FETCH_RISK_CATEGORIES_SUCCESS]: fetchRiskCategoriesSuccess,
	[TicketsTypes.FETCH_TICKET_GROUPS_SUCCESS]: fetchTicketGroupsSuccess,
	[TicketsTypes.UPDATE_TICKET_GROUP_SUCCESS]: updateTicketGroupSuccess,
	[TicketsTypes.CLEAR_GROUPS]: clearGroups,
	[TicketsTypes.SET_SORTING]: setSorting,
	[TicketsTypes.RESET_SORTING]: resetSorting,
	[TicketsTypes.MARK_PROPERTY_AS_FETCHED]: markPropertyAsFetched,
	[TicketsTypes.CLEAR_FETCHED_PROPERTIES]: clearFetchedProperties,
}));

export interface ITicketsState {
	ticketsByModelId: Record<string, ITicket[]>,
	templatesByModelId: Record<string, ITemplate[]>,
	riskCategories: string[],
	groupsByGroupId: Record<string, Group>,
	sorting: TicketsSorting,
	fetchedProperties: Record<string, Set<string>>,
}

export type FetchTicketsAction = Action<'FETCH_TICKETS'> & TeamspaceProjectAndModel & { isFederation: boolean, propertiesToInclude?: string[] };
export type FetchTicketPropertiesAction = Action<'FETCH_TICKET_PROPERTIES'> & TeamspaceProjectAndModel & { ticketId: string, templateCode: string, isFederation: boolean, propertiesToInclude?: string[] };
export type FetchTicketAction = Action<'FETCH_TICKET'> & TeamspaceProjectAndModel & { ticketId: string, isFederation: boolean, revision?: string };
export type UpdateTicketAction = Action<'UPDATE_TICKET'> & TeamspaceProjectAndModel & { ticketId: string, ticket: Partial<ITicket>, isFederation: boolean, onError?: () => void };
export type CreateTicketAction = Action<'CREATE_TICKET'> & TeamspaceProjectAndModel & { ticket: NewTicket, isFederation: boolean, onSuccess: (ticketId) => void, onError: () => void };
export type FetchTicketsSuccessAction = Action<'FETCH_TICKETS_SUCCESS'> & ModelId & { tickets: ITicket[] };
export type UpsertTicketSuccessAction = Action<'UPSERT_TICKET_SUCCESS'> & ModelId & { ticket: Partial<ITicket> };
export type UpsertTicketAndFetchGroupsAction = Action<'UPSERT_TICKET_AND_FETCH_GROUPS'> & TeamspaceProjectAndModel & { ticket: Partial<ITicket>, revision?: string };
export type ReplaceTemplateSuccessAction = Action<'REPLACE_TEMPLATE_SUCCESS'> & ModelId & { template: ITemplate };
export type FetchTemplatesAction = Action<'FETCH_TEMPLATES'> & TeamspaceProjectAndModel & { isFederation: boolean, getDetails?: boolean };
export type FetchTemplateAction = Action<'FETCH_TEMPLATES'> & TeamspaceProjectAndModel & { templateId: string, isFederation: boolean };
export type FetchTemplatesSuccessAction = Action<'FETCH_TEMPLATES_SUCCESS'> & ModelId & { templates: ITemplate[] };
export type FetchRiskCategoriesAction = Action<'FETCH_RISK_CATEGORIES'> & TeamspaceId;
export type FetchRiskCategoriesSuccessAction = Action<'FETCH_RISK_CATEGORIES_SUCCESS'> & { riskCategories: string[] };
export type FetchTicketGroupsAction = Action<'FETCH_TICKET_GROUPS'> & TeamspaceProjectAndModel & { ticketId: string, groupId: string, revision?: string };
export type FetchTicketGroupsSuccessAction = Action<'FETCH_TICKET_GROUPS_SUCCESS'> & { groups: Group[] };
export type UpdateTicketGroupAction = Action<'UPDATE_TICKET_GROUP'> & TeamspaceProjectAndModel & { ticketId: string, group: Group, isFederation: boolean };
export type UpdateTicketGroupSuccessAction = Action<'UPDATE_TICKET_GROUP_SUCCESS'> & { group: Group };
export type ClearGroupsAction = Action<'CLEAR_GROUPS'>;
export type SetSortingAction = Action<'SET_SORTING'> & TicketsSorting;
export type ResetSortingAction = Action<'RESET_SORTING'>;
export type MarkPropertyAsFetchedAction = Action<'MARK_PROPERTY_AS_FETCHED'> & { ticketId: string, property: string };
export type ClearFetchedPropertiesAction = Action<'CLEAR_FETCHED_PROPERTIES'>;

export interface ITicketsActionCreators {
	fetchTickets: (
		teamspace: string,
		projectId: string,
		modelId: string,
		isFederation: boolean,
		propertiesToInclude?: string[],
	) => FetchTicketsAction;
	fetchTicketProperties: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		templateCode: string,
		isFederation: boolean,
		propertiesToInclude?: string[],
	) => FetchTicketsAction;
	fetchTicket: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		isFederation: boolean,
		revision?: string,
	) => FetchTicketAction;
	updateTicket: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		ticket: Partial<ITicket>,
		isFederation: boolean,
		onError?: () => void,
	) => UpdateTicketAction;
	createTicket: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticket: NewTicket,
		isFederation: boolean,
		onSuccess: (ticketId) => void,
		onError: () => void,
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
		getDetails?: boolean,
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
	upsertTicketAndFetchGroups: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticket: Partial<ITicket>,
		revision?: string,
	) => UpsertTicketAndFetchGroupsAction;
	replaceTemplateSuccess: (modelId: string, ticket: ITemplate) => ReplaceTemplateSuccessAction;
	fetchRiskCategories: (teamspace: string) => FetchRiskCategoriesAction;
	fetchRiskCategoriesSuccess: (riskCategories: string[]) => FetchRiskCategoriesSuccessAction;
	fetchTicketGroups: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		revision?: string,
	) => FetchTicketGroupsAction;
	fetchTicketGroupsSuccess: (
		groups: Group[],
	) => FetchTicketGroupsSuccessAction;
	updateTicketGroup: (
		teamspace: string,
		projectId: string,
		modelId: string,
		ticketId: string,
		group: Group,
		isFederation: boolean,
	) => UpdateTicketGroupAction;
	updateTicketGroupSuccess: (
		group: Group,
	) => UpdateTicketGroupSuccessAction;
	clearGroups: () => ClearGroupsAction;
	setSorting: (property: TicketsSortingProperty, order: TicketsSortingOrder) => SetSortingAction,
	resetSorting: () => ResetSortingAction,
	markPropertyAsFetched: (ticketId: string, property: string) => MarkPropertyAsFetchedAction,
	clearFetchedProperties: () => ClearFetchedPropertiesAction,
}
