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
import { getNullableDate } from '@/v5/helpers/getNullableDate';
import { prepareSingleContainerData } from '@/v5/store/containers/containers.helpers';
import { produceAll } from '@/v5/helpers/reducers.helper';
import { Action } from 'redux';
import { ContainerStats, IContainer, NewContainer, UploadStatus, ContainerSettings } from './containers.types';
import { TeamspaceProjectAndContainerId, ProjectAndContainerId, TeamspaceAndProjectId, ProjectId, SuccessAndErrorCallbacks, View } from '../store.types';
import { IContainerRevision } from './revisions/containerRevisions.types';
import { Role } from '../currentUser/currentUser.types';

export const { Types: ContainersTypes, Creators: ContainersActions } = createActions({
	addFavourite: ['teamspace', 'projectId', 'containerId'],
	removeFavourite: ['teamspace', 'projectId', 'containerId'],
	setFavouriteSuccess: ['projectId', 'containerId', 'isFavourite'],
	fetchContainers: ['teamspace', 'projectId'],
	fetchContainersSuccess: ['projectId', 'containers'],
	fetchContainerStats: ['teamspace', 'projectId', 'containerId'],
	fetchContainerStatsSuccess: ['projectId', 'containerId', 'stats'],
	fetchContainerViews: ['teamspace', 'projectId', 'containerId'],
	fetchContainerViewsSuccess: ['projectId', 'containerId', 'views'],
	fetchContainerSettings: ['teamspace', 'projectId', 'containerId'],
	fetchContainerSettingsSuccess: ['projectId', 'containerId', 'settings'],
	fetchContainerUsers: ['teamspace', 'projectId', 'containerId'],
	fetchContainerUsersSuccess: ['projectId', 'containerId', 'users'],
	fetchContainerJobs: ['teamspace', 'projectId', 'containerId'],
	fetchContainerJobsSuccess: ['projectId', 'containerId', 'jobs'],
	updateContainerSuccess: ['projectId', 'containerId', 'container'],
	updateContainerSettings: ['teamspace', 'projectId', 'containerId', 'settings', 'onSuccess', 'onError'],
	updateContainerSettingsSuccess: ['projectId', 'containerId', 'settings'],
	createContainer: ['teamspace', 'projectId', 'newContainer', 'onSuccess', 'onError'],
	createContainerSuccess: ['projectId', 'container'],
	deleteContainer: ['teamspace', 'projectId', 'containerId', 'onSuccess', 'onError'],
	deleteContainerSuccess: ['projectId', 'containerId'],
	setContainerStatus: ['projectId', 'containerId', 'status'],
	containerProcessingSuccess: ['projectId', 'containerId', 'revision'],
	resetContainerStatsQueue: [],
}, { prefix: 'CONTAINERS/' }) as { Types: Constants<IContainersActionCreators>; Creators: IContainersActionCreators };

export const INITIAL_STATE: IContainersState = {
	containersByProject: {},
};

const getContainerFromState = (state, projectId, containerId) => (
	state.containersByProject[projectId].find((container) => container._id === containerId)
);

export const setFavouriteSuccess = (state, {
	projectId,
	containerId,
	isFavourite,
}) => {
	getContainerFromState(state, projectId, containerId).isFavourite = isFavourite;
};

export const fetchContainersSuccess = (state, {
	projectId,
	containers,
}) => {
	state.containersByProject[projectId] = containers;
};

export const fetchContainerStatsSuccess = (state, {
	projectId,
	containerId,
	stats,
}) => {
	const container = getContainerFromState(state, projectId, containerId);
	Object.assign(container, prepareSingleContainerData(container, stats));
};

export const fetchContainerViewsSuccess = (state, {
	projectId,
	containerId,
	views,
}) => {
	getContainerFromState(state, projectId, containerId).views = views;
};

export const fetchContainerSettingsSuccess = (state, {
	projectId,
	containerId,
	settings,
}) => {
	const container = getContainerFromState(state, projectId, containerId);
	Object.assign(container, settings);
};

export const updateContainerSuccess = (state, {
	projectId,
	containerId,
	container,
}) => {
	Object.assign(getContainerFromState(state, projectId, containerId), container);
};

export const updateContainerSettingsSuccess = (state, {
	projectId,
	containerId,
	settings,
}) => {
	const container = getContainerFromState(state, projectId, containerId);
	Object.assign(container, settings);
};

