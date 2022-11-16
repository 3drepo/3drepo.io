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
import { ITicket } from '../tickets.types';

export const { Types: TicketsCardTypes, Creators: TicketsCardActions } = createActions({
	selectTicket: ['ticketId'],
	updateEditingTicket: ['ticket'],
	setView: ['view'],
}, { prefix: 'TICKETSCARD/' }) as { Types: Constants<ITicketsCardActionCreators>; Creators: ITicketsCardActionCreators };

export interface ITicketsCardState {
	selectedTicketId: string | null,
	editingTicket: ITicket | null,
	view: TicketsCardViews
}

export const INITIAL_STATE: ITicketsCardState = {
	selectedTicketId: null,
	editingTicket: null,
	view: TicketsCardViews.List,
};

export const selectTicket = (state: ITicketsCardState, { ticketId }: SelectTicketAction) => {
	state.selectedTicketId = ticketId;
};

export const updateEditingTicket = (state: ITicketsCardState, { ticket }: UpdateEditingTicketAction) => {
	state.editingTicket = ticket;
};

export const setView = (state: ITicketsCardState, { view }: SetViewAction) => {
	state.view = view;
};

export const ticketsCardReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsCardTypes.SELECT_TICKET]: selectTicket,
	[TicketsCardTypes.UPDATE_EDITING_TICKET]: updateEditingTicket,
	[TicketsCardTypes.SET_VIEW]: setView,
}));

export type SelectTicketAction = Action<'SELECT_TICKET'> & { ticketId: string };
export type SetViewAction = Action<'SET_VIEW'> & { view: TicketsCardViews };
export type UpdateEditingTicketAction = Action<'UPDATE_EDITING_TICKET'> & { ticket: ITicket | null };

export interface ITicketsCardActionCreators {
	selectTicket: (ticketId: string) => SelectTicketAction,
	updateEditingTicket: (ticket: ITicket | null) => UpdateEditingTicketAction,
	setView : (view: TicketsCardViews) => SelectTicketAction,
}
