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
import { OverridesDicts } from '../tickets.types';

export const { Types: TicketsCardTypes, Creators: TicketsCardActions } = createActions({
	setHighlightedTicket: ['ticketId'],
	setSelectedTemplate: ['templateId'],
	setCardView: ['view'],
	setReadOnly: ['readOnly'],
	resetState: [],
	setOverrides: ['overrides'],
}, { prefix: 'TICKETS_CARD/' }) as { Types: Constants<ITicketsCardActionCreators>; Creators: ITicketsCardActionCreators };

export interface ITicketsCardState {
	highlightedTicketId: string | null,
	selectedTemplateId: string | null,
	view: TicketsCardViews,
	readOnly: boolean,
	overrides: OverridesDicts | null,
}

export const INITIAL_STATE: ITicketsCardState = {
	highlightedTicketId: null,
	selectedTemplateId: null,
	view: TicketsCardViews.List,
	overrides: null,
	readOnly: false,
};

export const setHighlightedTicket = (state: ITicketsCardState, { ticketId }: SetHighlightedTicketAction) => {
	state.highlightedTicketId = ticketId;
};

export const setSelectedTemplate = (state: ITicketsCardState, { templateId }: SetSelectedTemplateAction) => {
	state.selectedTemplateId = templateId;
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

export const resetState = () => INITIAL_STATE;

export const ticketsCardReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsCardTypes.SET_HIGHLIGHTED_TICKET]: setHighlightedTicket,
	[TicketsCardTypes.SET_SELECTED_TEMPLATE]: setSelectedTemplate,
	[TicketsCardTypes.SET_CARD_VIEW]: setCardView,
	[TicketsCardTypes.SET_READ_ONLY]: setReadOnly,
	[TicketsCardTypes.RESET_STATE]: resetState,
	[TicketsCardTypes.SET_OVERRIDES]: setOverrides,
}));

export type SetHighlightedTicketAction = Action<'SET_HIGHLIGHTED_TICKET'> & { ticketId: string };
export type SetSelectedTemplateAction = Action<'SET_SELECTED_TEMPLATE'> & { templateId: string };
export type SetCardViewAction = Action<'SET_CARD_VIEW'> & { view: TicketsCardViews };
export type SetReadOnlyAction = Action<'SET_READ_ONLY'> & { readOnly: boolean };
export type ResetStateAction = Action<'RESET_STATE'>;
export type SetOverridesAction = Action<'SET_OVERRIDES'> & { overrides: OverridesDicts | null};

export interface ITicketsCardActionCreators {
	setHighlightedTicket: (ticketId: string) => SetHighlightedTicketAction,
	setSelectedTemplate: (templateId: string) => SetSelectedTemplateAction,
	setCardView: (view: TicketsCardViews) => SetCardViewAction,
	setReadOnly: (readOnly: boolean) => SetReadOnlyAction,
	resetState: () => ResetStateAction,
	setOverrides: (overrides: OverridesDicts) => SetOverridesAction,
}
