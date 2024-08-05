/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { Constants } from '@/v5/helpers/actions.helper';

export const { Types: DrawingsCardTypes, Creators: DrawingsCardActions } = createActions({
	setQueries: ['queries'],
}, { prefix: 'DRAWINGS_CARD/' }) as { Types: Constants<IDrawingsCardActionCreators>; Creators: IDrawingsCardActionCreators };

export interface IDrawingsCardState {
	queries: string[],
}

export const INITIAL_STATE: IDrawingsCardState = {
	queries: [],
};

export const setQueries = (state: IDrawingsCardState, { queries }: SetQueriesAction) => {
	state.queries = queries;
};

export const drawingsCardReducer = createReducer(INITIAL_STATE, produceAll({
	[DrawingsCardTypes.SET_QUERIES]: setQueries,
}));

export type SetQueriesAction = Action<'SET_QUERIES'> & { queries: string[] };

export interface IDrawingsCardActionCreators {
	setQueries: (queries: string[]) => SetQueriesAction,
}
