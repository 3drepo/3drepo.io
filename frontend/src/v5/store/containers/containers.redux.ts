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
import { prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import {
	IContainersActionCreators,
	IContainersState,
	SetFilterQueryAction,
	SetFavouriteSuccessAction,
	FetchContainersSuccessAction,
	SetIsListPendingAction,
	FetchContainerStatsSuccessAction,
} from './containers.types';

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	setFilterQuery: ['query'],
	addFavourite: ['teamspace', 'projectId', 'containerId'],
	removeFavourite: ['teamspace', 'projectId', 'containerId'],
	fetchContainers: ['teamspace', 'projectId'],
	fetchContainersSuccess: ['projectId', 'containers'],
	fetchContainerStats: ['teamspace', 'projectId', 'containerId'],
	fetchContainerStatsSuccess: ['projectId', 'containerId', 'containerStats'],
	setIsListPending: ['isPending'],
	setFavouriteSuccess: ['projectId', 'containerId', 'isFavourite'],
	fetchRevisions: ['teamspace', 'projectId', 'containerId'],
	setRevisionVoidStatus: ['teamspace', 'projectId', 'containerId', 'revisionId', 'isVoid'],
	setRevisionVoidStatusSuccess: ['projectId', 'containerId', 'revisionId', 'isVoid'],
	setRevisionsIsPending: ['projectId', 'containerId', 'isPending'],
	fetchRevisionsSuccess: ['projectId', 'containerId', 'revisions'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActionCreators>; Creators: IContainersActionCreators };

export const INITIAL_STATE: IContainersState = {
	containers: {},
	filterQuery: '',
	isListPending: true,
	areStatsPending: true,
};

export const setFilterQuery = (state = INITIAL_STATE, { query }: SetFilterQueryAction) => (
	{ ...state, filterQuery: query }
);

export const setFavourite = (state = INITIAL_STATE, {
	projectId,
	containerId,
	isFavourite,
}: SetFavouriteSuccessAction) => ({
	...state,
	containers: {
		...state.containers,
		[projectId]: state.containers[projectId].map((container) => ({
			...container,
			isFavourite: container._id === containerId ? isFavourite : container.isFavourite,
		})),
	},
});

export const fetchContainersSuccess = (state = INITIAL_STATE, {
	projectId,
	containers,
}: FetchContainersSuccessAction) => ({
	...state,
	containers: {
		...state.containers,
		[projectId]: containers,
	},
});

export const fetchStatsSuccess = (state = INITIAL_STATE, {
	projectId,
	containerId,
	containerStats,
}: FetchContainerStatsSuccessAction) => ({
	...state,
	containers: {
		...state.containers,
		[projectId]: state.containers[projectId].map((container) => {
			if (containerId !== container._id) return container;
			return prepareSingleContainerData(container, containerStats);
		}),
	},
});

export const setIsListPending = (state = INITIAL_STATE, { isPending }: SetIsListPendingAction) => ({
	...state,
	isListPending: isPending,
});

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.SET_FILTER_QUERY]: setFilterQuery,
	[ContainersTypes.FETCH_CONTAINERS_SUCCESS]: fetchContainersSuccess,
	[ContainersTypes.SET_IS_LIST_PENDING]: setIsListPending,
	[ContainersTypes.SET_FAVOURITE_SUCCESS]: setFavourite,
	[ContainersTypes.FETCH_CONTAINER_STATS_SUCCESS]: fetchStatsSuccess,
});
