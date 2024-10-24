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
	ContainerBackendSettings,
	ContainerStats,
	MinimumContainer,
} from '@/v5/store/containers/containers.types';
import { View } from '@/v5/store/store.types';
import api from './default';

export const addFavourite = (teamspace, projectId, containerId): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/containers/favourites`, {
		containers: [containerId],
	})
);

export const removeFavourite = (teamspace, projectId, containerId): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/containers/favourites?ids=${containerId}`)
);

export const fetchContainers = async (teamspace, projectId): Promise<FetchContainersResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers`);
	return data;
};

export const fetchContainerStats = async (teamspace, projectId, containerId): Promise<ContainerStats> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/stats`);
	return data;
};

export const fetchContainerViews = async (teamspace, projectId, containerId): Promise<FetchContainerViewsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/views`);
	return data;
};

export const fetchContainerSettings = async (teamspace, projectId, containerId): Promise<ContainerBackendSettings> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`);
	return data;
};

export const updateContainerSettings = async (teamspace, projectId, containerId, settings): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`, settings)
);

export const createContainer = async (teamspace, projectId, newContainer): Promise<string> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects/${projectId}/containers`, newContainer);
	return data._id;
};

export const deleteContainer = (teamspace, projectId, containerId): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}`)
);

/**
 * Types
*/
export type FetchContainersResponse = { containers: Array<MinimumContainer> };
export type FetchContainerViewsResponse = { views: View[] };
