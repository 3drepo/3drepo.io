/**
 *  Copyright (C) 2023 3D Repo Ltd
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

export const { Types: ViewerTypes, Creators: ViewerActions } = createActions({
	fetchData: ['teamspace', 'containerOrFederation', 'project', 'revision'],
	setFetching: ['isFetching'],
}, { prefix: 'VIEWER2/' }) as { Types: Constants<ViewerActionCreators>; Creators: ViewerActionCreators };

export const INITIAL_STATE: ViewerState = {
	isFetching: false,
};

export const setFetching = (state: ViewerState, { isFetching }: SetFetchingAction) => {
	state.isFetching = isFetching;
};

export const viewerReducer = createReducer(INITIAL_STATE, produceAll({
	[ViewerTypes.SET_FETCHING]: setFetching,
}));

export interface ViewerState {
	isFetching: boolean;
}

export type FetchDataAction = Action<'FETCH_DATA'> & { teamspace: string, containerOrFederation: string, project: string, revision:string };
export type SetFetchingAction = Action<'SET_FETCHING'> & { isFetching };

export interface ViewerActionCreators {
	fetchData: (teamspace:string, containerOrFederation:string, project:string, revision:string) => FetchDataAction;
	setFetching: (isFetching: boolean) => SetFetchingAction;
}
