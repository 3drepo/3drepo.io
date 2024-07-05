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
import { EditableTicket, ITicketsFilters, OverridesDicts } from '../tickets.types';
import { TeamspaceProjectAndModel } from '../../store.types';

export const { Types: TicketsCardTypes, Creators: TicketsCardActions } = createActions({
	setSelectedTicket: ['ticketId'],
	setSelectedTemplate: ['templateId'],
	setSelectedTicketPin: ['pinId'],
	setTemplateFilters: ['templateIds'],
	setQueryFilters: ['searchQueries'],
	toggleCompleteFilter: [],
	resetFilters: [],
	fetchTicketsList: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	setCardView: ['view', 'props'],
	openTicket: ['ticketId'],
	setReadOnly: ['readOnly'],
	resetState: [],
	setOverrides: ['overrides'],
	setUnsavedTicket: ['ticket'],
	setTransformations: ['transformations'],
	setEditingGroups: ['isEditing'],
}, { prefix: 'TICKETS_CARD/' }) as { Types: Constants<ITicketsCardActionCreators>; Creators: ITicketsCardActionCreators };

export interface ITicketsCardState {
	selectedTicketId: string | null,
	selectedTemplateId: string | null,
	selectedTicketPinId: string | null,
	filters: ITicketsFilters,
	view: TicketsCardViews,
	viewProps: any,
	readOnly: boolean,
	overrides: OverridesDicts | null,
	unsavedTicket: EditableTicket | null,
	transformations: any,
	isEditingGroups: boolean;
}

export const INITIAL_STATE: ITicketsCardState = {
	selectedTicketId: null,
	selectedTemplateId: null,
	selectedTicketPinId: null,
	filters: {
		complete: false,
		templates: [],
		queries: [],
	},
	view: TicketsCardViews.List,
	viewProps: null,
	overrides: null,
	transformations: null,
	readOnly: false,
	unsavedTicket: null,
	isEditingGroups: false,
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

export const setTemplateFilters = (state: ITicketsCardState, { templateIds }: SetTemplateFiltersAction) => {
	state.filters.templates = templateIds;
};

export const setQueryFilters = (state: ITicketsCardState, { searchQueries }: SetQueryFiltersAction) => {
	state.filters.queries = searchQueries;
};

export const toggleCompleteFilter = (state: ITicketsCardState) => {
	state.filters.complete = !state.filters.complete;
};

export const resetFilters = (state: ITicketsCardState) => {
	state.filters = INITIAL_STATE.filters;
};

export const setCardView = (state: ITicketsCardState, { view, props }: SetCardViewAction) => {
	state.view = view;
	state.viewProps = props;
};

export const setReadOnly = (state: ITicketsCardState, { readOnly }: SetReadOnlyAction) => {
	state.readOnly = readOnly;
};

export const setOverrides = (state: ITicketsCardState, { overrides }: SetOverridesAction) => {
	state.overrides = overrides;
};

export const setUnsavedTicket = (state: ITicketsCardState, { ticket }: SetUnsavedTicketAction) => {
	state.unsavedTicket = ticket;
};

export const resetState = ({ filters, readOnly }: ITicketsCardState) => ({
	...INITIAL_STATE,
	filters,
	readOnly,
});

export const setEditingGroups = (state: ITicketsCardState, { isEditing }: SetEditingGroupsAction) => {
	state.isEditingGroups = isEditing;
};

export const ticketsCardReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsCardTypes.SET_SELECTED_TICKET]: setSelectedTicket,
	[TicketsCardTypes.SET_SELECTED_TEMPLATE]: setSelectedTemplate,
	[TicketsCardTypes.SET_SELECTED_TICKET_PIN]: setSelectedTicketPin,
	[TicketsCardTypes.SET_TEMPLATE_FILTERS]: setTemplateFilters,
	[TicketsCardTypes.SET_QUERY_FILTERS]: setQueryFilters,
	[TicketsCardTypes.TOGGLE_COMPLETE_FILTER]: toggleCompleteFilter,
	[TicketsCardTypes.RESET_FILTERS]: resetFilters,
	[TicketsCardTypes.SET_CARD_VIEW]: setCardView,
	[TicketsCardTypes.SET_READ_ONLY]: setReadOnly,
	[TicketsCardTypes.RESET_STATE]: resetState,
	[TicketsCardTypes.SET_OVERRIDES]: setOverrides,
	[TicketsCardTypes.SET_UNSAVED_TICKET]: setUnsavedTicket,
	[TicketsCardTypes.SET_EDITING_GROUPS]: setEditingGroups,
}));

export type SetSelectedTicketAction = Action<'SET_SELECTED_TICKET'> & { ticketId: string };
export type SetSelectedTemplateAction = Action<'SET_SELECTED_TEMPLATE'> & { templateId: string };
export type SetSelectedTicketPinAction = Action<'SET_SELECTED_TICKET_PIN'> & { pinId: string };
export type SetTemplateFiltersAction = Action<'SET_TEMPLATE_FILTERS'> & { templateIds: string[] };
export type SetQueryFiltersAction = Action<'SET_QUERY_FILTERS'> & { searchQueries: string[] };
export type ToggleCompleteFilterAction = Action<'TOGGLE_COMPLETE_FILTER'>;
export type ResetFiltersAction = Action<'RESET_FILTERS'>;
export type FetchTicketsListAction = Action<'FETCH_TICKETS_LIST'> & TeamspaceProjectAndModel & { isFederation: boolean };
export type SetCardViewAction = Action<'SET_CARD_VIEW'> & { view: TicketsCardViews, props?:any };
export type OpenTicketAction = Action<'OPEN_TICKET'> & { ticketId: string };
export type SetReadOnlyAction = Action<'SET_READ_ONLY'> & { readOnly: boolean };
export type ResetStateAction = Action<'RESET_STATE'>;
export type SetOverridesAction = Action<'SET_OVERRIDES'> & { overrides: OverridesDicts | null };
export type SetUnsavedTicketAction = Action<'SET_UNSAVED_TICKET'> & { ticket: EditableTicket };
export type SetEditingGroupsAction = Action<'SET_EDITING_GROUPS'> & { isEditing: boolean } ;


export interface ITicketsCardActionCreators {
	setSelectedTicket: (ticketId: string) => SetSelectedTicketAction,
	setSelectedTemplate: (templateId: string) => SetSelectedTemplateAction,
	setSelectedTicketPin: (pinId: string) => SetSelectedTicketPinAction,
	setTemplateFilters: (templateIds: string[]) => SetTemplateFiltersAction,
	setQueryFilters: (searchQueries: string[]) => SetQueryFiltersAction,
	toggleCompleteFilter: () => ToggleCompleteFilterAction,
	resetFilters: () => ResetFiltersAction,
	fetchTicketsList: (
		teamspace: string,
		projectId: string,
		modelId: string,
		isFederation: boolean,
	) => FetchTicketsListAction;
	setCardView: (view: TicketsCardViews, props?: any) => SetCardViewAction,
	openTicket: (ticketId: string) => OpenTicketAction,
	setReadOnly: (readOnly: boolean) => SetReadOnlyAction,
	resetState: () => ResetStateAction,
	setOverrides: (overrides: OverridesDicts) => SetOverridesAction,
	setUnsavedTicket: (ticket: EditableTicket) => SetUnsavedTicketAction,
	setEditingGroups: (isEditing:boolean) => SetEditingGroupsAction,
}
