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
import { Constants } from '@/v5/helpers/actions.helper';
import { prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { FetchContainerStatsResponse } from '@/v5/services/api/containers';
import { Action } from 'redux';
import { IContainer, NewContainer, ProjectAndContainerId, ProjectId, TeamspaceAndProjectId, TeamspaceProjectAndContainerId } from './containers.types';

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
	deleteContainer: ['teamspace', 'projectId', 'containerId'],
	deleteContainerSuccess: ['projectId', 'containerId'],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActionCreators>; Creators: IContainersActionCreators };

export interface IContainersState {
	containersByProject: Record<string, IContainer[]>;
}

export const INITIAL_STATE: IContainersState = {
	containersByProject: {},
};

export const setFavourite = (state = INITIAL_STATE, {
	projectId,
	containerId,
	isFavourite,
}: SetFavouriteSuccessAction):IContainersState => ({
	...state,
	containersByProject: {
		...state.containersByProject,
		[projectId]: state.containersByProject[projectId].map((container) => ({
			...container,
			isFavourite: container._id === containerId ? isFavourite : container.isFavourite,
		})),
	},
});

export const fetchContainersSuccess = (state = INITIAL_STATE, {
	projectId,
	containers,
}: FetchContainersSuccessAction): IContainersState => ({
	...state,
	containersByProject: {
		...state.containersByProject,
		[projectId]: containers,
	},
});

export const fetchStatsSuccess = (state = INITIAL_STATE, {
	projectId,
	containerId,
	containerStats,
}: FetchContainerStatsSuccessAction): IContainersState => ({
	...state,
	containersByProject: {
		...state.containersByProject,
		[projectId]: state.containersByProject[projectId].map((container) => {
			if (containerId !== container._id) return container;
			return prepareSingleContainerData(container, containerStats);
		}),
	},
});

export const createContainerSuccess = (state = INITIAL_STATE, {
	projectId,
	container,
}: CreateContainerSuccessAction): IContainersState => ({
	...state,
	containersByProject: {
		...state.containersByProject,
		[projectId]: [
			...state.containersByProject[projectId],
			{
				...container,
				revisionsCount: 0,
			},
		],
	},
});

export const deleteContainerSuccess = (state = INITIAL_STATE, {
	projectId,
	containerId,
}: DeleteContainerSuccessAction): IContainersState => ({
	...state,
	containersByProject: {
		...state.containersByProject,
		[projectId]: state.containersByProject[projectId].filter((container) => containerId !== container._id),
	},
});

export const reducer = createReducer<IContainersState>(INITIAL_STATE, {
	[ContainersTypes.FETCH_CONTAINERS_SUCCESS]: fetchContainersSuccess,
	[ContainersTypes.SET_FAVOURITE_SUCCESS]: setFavourite,
	[ContainersTypes.FETCH_CONTAINER_STATS_SUCCESS]: fetchStatsSuccess,
	[ContainersTypes.CREATE_CONTAINER_SUCCESS]: createContainerSuccess,
	[ContainersTypes.DELETE_CONTAINER_SUCCESS]: deleteContainerSuccess,
}) as (state: IContainersState, action:any) => IContainersState;

export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndContainerId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndContainerId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndContainerId & { isFavourite: boolean};
export type FetchContainersAction = Action<'FETCH_CONTAINERS'> & TeamspaceAndProjectId;
export type FetchContainersSuccessAction = Action<'FETCH_CONTAINERS_SUCCESS'> & ProjectId & { containers: IContainer[] };
export type FetchContainerStatsAction = Action<'FETCH_CONTAINER_STATS'> & TeamspaceProjectAndContainerId;
export type FetchContainerStatsSuccessAction = Action<'FETCH_CONTAINER_STATS_SUCCESS'> & ProjectAndContainerId & { containerStats: FetchContainerStatsResponse };
export type CreateContainerAction = Action<'CREATE_CONTAINER'> & TeamspaceAndProjectId & {newContainer: NewContainer};
export type CreateContainerSuccessAction = Action<'CREATE_CONTAINER_SUCCESS'> & ProjectId & { container: IContainer };
export type DeleteContainerAction = Action<'DELETE'> & TeamspaceProjectAndContainerId;
export type DeleteContainerSuccessAction = Action<'DELETE_SUCCESS'> & ProjectAndContainerId;

export interface IContainersActionCreators {
	addFavourite: (teamspace: string, projectId: string, containerId: string) => AddFavouriteAction;
	removeFavourite: (teamspace: string, projectId: string, containerId: string) => RemoveFavouriteAction;
	setFavouriteSuccess: (projectId: string, containerId: string, isFavourite: boolean) => SetFavouriteSuccessAction;
	fetchContainers: (teamspace: string, projectId: string) => FetchContainersAction;
	fetchContainersSuccess: (projectId: string, containers: IContainer[]) => FetchContainersSuccessAction;
	fetchContainerStats: (teamspace: string, projectId: string, containerId: string) => FetchContainerStatsAction;
	fetchContainerStatsSuccess: (
		projectId: string,
		containerId: string,
		containerStats: FetchContainerStatsResponse
	) => FetchContainerStatsSuccessAction;
	createContainer: (
		teamspace: string,
		projectId: string,
		newContainer: NewContainer,
	) => CreateContainerAction;
	createContainerSuccess: (
		projectId: string,
		container: NewContainer & { _id: string},
	) => CreateContainerSuccessAction;
	deleteContainer: (teamspace: string, projectId: string, containerId: string) => DeleteContainerAction;
	deleteContainerSuccess: (projectId: string, containerId: string) => DeleteContainerSuccessAction;
}
