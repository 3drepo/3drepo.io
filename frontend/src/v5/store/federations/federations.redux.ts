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
	IFederationsActionCreators,
	IFederationsActions,
	IFederationsState,
} from '@/v5/store/federations/federations.types';
import { createActions, createReducer } from 'reduxsauce';
import { times } from 'lodash';
import { federationMockFactory } from '@/v5/store/federations/federations.fixtures';
import { Constants } from '../common/actions.helper';

export const { Types: FederationsTypes, Creators: FederationsActions } = createActions({
	setAllFilterQuery: ['query'],
	setFavouritesFilterQuery: ['query'],
}, { prefix: 'FEDERATIONS/' }) as { Types: Constants<IFederationsActionCreators>; Creators: IFederationsActionCreators };

export const INITIAL_STATE: IFederationsState = {
	federations: {
		'5cee4c80-26ce-da7d-f03a-7a4d00000000': times(10, () => federationMockFactory()),
	},
	favouritesFilterQuery: '',
	allFilterQuery: '',
	isListPending: false,
	areStatsPending: false,
};

export const setAllFilterQuery = (state = INITIAL_STATE, { query }: IFederationsActions['setAllFilterQuery']) => (
	{ ...state, allFilterQuery: query }
);

export const setFavouritesFilterQuery = (state = INITIAL_STATE, { query }: IFederationsActions['setFavouritesFilterQuery']) => (
	{ ...state, favouritesFilterQuery: query }
);

export const reducer = createReducer<IFederationsState>(INITIAL_STATE, {
	[FederationsTypes.SET_ALL_FILTER_QUERY]: setAllFilterQuery,
	[FederationsTypes.SET_FAVOURITES_FILTER_QUERY]: setFavouritesFilterQuery,
});
