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
import { Constants } from '@/v5/store/common/actions.helper';

export interface IContainer {
	_id: string;
	title: string;
	latestRevision: number;
	revisionsCount: number;
	category: string;
	code: string;
	date: Date;
}

export interface IContainersActions {
	fetch: (teamspace: string) => any;
	fetchSuccess: () => any;
	setPending: (isPending: boolean) => any;
	setFilterQuery: (query: string) => any;
}

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	fetch: ['teamspace'],
	fetchSuccess: ['containers'],
	setPending: ['isPending'],
	setFilterQuery: ['query'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActions>; Creators: IContainersActions };

export interface IContainersState {
	containers: IContainer[];
	isPending: boolean;
	filterQuery: string;
}

const mockContainers = [];
for (let i = 0; i < 10; i++) {
	const mockContainer: IContainer = {
		_id: String(i),
		latestRevision: 123,
		title: String(i),
		revisionsCount: 7878,
		category: 'my awesome category',
		code: 'XX123',
		date: new Date(),
	};

	mockContainers.push(mockContainer);
}
mockContainers.push({
	_id: '123123',
	latestRevision: 123,
	title: 'Some container value',
	revisionsCount: 7878,
	category: 'my awesome category',
	code: 'XX123',
	date: new Date(),
});

export const INITIAL_STATE: IContainersState = {
	containers: mockContainers,
	filterQuery: '',
	isPending: true,
};

export const setPendingStatus = (state = INITIAL_STATE, { isPending }) => ({ ...state, isPending });

export const fetchSuccess = (state = INITIAL_STATE, { containers }) => ({ ...state, containers });

export const setFilterQuery = (state = INITIAL_STATE, { query }) => ({ ...state, filterQuery: query });

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.FETCH_SUCCESS]: fetchSuccess,
	[ContainersTypes.SET_PENDING]: setPendingStatus,
	[ContainersTypes.SET_FILTER_QUERY]: setFilterQuery,
});
