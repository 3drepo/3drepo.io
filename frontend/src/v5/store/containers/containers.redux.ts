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
import { cloneDeep } from 'lodash';
import { Constants } from '@/v5/store/common/actions.helper';
import {
	IContainersActionCreators,
	IContainersState,
	SetFilterQueryAction,
	SetFavouriteSuccessAction,
} from './containers.types';

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	setFilterQuery: ['query'],
	addFavourite: ['teamspace', 'projectId', 'containerId'],
	removeFavourite: ['teamspace', 'projectId', 'containerId'],
	setFavouriteSuccess: ['projectId', 'containerId', 'isFavourite'],
	fetchContainers: ['teamspace', 'projectId'],
	fetchContainersSuccess: ['projectId', 'containers'],
	fetchRevisions: ['teamspace', 'projectId', 'containerId'],
	setRevisionsIsPending: ['projectId', 'containerId', 'isPending'],
	fetchRevisionsSuccess: ['projectId', 'containerId', 'revisions'],
	setCurrentProject: ['projectId'],
	setIsPending: ['isPending'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActionCreators>; Creators: IContainersActionCreators };

export const INITIAL_STATE: IContainersState = {
	containers: {},
	filterQuery: '',
	currentProject: '',
	isPending: true,
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
}) => ({
	...state,
	containers: {
		...state.containers,
		[projectId]: containers,
	},
});

export const fetchRevisionsSuccess = (state = INITIAL_STATE, {
	projectId,
	containerId,
	revisions,
}) => {
	const stateClone = cloneDeep(state);
	const currentContainerIndex = stateClone.containers[projectId].findIndex(({ _id }) => _id === containerId);
	stateClone.containers[projectId][currentContainerIndex].revisions = revisions;

	return {
		...state,
		containers: {
			...stateClone.containers,
		},
	};
};

export const setCurrentProject = (state = INITIAL_STATE, { projectId }) => ({
	...state,
	currentProject: projectId,
});

export const setIsPending = (state = INITIAL_STATE, { isPending }) => ({
	...state,
	isPending,
});

export const setRevisionsIsPending = (state = INITIAL_STATE, { projectId, containerId, isPending }) => {
	const stateClone = cloneDeep(state);
	const currentContainerIndex = stateClone.containers[projectId].findIndex(({ _id }) => _id === containerId);
	stateClone.containers[projectId][currentContainerIndex].isPending = isPending;

	return {
		...state,
		containers: {
			...stateClone.containers,
		},
	};
};

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.SET_FILTER_QUERY]: setFilterQuery,
	[ContainersTypes.SET_FAVOURITE_SUCCESS]: setFavourite,
	[ContainersTypes.FETCH_CONTAINERS_SUCCESS]: fetchContainersSuccess,
	[ContainersTypes.FETCH_REVISIONS_SUCCESS]: fetchRevisionsSuccess,
	[ContainersTypes.SET_CURRENT_PROJECT]: setCurrentProject,
	[ContainersTypes.SET_IS_PENDING]: setIsPending,
	[ContainersTypes.SET_REVISIONS_IS_PENDING]: setRevisionsIsPending,
});
