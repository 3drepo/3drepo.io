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
	FetchFederationsPayload,
	FetchFederationsResponse,
	FetchFederationStatsPayload,
	FetchFederationStatsResponse,
	FavouritePayload,
	DeleteFederationPayload,
	UpdateFederationContainersPayload,
} from '@/v5/store/federations/federations.types';
import { AxiosResponse } from 'axios';
import api from './default';

export const addFavourites = (
	{ teamspace, projectId, federationId }: FavouritePayload,
): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/federations/favourites`, {
		federations: [federationId],
	})
);

export const removeFavourites = (
	{ teamspace, projectId, federationId }: FavouritePayload,
): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/federations/favourites`, {
		federations: [federationId],
	})
);

export const fetchFederations = async ({
	teamspace,
	projectId,
}: FetchFederationsPayload): Promise<FetchFederationsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations`);
	return data;
};

export const fetchFederationStats = async ({
	teamspace,
	projectId,
	federationId,
}: FetchFederationStatsPayload): Promise<FetchFederationStatsResponse> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/stats`);
	return data;
};

export const deleteFederation = ({
	teamspace,
	projectId,
	federationId,
}: DeleteFederationPayload): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}`)
);

export const updateFederationContainers = async ({
	teamspace,
	projectId,
	federationId,
	containers,
}: UpdateFederationContainersPayload): Promise<AxiosResponse<void>> => (
	api.post(`teamspaces/${teamspace}/projects/${projectId}/federations/${federationId}/revisions`, {
		containers,
	})
);
