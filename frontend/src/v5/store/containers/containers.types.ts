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

import { FetchContainerStatsResponse } from '@/v5/services/api/containers';
import { Action } from 'redux';

export enum UploadStatuses {
	OK = 'ok',
	FAILED = 'failed',
	UPLOADING = 'uploading',
	UPLOADED = 'uploaded',
	QUEUED = 'queued',
	PROCESSING = 'processing',
	GENERATING_BUNDLES = 'Generating Bundles',
	QUEUED_FOR_UNITY = 'Queued for Unity',
}

export interface IContainer {
	_id: string;
	name: string;
	latestRevision: string;
	revisionsCount?: number;
	lastUpdated: Date;
	type: string;
	code: string;
	status: UploadStatuses;
	unit?: string;
	isFavourite: boolean;
	role: string;
	hasStatsPending: boolean;
	errorResponse?: {
		message: string;
		date: Date | null;
	};
}

export type NewContainer = {
	name: string;
	unit: string;
	type: string;
	desc?: string;
	code?: string;
};

type TeamspaceId = { teamspace: string };
type ProjectId = { projectId: string };
type ContainerId = { containerId: string };

export type TeamspaceAndProjectId = TeamspaceId & ProjectId;

export type TeamspaceProjectAndContainerId = TeamspaceId & ProjectId & ContainerId;

export type ProjectAndContainerId = ProjectId & ContainerId;

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
