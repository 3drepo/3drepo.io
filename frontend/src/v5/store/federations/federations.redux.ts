/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import {
	FetchFederationsSuccessAction,
	IFederationsActionCreators,
	IFederationsState,
	SetFavouritesFilterQueryAction,
	SetFilterQueryAction,
} from '@/v5/store/federations/federations.types';
import { createActions, createReducer } from 'reduxsauce';
import { Constants } from '../common/actions.helper';

export const { Types: FederationsTypes, Creators: FederationsActions } = createActions({
	setAllFilterQuery: ['query'],
	setFavouritesFilterQuery: ['query'],
	fetchFederations: ['teamspace', 'projectId'],
	fetchFederationsSuccess: ['projectId', 'federations'],
	setIsListPending: ['isPending'],
	setAreStatsPending: ['isPending'],
}, { prefix: 'FEDERATIONS/' }) as { Types: Constants<IFederationsActionCreators>; Creators: IFederationsActionCreators };

export const INITIAL_STATE: IFederationsState = {
	federations: {},
	favouritesFilterQuery: '',
	allFilterQuery: '',
	isListPending: false,
	areStatsPending: false,
};

export const setAllFilterQuery = (state = INITIAL_STATE, { query }: SetFilterQueryAction) => (
	{ ...state, allFilterQuery: query }
);

export const setFavouritesFilterQuery = (state = INITIAL_STATE, { query }: SetFavouritesFilterQueryAction) => (
	{ ...state, favouritesFilterQuery: query }
);

export const fetchFederationsSuccess = (state = INITIAL_STATE, {
	projectId,
	federations,
}: FetchFederationsSuccessAction) => ({
	...state,
	federations: {
		...state.federations,
		[projectId]: federations,
	},
});

export const reducer = createReducer<IFederationsState>(INITIAL_STATE, {
	[FederationsTypes.SET_ALL_FILTER_QUERY]: setAllFilterQuery,
	[FederationsTypes.SET_FAVOURITES_FILTER_QUERY]: setFavouritesFilterQuery,
	[FederationsTypes.FETCH_FEDERATIONS_SUCCESS]: fetchFederationsSuccess,
});
