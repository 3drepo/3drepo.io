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

import { createActions, createReducer } from 'reduxsauce';
import { times } from 'lodash';
import { Constants } from '@/v5/store/common/actions.helper';
import { containerMockFactory } from './containers.fixtures';
import {
	IContainersActionCreators,
	IContainersState,
	ContainerStatuses,
	SetFilterQueryAction,
	SetFavouritesFilterQueryAction,
	SetFavouriteSuccessAction,
} from './containers.types';

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	setAllFilterQuery: ['query'],
	setFavouritesFilterQuery: ['query'],
	addFavourite: ['teamspace', 'projectId', 'containerId'],
	removeFavourite: ['teamspace', 'projectId', 'containerId'],
	setFavouriteSuccess: ['containerId', 'isFavourite'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActionCreators>; Creators: IContainersActionCreators };

export const INITIAL_STATE: IContainersState = {
	containers: [
		containerMockFactory({ status: ContainerStatuses.PROCESSING }),
		containerMockFactory({ status: ContainerStatuses.QUEUED }),
		containerMockFactory({ status: ContainerStatuses.FAILED }),
		...times(10, () => containerMockFactory()),
	],
	favouritesFilterQuery: '',
	allFilterQuery: '',
};

export const setAllFilterQuery = (state = INITIAL_STATE, { query }: SetFilterQueryAction) => (
	{ ...state, allFilterQuery: query }
);

export const setFavouritesFilterQuery = (state = INITIAL_STATE, { query }: SetFavouritesFilterQueryAction) => (
	{ ...state, favouritesFilterQuery: query }
);

export const setFavourite = (state = INITIAL_STATE, {
	containerId,
	isFavourite,
}: SetFavouriteSuccessAction) => ({
	...state,
	containers: state.containers.map((container) => ({
		...container,
		isFavourite: container._id === containerId ? isFavourite : container.isFavourite,
	})),
});

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.SET_ALL_FILTER_QUERY]: setAllFilterQuery,
	[ContainersTypes.SET_FAVOURITES_FILTER_QUERY]: setFavouritesFilterQuery,
	[ContainersTypes.SET_FAVOURITE_SUCCESS]: setFavourite,
});
