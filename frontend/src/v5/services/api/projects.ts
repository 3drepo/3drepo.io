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

import { IProject } from '@/v5/store/projects/projects.types';
import { AxiosResponse } from 'axios';
import api from './default';

export const fetchProjects = (teamspace: string): Promise<any> => api.get(`teamspaces/${teamspace}/projects`);

export const createProject = async (teamspace: string, projectName: string): Promise<any> => {
	const { data } = await api.post(`teamspaces/${teamspace}/projects`, { name: projectName });
	return data._id;
};

export const updateProject = (
	teamspace: string,
	projectId: string,
	project: Partial<IProject>,
): Promise<AxiosResponse<void>> => (
	api.patch(`teamspaces/${teamspace}/projects/${projectId}`, project)
);

export const deleteProject = (teamspace: string, projectId: string): Promise<AxiosResponse<void>> => (
	api.delete(`teamspaces/${teamspace}/projects/${projectId}`)
);
