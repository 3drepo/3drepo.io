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
import { EditableTicket, OverridesDicts, TicketsCardFilters } from '../tickets.types';
import { TeamspaceProjectAndModel } from '../../store.types';
import { CardFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { get, isEmpty, set, unset } from 'lodash';

export const { Types: TicketsCardTypes, Creators: TicketsCardActions } = createActions({
	setSelectedTicket: ['ticketId'],
	setSelectedTemplate: ['templateId'],
	setSelectedTicketPin: ['pinId'],
	setFilters: ['filters'],
	upsertFilter: ['filter'],
	deleteFilter: ['filter'],
	resetFilters: [],
	setPinToDrop: ['pinToDrop'],
	fetchTicketsList: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	setCardView: ['view', 'props'],
	openTicket: ['ticketId'],
	setReadOnly: ['readOnly'],
	resetState: [],
	setOverrides: ['overrides'],
	setUnsavedTicket: ['ticket'],
	setTransformations: ['transformations'],
	setEditingGroups: ['isEditing'],
	setIsShowingPins: ['isShowing'],
}, { prefix: 'TICKETS_CARD/' }) as { Types: Constants<ITicketsCardActionCreators>; Creators: ITicketsCardActionCreators };

export interface ITicketsCardState {
	selectedTicketId: string | null,
	selectedTemplateId: string | null,
	selectedTicketPinId: string | null,
	pinToDrop: string | null,
	filters: TicketsCardFilters,
	view: TicketsCardViews,
	viewProps: any,
	readOnly: boolean,
	overrides: OverridesDicts | null,
	unsavedTicket: EditableTicket | null,
	transformations: any,
	isEditingGroups: boolean,
	isShowingPins: boolean,
}

export const INITIAL_STATE: ITicketsCardState = {
	selectedTicketId: null,
	selectedTemplateId: null,
	selectedTicketPinId: null,
	pinToDrop: null,
	filters: {},
	view: TicketsCardViews.List,
	viewProps: null,
	overrides: null,
	transformations: null,
	readOnly: false,
	unsavedTicket: null,
	isEditingGroups: false,
	isShowingPins: true,
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

export const setPinToDrop = (state: ITicketsCardState, { pinToDrop }: SetPinToDropAction) => {
	state.pinToDrop = pinToDrop;
};

export const setFilters = (state: ITicketsCardState, { filters }: SetFiltersAction) => {
	state.filters = filters;
};

const getFilterPath = ({ module, property, type }) => [module, property, type];
export const upsertFilter = (state: ITicketsCardState, { filter }: UpsertFilterAction) => {
	const path = getFilterPath(filter);
	set(state.filters, path, filter.filter);
};

export const deleteFilter = (state: ITicketsCardState, { filter }: DeleteFilterAction) => {
	const path = getFilterPath(filter);
	// delete filter and recursiverly delete parent entry if empty
	do {
		unset(state.filters, path);
		path.pop();
	} while (path.length && isEmpty(get(state.filters, path)));
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

export const resetState = ({ filters, readOnly, isShowingPins }: ITicketsCardState) => ({
	...INITIAL_STATE,
	filters,
	readOnly,
	isShowingPins,
});

export const setEditingGroups = (state: ITicketsCardState, { isEditing }: SetEditingGroupsAction) => {
	state.isEditingGroups = isEditing;
};

export const setIsShowingPins = (state: ITicketsCardState, { isShowing }: SetIsShowingPinsAction) => {
	state.isShowingPins = isShowing;
};

export const ticketsCardReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsCardTypes.SET_SELECTED_TICKET]: setSelectedTicket,
	[TicketsCardTypes.SET_SELECTED_TEMPLATE]: setSelectedTemplate,
	[TicketsCardTypes.SET_SELECTED_TICKET_PIN]: setSelectedTicketPin,
	[TicketsCardTypes.SET_PIN_TO_DROP]: setPinToDrop,
	[TicketsCardTypes.SET_FILTERS]: setFilters,
	[TicketsCardTypes.UPSERT_FILTER]: upsertFilter,
	[TicketsCardTypes.DELETE_FILTER]: deleteFilter,
	[TicketsCardTypes.RESET_FILTERS]: resetFilters,
	[TicketsCardTypes.SET_CARD_VIEW]: setCardView,
	[TicketsCardTypes.SET_READ_ONLY]: setReadOnly,
	[TicketsCardTypes.RESET_STATE]: resetState,
	[TicketsCardTypes.SET_OVERRIDES]: setOverrides,
	[TicketsCardTypes.SET_UNSAVED_TICKET]: setUnsavedTicket,
	[TicketsCardTypes.SET_EDITING_GROUPS]: setEditingGroups,
	[TicketsCardTypes.SET_IS_SHOWING_PINS]: setIsShowingPins,
}));

export type SetSelectedTicketAction = Action<'SET_SELECTED_TICKET'> & { ticketId: string };
export type SetSelectedTemplateAction = Action<'SET_SELECTED_TEMPLATE'> & { templateId: string };
export type SetSelectedTicketPinAction = Action<'SET_SELECTED_TICKET_PIN'> & { pinId: string };
export type SetPinToDropAction = Action<'SET_PIN_TO_DROP'> & { pinToDrop: string };
export type SetFiltersAction = Action<'SET_FILTERS'> & { filters: TicketsCardFilters };
export type UpsertFilterAction = Action<'UPSERT_FILTER'> & { filter: CardFilter };
export type DeleteFilterAction = Action<'DELETE_FILTER'> & { filter: Omit<CardFilter, 'filter'> };
export type ResetFiltersAction = Action<'RESET_FILTERS'>;
export type FetchTicketsListAction = Action<'FETCH_TICKETS_LIST'> & TeamspaceProjectAndModel & { isFederation: boolean };
export type SetCardViewAction = Action<'SET_CARD_VIEW'> & { view: TicketsCardViews, props?:any };
export type OpenTicketAction = Action<'OPEN_TICKET'> & { ticketId: string };
export type SetReadOnlyAction = Action<'SET_READ_ONLY'> & { readOnly: boolean };
export type ResetStateAction = Action<'RESET_STATE'>;
export type SetOverridesAction = Action<'SET_OVERRIDES'> & { overrides: OverridesDicts | null };
export type SetUnsavedTicketAction = Action<'SET_UNSAVED_TICKET'> & { ticket: EditableTicket };
export type SetEditingGroupsAction = Action<'SET_EDITING_GROUPS'> & { isEditing: boolean } ;
export type SetIsShowingPinsAction = Action<'SET_IS_SHOWING_PINS'> & { isShowing: boolean } ;


export interface ITicketsCardActionCreators {
	setSelectedTicket: (ticketId: string) => SetSelectedTicketAction,
	setSelectedTemplate: (templateId: string) => SetSelectedTemplateAction,
	setSelectedTicketPin: (pinId: string) => SetSelectedTicketPinAction,
	setPinToDrop: (pinToDrop: string) => SetPinToDropAction,
	setFilters: (filters: TicketsCardFilters) => SetFiltersAction,
	upsertFilter: (filter: CardFilter) => UpsertFilterAction,
	deleteFilter: (filter: Omit<CardFilter, 'filter'>) => DeleteFilterAction,
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
	setEditingGroups: (isEditing: boolean) => SetEditingGroupsAction,
	setIsShowingPins: (isShowing: boolean) => SetIsShowingPinsAction,
}
