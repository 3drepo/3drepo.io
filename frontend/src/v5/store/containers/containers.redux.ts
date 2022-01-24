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
	SetFavouriteSuccessAction,
	FetchContainersSuccessAction,
	SetIsListPendingAction,
	FetchContainerStatsSuccessAction,
	CreateContainerSuccessAction,
	DeleteContainerSuccessAction,
} from './containers.types';

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	addFavourite: ['teamspace', 'projectId', 'containerId'],
	removeFavourite: ['teamspace', 'projectId', 'containerId'],
	setFavouriteSuccess: ['projectId', 'containerId', 'isFavourite'],
	fetchContainers: ['teamspace', 'projectId'],
	fetchContainersSuccess: ['projectId', 'containers'],
	fetchContainerStats: ['teamspace', 'projectId', 'containerId'],
	fetchContainerStatsSuccess: ['projectId', 'containerId', 'containerStats'],
	createContainer: ['teamspace', 'projectId', 'newContainer'],
	createContainerSuccess: ['projectId', 'container'],
	fetchRevisions: ['teamspace', 'projectId', 'containerId'],
	fetchRevisionsSuccess: ['projectId', 'containerId', 'revisions'],
	setRevisionVoidStatus: ['teamspace', 'projectId', 'containerId', 'revisionId', 'isVoid'],
	setRevisionVoidStatusSuccess: ['projectId', 'containerId', 'revisionId', 'isVoid'],
	setRevisionsIsPending: ['projectId', 'containerId', 'isPending'],
	setIsListPending: ['isPending'],
	deleteContainer: ['teamspace', 'projectId', 'containerId'],
	deleteContainerSuccess: ['projectId', 'containerId'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActionCreators>; Creators: IContainersActionCreators };

export const INITIAL_STATE: IContainersState = {
	containers: {},
	isListPending: true,
};

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

export const createContainerSuccess = (state = INITIAL_STATE, {
	projectId,
	container,
}: CreateContainerSuccessAction) => ({
	...state,
	containers: {
		...state.containers,
		[projectId]: [
			...state.containers[projectId],
			{
				...container,
				revisionsCount: 0,
				units: container.unit,
			},
		],
	},
});

export const deleteContainerSuccess = (state = INITIAL_STATE, {
	projectId,
	containerId,
}: DeleteContainerSuccessAction) => ({
	...state,
	containers: {
		...state.containers,
		[projectId]: state.containers[projectId].filter((container) => containerId !== container._id),
	},
});

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.FETCH_CONTAINERS_SUCCESS]: fetchContainersSuccess,
	[ContainersTypes.SET_IS_LIST_PENDING]: setIsListPending,
	[ContainersTypes.SET_FAVOURITE_SUCCESS]: setFavourite,
	[ContainersTypes.FETCH_CONTAINER_STATS_SUCCESS]: fetchStatsSuccess,
	[ContainersTypes.CREATE_CONTAINER_SUCCESS]: createContainerSuccess,
	[ContainersTypes.DELETE_CONTAINER_SUCCESS]: deleteContainerSuccess,
});
