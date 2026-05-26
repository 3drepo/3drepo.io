/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { DrawingSettings, DrawingStats, MinimumDrawing } from '@/v5/store/drawings/drawings.types';
import api from './default';

export const addFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}/drawings/favourites`, {
		drawings: [drawingId],
	})
);

export const removeFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => api.delete(`teamspaces/${teamspace}/projects/${projectId}/drawings/favourites?ids=${drawingId}`);

export const fetchDrawings = async (teamspace, projectId): Promise<AxiosResponse<MinimumDrawing[]>> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/drawings`);
	return data;
};

export const fetchDrawingsStats = async (teamspace, projectId, drawingId): Promise<DrawingStats> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/stats`);

	return data;
};

export const fetchDrawingSettings = async (teamspace, projectId, drawingId): Promise<DrawingSettings> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}`);
	return data;
};

export const fetchTypes = async (teamspace, projectId): Promise<AxiosResponse<string[]>> => {
	const { data } = await api.get(`teamspaces/${teamspace}/projects/${projectId}/settings/drawingCategories`);
	return data;
};

export const createDrawing = async (teamspace, projectId, drawing): Promise<string> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects/${projectId}/drawings`, drawing);
	return data._id;
};

export const updateDrawing = (teamspace, projectId, drawingId, drawing): Promise<AxiosResponse<void>> => api.patch(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}`, drawing);

export const deleteDrawing = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => api.delete(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}`);
