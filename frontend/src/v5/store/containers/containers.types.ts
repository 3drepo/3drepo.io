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

import { Action } from 'redux';

export interface IContainersState {
	containers: Record<string, IContainer[]>;
	filterQuery: string;
	isListPending: boolean;
	areStatsPending: boolean;
}

export enum ContainerStatuses {
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
	revisionsCount: number;
	lastUpdated: Date;
	type: string;
	code: string;
	units: string;
	status: ContainerStatuses;
	isFavourite: boolean;
	role: string;
	hasStatsPending: boolean;
	errorResponse?: {
		message: string;
		date: Date | null;
	};
}

export type FavouritePayload = FetchContainersPayload & {
	containerId: string;
};

export type FetchContainersPayload = {
	teamspace: string;
	projectId: string;
};

export type FetchContainersContainerItemResponse = Pick<IContainer, '_id' | 'name' | 'role' | 'isFavourite'>;

export type FetchContainersResponse = {
	containers: Array<FetchContainersContainerItemResponse>
};

export type FetchContainerStatsPayload = FetchContainersPayload & {
	containerId: IContainer['_id'];
};

export type FetchContainerStatsSuccessPayload = {
	containerId: string,
	projectId: string;
	containerStats: FetchContainerStatsResponse;
};

export type FetchContainerStatsResponse = {
	revisions: {
		total: number;
		lastUpdated: number;
		latestRevision: string;
	};
	type: string;
	status: ContainerStatuses;
	errorReason?: {
		message: string;
		timestamp: number;
	};
	units: string;
	code: string;
};

export type SetFilterQueryAction = Action<'SET_FILTER_QUERY'> & { query: string};
export type AddFavouriteAction = Action<'ADD_FAVOURITE'> & FavouritePayload;
export type RemoveFavouriteAction = Action<'REMOVE_FAVOURITE'> & FavouritePayload;
export type SetFavouriteSuccessAction = Action<'SET_FAVOURITE_SUCCESS'> & {projectId: string, containerId: string, isFavourite: boolean};
export type FetchContainersAction = Action<'FETCH_CONTAINERS'> & FetchContainersPayload;
export type FetchContainersSuccessAction = Action<'FETCH_CONTAINERS_SUCCESS'> & { projectId: string, containers: IContainer[] };
export type SetIsListPendingAction = Action<'SET_IS_LIST_PENDING'> & { isPending: boolean };
export type FetchContainerStatsAction = Action<'FETCH_CONTAINER_STATS'> & FetchContainerStatsPayload;
export type FetchContainerStatsSuccessAction = Action<'FETCH_CONTAINER_STATS_SUCCESS'> & FetchContainerStatsSuccessPayload;

export interface IContainersActionCreators {
	setFilterQuery: (query: string) => SetFilterQueryAction;
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
	setIsListPending: (isPending: boolean) => SetIsListPendingAction;
}
