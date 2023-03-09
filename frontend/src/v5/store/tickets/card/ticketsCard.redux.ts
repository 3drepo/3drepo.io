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

export const { Types: TicketsCardTypes, Creators: TicketsCardActions } = createActions({
	setSelectedTicket: ['ticketId'],
	setSelectedTemplate: ['templateId'],
	setCardView: ['view'],
	resetState: [],
}, { prefix: 'TICKETS_CARD/' }) as { Types: Constants<ITicketsCardActionCreators>; Creators: ITicketsCardActionCreators };

export interface ITicketsCardState {
	selectedTicketId: string | null,
	selectedTemplateId: string | null,
	view: TicketsCardViews
}

export const INITIAL_STATE: ITicketsCardState = {
	selectedTicketId: null,
	selectedTemplateId: null,
	view: TicketsCardViews.List,
};

export const setSelectedTicket = (state: ITicketsCardState, { ticketId }: SetSelectedTicketAction) => {
	state.selectedTicketId = ticketId;
};

export const setSelectedTemplate = (state: ITicketsCardState, { templateId }: SetSelectedTemplateAction) => {
	state.selectedTemplateId = templateId;
};

export const setCardView = (state: ITicketsCardState, { view }: SetCardViewAction) => {
	state.view = view;
};

export const resetState = () => INITIAL_STATE;

export const ticketsCardReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsCardTypes.SET_SELECTED_TICKET]: setSelectedTicket,
	[TicketsCardTypes.SET_SELECTED_TEMPLATE]: setSelectedTemplate,
	[TicketsCardTypes.SET_CARD_VIEW]: setCardView,
	[TicketsCardTypes.RESET_STATE]: resetState,
}));

export type SetSelectedTicketAction = Action<'SET_SELECTED_TICKET'> & { ticketId: string };
export type SetSelectedTemplateAction = Action<'SET_SELECTED_TEMPLATE'> & { templateId: string };
export type SetCardViewAction = Action<'SET_CARD_VIEW'> & { view: TicketsCardViews };
export type ResetStateAction = Action<'RESET_STATE'>;

export interface ITicketsCardActionCreators {
	setSelectedTicket: (ticketId: string) => SetSelectedTicketAction,
	setSelectedTemplate: (templateId: string) => SetSelectedTicketAction,
	setCardView: (view: TicketsCardViews) => SetSelectedTicketAction,
	resetState: () => ResetStateAction,
}
