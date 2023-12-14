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

import { TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '@/v5/helpers/actions.helper';
import { ITicketsFilters, OverridesDicts } from '../tickets.types';

export const { Types: TicketsCardTypes, Creators: TicketsCardActions } = createActions({
	setSelectedTicket: ['ticketId'],
	setSelectedTemplate: ['templateId'],
	setSelectedTicketPin: ['pinId'],
	addTicketsTemplateFilter: ['templateId'],
	removeTicketsTemplateFilter: ['templateId'],
	setTicketsQueriesFilter: ['searchQueries'],
	toggleTicketsCompleteFilter: [],
	resetFilters: [],
	setCardView: ['view'],
	openTicket: ['ticketId'],
	setReadOnly: ['readOnly'],
	resetState: [],
	setOverrides: ['overrides'],
}, { prefix: 'TICKETS_CARD/' }) as { Types: Constants<ITicketsCardActionCreators>; Creators: ITicketsCardActionCreators };

export interface ITicketsCardState {
	selectedTicketId: string | null,
	selectedTemplateId: string | null,
	selectedTicketPinId: string | null,
	ticketsFilters: ITicketsFilters,
	view: TicketsCardViews,
	readOnly: boolean,
	overrides: OverridesDicts | null,
}

export const INITIAL_STATE: ITicketsCardState = {
	selectedTicketId: null,
	selectedTemplateId: null,
	selectedTicketPinId: null,
	ticketsFilters: {
		complete: false,
		templates: [],
		queries: [],
	},
	view: TicketsCardViews.List,
	overrides: null,
	readOnly: false,
};

export const setSelectedTicket = (state: ITicketsCardState, { ticketId }: SetSelectedTicketAction) => {
	state.selectedTicketId = ticketId;
};

export const setSelectedTemplate = (state: ITicketsCardState, { templateId }: SetSelectedTemplateAction) => {
	state.selectedTemplateId = templateId;
};

export const setSelectedTicketPin = (state: ITicketsCardState, { pinId }: SetSelectedTicketPinAction) => {
	state.selectedTicketPinId = pinId;
};

export const addTicketsTemplateFilter = (state: ITicketsCardState, { templateId }: AddTicketsTemplateFilterAction) => {
	state.ticketsFilters.templates.push(templateId);
};

export const removeTicketsTemplateFilter = (state: ITicketsCardState, { templateId }: RemoveTicketsTemplateFilterAction) => {
	state.ticketsFilters.templates.splice(state.ticketsFilters.templates.findIndex((id) => id === templateId), 1);
};

export const setTicketsQueriesFilter = (state: ITicketsCardState, { searchQueries }: SetTicketsQueriesFilterAction) => {
	state.ticketsFilters.queries = searchQueries;
};

export const toggleTicketsCompleteFilter = (state: ITicketsCardState) => {
	state.ticketsFilters.complete = !state.ticketsFilters.complete;
};

export const resetFilters = (state: ITicketsCardState) => {
	state.ticketsFilters = INITIAL_STATE.ticketsFilters;
};

export const setCardView = (state: ITicketsCardState, { view }: SetCardViewAction) => {
	state.view = view;
};

export const setReadOnly = (state: ITicketsCardState, { readOnly }: SetReadOnlyAction) => {
	state.readOnly = readOnly;
};

export const setOverrides = (state: ITicketsCardState, { overrides }: SetOverridesAction) => {
	state.overrides = overrides;
};

export const resetState = ({ ticketsFilters, readOnly }: ITicketsCardState) => ({
	...INITIAL_STATE,
	ticketsFilters,
	readOnly,
});

export const ticketsCardReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsCardTypes.SET_SELECTED_TICKET]: setSelectedTicket,
	[TicketsCardTypes.SET_SELECTED_TEMPLATE]: setSelectedTemplate,
	[TicketsCardTypes.SET_SELECTED_TICKET_PIN]: setSelectedTicketPin,
	[TicketsCardTypes.ADD_TICKETS_TEMPLATE_FILTER]: addTicketsTemplateFilter,
	[TicketsCardTypes.REMOVE_TICKETS_TEMPLATE_FILTER]: removeTicketsTemplateFilter,
	[TicketsCardTypes.SET_TICKETS_QUERIES_FILTER]: setTicketsQueriesFilter,
	[TicketsCardTypes.TOGGLE_TICKETS_COMPLETE_FILTER]: toggleTicketsCompleteFilter,
	[TicketsCardTypes.RESET_FILTERS]: resetFilters,
	[TicketsCardTypes.SET_CARD_VIEW]: setCardView,
	[TicketsCardTypes.SET_READ_ONLY]: setReadOnly,
	[TicketsCardTypes.RESET_STATE]: resetState,
	[TicketsCardTypes.SET_OVERRIDES]: setOverrides,
}));

export type SetSelectedTicketAction = Action<'SET_SELECTED_TICKET'> & { ticketId: string };
export type SetSelectedTemplateAction = Action<'SET_SELECTED_TEMPLATE'> & { templateId: string };
export type SetSelectedTicketPinAction = Action<'SET_SELECTED_TICKET_PIN'> & { pinId: string };
export type AddTicketsTemplateFilterAction = Action<'ADD_TICKETS_TEMPLATE_FILTER'> & { templateId: string };
export type RemoveTicketsTemplateFilterAction = Action<'REMOVE_TICKETS_TEMPLATE_FILTER'> & { templateId: string };
export type SetTicketsQueriesFilterAction = Action<'ADD_TICKETS_QUERY_FILTER'> & { searchQueries: string[] };
export type ToggleTicketsCompleteFilterAction = Action<'TOGGLE_TICKETS_COMPLETE_FILTER'>;
export type ResetFiltersAction = Action<'RESET_FILTERS'>;
export type SetCardViewAction = Action<'SET_CARD_VIEW'> & { view: TicketsCardViews };
export type OpenTicketAction = Action<'OPEN_TICKET'> & { ticketId: string };
export type SetReadOnlyAction = Action<'SET_READ_ONLY'> & { readOnly: boolean };
export type ResetStateAction = Action<'RESET_STATE'>;
export type SetOverridesAction = Action<'SET_OVERRIDES'> & { overrides: OverridesDicts | null };

export interface ITicketsCardActionCreators {
	setSelectedTicket: (ticketId: string) => SetSelectedTicketAction,
	setSelectedTemplate: (templateId: string) => SetSelectedTemplateAction,
	setSelectedTicketPin: (pinId: string) => SetSelectedTicketPinAction,
	addTicketsTemplateFilter: (templateId: string) => AddTicketsTemplateFilterAction,
	removeTicketsTemplateFilter: (templateId: string) => RemoveTicketsTemplateFilterAction,
	setTicketsQueriesFilter: (searchQueries: string[]) => SetTicketsQueriesFilterAction,
	toggleTicketsCompleteFilter: () => ToggleTicketsCompleteFilterAction,
	resetFilters: () => ResetFiltersAction,
	setCardView: (view: TicketsCardViews) => SetCardViewAction,
	openTicket: (ticketId: string) => OpenTicketAction,
	setReadOnly: (readOnly: boolean) => SetReadOnlyAction,
	resetState: () => ResetStateAction,
	setOverrides: (overrides: OverridesDicts) => SetOverridesAction,
}
