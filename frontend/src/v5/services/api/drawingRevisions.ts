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
import { clientConfigService } from '@/v4/services/clientConfig';
import api, { generateV5ApiUrl } from './default';
import { Calibration } from '@/v5/store/drawings/drawings.types';

export const fetchRevisions = (teamspace: string, projectId: string, drawingId: string, showVoid = true): Promise<any> => (
	api.get(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions${showVoid ? '?showVoid=true' : ''}`)
);

export const setRevisionVoidStatus = (teamspace: string, projectId: string, drawingId: string, revision: string, isVoid = true) => api.patch(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revision}`, {
	void: isVoid,
});

export const createRevision = async (
	teamspace: string,
	projectId: string,
	drawingId: string,
	onProgress: any,
	body: any,
): Promise<AxiosResponse<void>> => {
	const config = {
		onUploadProgress: (progressEvent) => onProgress(
			Math.round((progressEvent.loaded * 100) / progressEvent.total),
		),
	};
	return api.post(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions`, body, config);
};

export const getRevisionFileUrl = (teamspace: string, projectId: string, drawingId: string, revision: string) => (
	generateV5ApiUrl(
		`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revision}/files/original`,
		clientConfigService.GET_API,
	)
);

export const fetchStatusCodes = (teamspace, projectId): Promise<AxiosResponse<string[]>> => api.get(`teamspaces/${teamspace}/projects/${projectId}/settings/statusCodes`);

export const fetchCalibration = async (teamspace: string, projectId: string, drawingId: string, revisionId: string): Promise<AxiosResponse<void>> => (
	api.get(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}/calibrations`)
);

export const updateCalibration = async (
	teamspace: string,
	projectId: string,
	drawingId: string,
	revisionId: string,
	calibration: Calibration,
): Promise<AxiosResponse<void>> => (
	api.post(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}/calibrations`, calibration)
);

export const approveCalibration = async (
	teamspace: string,
	projectId: string,
	drawingId: string,
	revisionId: string,
): Promise<AxiosResponse<void>> => (
	api.post(`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revisionId}/calibrations?usePrevious=true`)
);