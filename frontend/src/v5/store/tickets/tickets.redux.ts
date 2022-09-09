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
import { ITicket } from './tickets.types';

export const { Types: TicketsTypes, Creators: TicketsActions } = createActions({
	fetchModelTickets: ['teamspace', 'projectId', 'modelId', 'isFederation'],
	fetchModelTicketsSuccess: ['modelId', 'tickets'],
}, { prefix: 'TICKETS/' }) as { Types: Constants<ITicketsActionCreators>; Creators: ITicketsActionCreators };

export const INITIAL_STATE: ITicketsState = {
	ticketsByModelId: {},
};

export const fetchModelTicketsSuccess = (state, { modelId, tickets }) => {
	state.ticketsByModelId[modelId] = tickets;
};

export const ticketsReducer = createReducer(INITIAL_STATE, produceAll({
	[TicketsTypes.FETCH_MODEL_TICKETS_SUCCESS]: fetchModelTicketsSuccess,
}));

export interface ITicketsState {
	ticketsByModelId: Record<string, ITicket[]>;
}

export type FetchModelTicketsAction = Action<'FETCH_MODEL_TICKETS'> & TeamspaceAndProjectId & { modelId: string, isFederation: boolean };
export type FetchModelTicketsSuccessAction = Action<'FETCH_MODEL_TICKETS_SUCCESS'> & { modelId: string, tickets: ITicket[] };


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
}
