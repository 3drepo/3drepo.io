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

import {
	FederationBackendSettings,
	MinimumFederation,
	FederationStats,
} from '@/v5/store/federations/federations.types';
import { View } from '@/v5/store/store.types';
import { AxiosResponse } from 'axios';
import api from './default';

export const createFederation = async (teamspace, projectId, newFederation): Promise<CreateFederationResponse> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects/${projectId}/federations`, newFederation);
	return data._id;
};

export const addFavourites = (teamspace, projectId, federationId): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/federations/favourites`, {
		federations: [federationId],
	})
);

export const removeFavourites = (teamspace, projectId, federationId): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/federations/favourites?ids=${federationId}`)
);

export const fetchFederations = async (teamspace, projectId): Promise<FetchFederationsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations`);
	return data;
};

export const fetchFederationStats = async (teamspace, projectId, federationId): Promise<FederationStats> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/stats`);
	return data;
};

export const fetchFederationViews = async (teamspace, projectId, federationId): Promise<FetchFederationViewsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/views`);
	return data;
};

export const fetchFederationSettings = async (teamspace, projectId, federationId): Promise<FederationBackendSettings> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`);
	return data;
};

export const updateFederationSettings = async (teamspace, projectId, federationId, settings): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`, settings)
);

export const deleteFederation = (teamspace, projectId, federationId): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
);

export const updateFederationContainers = async (teamspace, projectId, federationId, containers): Promise<AxiosResponse<void>> => (
	api.post(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/revisions`, {
		containers,
	})
);

export const fetchFederationUsers = async (
	teamspace: string,
	projectId: string,
	modelId: string,
) => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/members`);
	return data;
};

export const fetchFederationJobs = async (
	teamspace: string,
	projectId: string,
	modelId: string,
) => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${modelId}/jobs`);
	return data;
};

/**
 * Types
*/
export type CreateFederationResponse = { _id: string };
export type FetchFederationsResponse = { federations: Array<MinimumFederation> };
export type FetchFederationViewsResponse = { views: View[] };
