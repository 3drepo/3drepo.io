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

import { AxiosResponse } from 'axios';
import {
	NewContainer,
	TeamspaceAndProjectId,
	TeamspaceProjectAndContainerId,
	UploadStatuses,
} from '@/v5/store/containers/containers.types';
import api from './default';

/**
 * Types
*/
type FetchContainersParams = TeamspaceAndProjectId;
type FavouriteParams = TeamspaceProjectAndContainerId;
type DeleteContainerParams = TeamspaceProjectAndContainerId;
type FetchContainerStatsParams = TeamspaceProjectAndContainerId;

type CreateContainerPayload = {
	teamspace: string;
	projectId: string;
	newContainer: NewContainer;
};

interface MinimumContainer {
	_id: string,
	name: string,
	role: string,
	isFavourite: boolean
}

export type FetchContainersResponse = {
	containers: Array<MinimumContainer>
};

export type FetchContainerStatsResponse = {
	revisions: {
		total: number;
		lastUpdated: number;
		latestRevision: string;
	};
	type: string;
	errorReason?: {
		message: string;
		timestamp: number;
	};
	status: UploadStatuses;
	unit: string;
	code: string;
};

/***/

export const addFavourites = (
	{ teamspace, projectId, containerId }: FavouriteParams,
): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/containers/favourites`, {
		containers: [containerId],
	})
);

export const removeFavourites = (
	{ teamspace, projectId, containerId }: FavouriteParams,
): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/containers/favourites`, {
		containers: [containerId],
	})
);

export const fetchContainers = async ({
	teamspace,
	projectId,
}: FetchContainersParams): Promise<FetchContainersResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers`);
	return data;
};

export const fetchContainerStats = async ({
	teamspace,
	projectId,
	containerId,
}: FetchContainerStatsParams): Promise<FetchContainerStatsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/stats`);
	return data;
};

export const createContainer = async ({
	teamspace,
	projectId,
	newContainer,
}: CreateContainerPayload): Promise<string> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects/${projectId}/containers`, newContainer);
	return data._id;
};

export const deleteContainer = (
	{ teamspace, projectId, containerId }: DeleteContainerParams,
): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
);