export const createContainerSuccess = (state, {
	projectId,
	container,
}) => {
	// a container with that id already exists in the store
	if (getContainerFromState(state, projectId, container._id)) return;

	state.containersByProject[projectId].push({
		...container,
		isFavourite: false,
		revisionsCount: 0,
		status: UploadStatus.OK,
		role: Role.ADMIN,
	});
};

export const deleteContainerSuccess = (state, {
	projectId,
	containerId,
}) => {
	state.containersByProject[projectId] = state.containersByProject[projectId].filter(
		(container) => containerId !== container._id,
	);
};

export const setContainerStatus = (state, {
	projectId,
	containerId,
	status,
}) => {
	getContainerFromState(state, projectId, containerId).status = status;
};

export const containerProcessingSuccess = (state, {
	projectId,
	containerId,
	revision,
}) => {
	const container = getContainerFromState(state, projectId, containerId);
	const newRevisionProperties = {
		revisionsCount: container.revisionsCount + 1,
		lastUpdated: getNullableDate(revision.timestamp),
		latestRevision: revision.tag,
	};
	Object.assign(container, newRevisionProperties);
};

export const containersReducer = createReducer<IContainersState>(INITIAL_STATE, produceAll({
	[ContainersTypes.FETCH_CONTAINERS_SUCCESS]: fetchContainersSuccess,
	[ContainersTypes.SET_FAVOURITE_SUCCESS]: setFavouriteSuccess,
	[ContainersTypes.FETCH_CONTAINER_STATS_SUCCESS]: fetchContainerStatsSuccess,
	[ContainersTypes.FETCH_CONTAINER_VIEWS_SUCCESS]: fetchContainerViewsSuccess,
	[ContainersTypes.FETCH_CONTAINER_SETTINGS_SUCCESS]: fetchContainerSettingsSuccess,
	[ContainersTypes.UPDATE_CONTAINER_SUCCESS]: updateContainerSuccess,
	[ContainersTypes.UPDATE_CONTAINER_SETTINGS_SUCCESS]: updateContainerSettingsSuccess,
	[ContainersTypes.CREATE_CONTAINER_SUCCESS]: createContainerSuccess,
	[ContainersTypes.DELETE_CONTAINER_SUCCESS]: deleteContainerSuccess,
	[ContainersTypes.SET_CONTAINER_STATUS]: setContainerStatus,
	[ContainersTypes.CONTAINER_PROCESSING_SUCCESS]: containerProcessingSuccess,
})) as (state: IContainersState, action: any) => IContainersState;

/**
 * Types
*/

export interface IContainersState {
	containersByProject: Record<string, IContainer[]>;
}

