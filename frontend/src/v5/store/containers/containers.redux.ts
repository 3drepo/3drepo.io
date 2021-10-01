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
import { ContainerStatuses, IContainersState } from './containers.types';

export interface IContainersActions {
	setFilterQuery: (query: string) => any;
}

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	setFilterQuery: ['query'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActions>; Creators: IContainersActions };

export const INITIAL_STATE: IContainersState = {
	containers: [
		containerMockFactory({ status: ContainerStatuses.PROCESSING }),
		containerMockFactory({ status: ContainerStatuses.QUEUED }),
		...times(10, () => containerMockFactory()),
	],
	filterQuery: '',
};

export const setFilterQuery = (state = INITIAL_STATE, { query }) => ({ ...state, filterQuery: query });

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.SET_FILTER_QUERY]: setFilterQuery,
});
