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
import { cloneDeep, times } from 'lodash';
import { Constants } from '@/v5/store/common/actions.helper';
import { containerMockFactory } from './containers.fixtures';
import { IContainersActionCreators, IContainersActions, IContainersState } from './containers.types';

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	setFilterQuery: ['query'],
	addFavourite: ['teamspace', 'projectId', 'containerId'],
	removeFavourite: ['teamspace', 'projectId', 'containerId'],
	toggleFavouriteSuccess: ['containerId'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActionCreators>; Creators: IContainersActionCreators };

export const INITIAL_STATE: IContainersState = {
	containers: times(10, () => containerMockFactory()),
	filterQuery: '',
};

export const setFilterQuery = (state = INITIAL_STATE, { query }: IContainersActions['setFilterQuery']) => (
	{ ...state, filterQuery: query }
);

export const toggleFavourite = (state = INITIAL_STATE, { containerId }: IContainersActions['addFavourite']) => {
	const containers = cloneDeep(state.containers);
	const containerIndex = containers.findIndex(({ _id }) => _id === containerId);

	containers[containerIndex].isFavourite = !containers[containerIndex].isFavourite;

	return {
		...state,
		containers,
	};
};

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.SET_FILTER_QUERY]: setFilterQuery,
	[ContainersTypes.TOGGLE_FAVOURITE_SUCCESS]: toggleFavourite,
});
