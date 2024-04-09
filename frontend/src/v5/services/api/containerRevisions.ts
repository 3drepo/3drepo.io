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
import { clientConfigService } from '@/v4/services/clientConfig';
import api, { generateV5ApiUrl } from './default';

export const fetchRevisions = (teamspace: string, projectId: string, containerId: string, showVoid = true): Promise<any> => api.get(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions${showVoid ? '?showVoid=true' : ''}`);

export const setRevisionVoidStatus = (teamspace: string, projectId: string, containerId: string, revision: string, isVoid = true) => api.patch(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revision}`, {
	void: isVoid,
});

export const createRevision = (
	teamspace,
	projectId,
	containerId,
	onProgress,
	body,
): Promise<AxiosResponse<void>> => {
	const config = {
		onUploadProgress: (progressEvent) => onProgress(
			Math.round((progressEvent.loaded * 100) / progressEvent.total),
		),
	};
	return api.post(`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions`, body, config);
};

export const getRevisionFileUrl = (teamspace: string, projectId: string, containerId: string, revision: string) => (
	generateV5ApiUrl(
		`teamspaces/${teamspace}/projects/${projectId}/containers/${containerId}/revisions/${revision}/files`,
		clientConfigService.GET_API,
	)
);