export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & TeamspaceProjectAndContainerId;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & TeamspaceProjectAndContainerId;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & ProjectAndContainerId & { isFavourite: boolean };
export type FetchContainersAction = Action<'FETCH_CONTAINERS'> & TeamspaceAndProjectId;
export type FetchContainersSuccessAction = Action<'FETCH_CONTAINERS_SUCCESS'> & ProjectId & { containers: IContainer[] };
export type FetchContainerStatsAction = Action<'FETCH_CONTAINER_STATS'> & TeamspaceProjectAndContainerId;
export type FetchContainerStatsSuccessAction = Action<'FETCH_CONTAINER_STATS_SUCCESS'> & ProjectAndContainerId & { containerStats: ContainerStats };
export type FetchContainerViewsAction = Action<'FETCH_CONTAINER_VIEWS'> & TeamspaceProjectAndContainerId;
export type FetchContainerViewsSuccessAction = Action<'FETCH_CONTAINER_VIEWS_SUCCESS'> & ProjectAndContainerId & { views: View[] };
export type FetchContainerSettingsAction = Action<'FETCH_CONTAINER_SETTINGS'> & TeamspaceProjectAndContainerId;
export type FetchContainerSettingsSuccessAction = Action<'FETCH_CONTAINER_SETTINGS_SUCCESS'> & ProjectAndContainerId & { settings: ContainerSettings };
export type FetchContainerUsersAction = Action<'FETCH_CONTAINER_USERS'> & TeamspaceProjectAndContainerId;
// export type FetchContainerUsersSuccessAction = Action<'FETCH_CONTAINER_USERS_SUCCESS'> & ProjectAndContainerId & { users: string[] };
export type FetchContainerJobsAction = Action<'FETCH_CONTAINER_JOBS'> & TeamspaceProjectAndContainerId;
// export type FetchContainerJobsSuccessAction = Action<'FETCH_CONTAINER_JOBS_SUCCESS'> & ProjectAndContainerId & { jobs: string[] };
export type UpdateContainerSettingsAction = Action<'UPDATE_CONTAINER_SETTINGS'> & TeamspaceProjectAndContainerId & SuccessAndErrorCallbacks & { settings: ContainerSettings };
export type UpdateContainerSuccessAction = Action<'UPDATE_CONTAINER_SUCCESS'> & ProjectAndContainerId & { container: Partial<IContainer> };
export type UpdateContainerSettingsSuccessAction = Action<'UPDATE_CONTAINER_SETTINGS_SUCCESS'> & ProjectAndContainerId & { settings: ContainerSettings };
export type CreateContainerAction = Action<'CREATE_CONTAINER'> & TeamspaceAndProjectId & SuccessAndErrorCallbacks & { newContainer: NewContainer };
export type CreateContainerSuccessAction = Action<'CREATE_CONTAINER_SUCCESS'> & ProjectId & { container: IContainer };
export type DeleteContainerAction = Action<'DELETE'> & TeamspaceProjectAndContainerId & SuccessAndErrorCallbacks;
export type DeleteContainerSuccessAction = Action<'DELETE_SUCCESS'> & ProjectAndContainerId;
export type SetContainerStatusAction = Action<'SET_CONTAINER_STATUS'> & ProjectAndContainerId & { status: UploadStatus };
export type ContainerProcessingSuccessAction = Action<'CONTAINER_PROCESSING_SUCCESS'> & ProjectAndContainerId & { revision: IContainerRevision };

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
		stats: ContainerStats,
	) => FetchContainerStatsSuccessAction;
	createContainer: (
		teamspace: string,
		projectId: string,
		newContainer: NewContainer,
		onSuccess: () => void,
		onError: (error) => void,
	) => CreateContainerAction;
	createContainerSuccess: (
		projectId: string,
		container: NewContainer,
	) => CreateContainerSuccessAction;
	fetchContainerViews: (teamspace: string, projectId: string, containerId: string) => FetchContainerViewsAction;
	fetchContainerViewsSuccess: (
		projectId: string,
		containerId: string,
		views: View[],
	) => FetchContainerViewsSuccessAction;
	fetchContainerSettings: (
		teamspace: string,
		projectId: string,
		containerId: string,
	) => FetchContainerSettingsAction;
	fetchContainerSettingsSuccess: (
		projectId: string,
		containerId: string,
		settings: ContainerSettings,
	) => FetchContainerSettingsSuccessAction;
	fetchContainerUsers: (
		teamspace: string,
		projectId: string,
		containerId: string,
	) => FetchContainerUsersAction,
	fetchContainerJobs: (
		teamspace: string,
		projectId: string,
		containerId: string,
	) => FetchContainerJobsAction,
	updateContainerSettings: (
		teamspace: string,
		projectId: string,
		containerId: string,
		settings: ContainerSettings,
		onSuccess: () => void,
		onError: (error) => void,
	) => UpdateContainerSettingsAction;
	updateContainerSettingsSuccess: (
		projectId: string,
		containerId: string,
		settings: ContainerSettings,
	) => UpdateContainerSettingsSuccessAction;
	updateContainerSuccess: (
		projectId: string,
		containerId: string,
		container: Partial<IContainer>,
	) => UpdateContainerSuccessAction;
	deleteContainer: (teamspace: string,
		projectId: string,
		containerId: string,
		onSuccess: () => void,
		onError: (error) => void,
	) => DeleteContainerAction;
	deleteContainerSuccess: (projectId: string, containerId: string) => DeleteContainerSuccessAction;
	setContainerStatus: (projectId: string, containerId: string, status: UploadStatus) => SetContainerStatusAction;
	containerProcessingSuccess: (
		projectId: string,
		containerId: string,
		revision: IContainerRevision
	) => ContainerProcessingSuccessAction;
	resetContainerStatsQueue:() => Action<'RESET_CONTAINER_STATS_QUEUE'>;
}
