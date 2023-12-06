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
import api from './default';

export const fetchProjects = (teamspace: string): Promise<any> => api.get(`teamspaces/${teamspace}/projects`);

export const createProject = async (teamspace: string, name: string): Promise<any> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects`, { name });
	return data._id;
};

export const updateProjectName = (
	teamspace: string,
	projectId: string,
	name: string,
): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}`, { name })
);

export const deleteProject = (teamspace: string, projectId: string): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}`)
);

export const updateProjectImage = (
	teamspace: string,
	projectId: string,
	image: FormData,
): Promise<AxiosResponse<void>> => (
	api.put(`teamspaces/${teamspace}/projects/${projectId}/image`, image)
);

export const deleteProjectImage = (teamspace: string, projectId: string): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}/image`)
);
