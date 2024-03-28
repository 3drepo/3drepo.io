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
import { generateV5ApiUrl } from './default';
import { delay } from '@/v4/helpers/async';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';
import { IDrawingRevision } from '@/v5/store/drawings/drawingRevisions/drawingRevisions.types';
import { uuid } from '@/v4/helpers/uuid';
/* eslint-disable @typescript-eslint/no-unused-vars */

const revisions: IDrawingRevision[] = [
	{
		_id: uuid(),
		name: 'rev1',
		timestamp: 1409009331628,
		author: 'John',
		format: '.dwg',
		statusCode: '1',
		revisionCode: '1',
	}, {
		_id: uuid(),
		name: 'rev2',
		timestamp: 1709569331628,
		author: 'John',
		format: '.pdf',
		revisionCode: '2',
	},
];

export const fetchRevisions = (teamspace: string, projectId: string, drawingId: string, showVoid = true): Promise<any> => {
	// throw new Error('name already exists');
	// throw new Error('Drawing number already exists');
	return delay(500, { data: { revisions } });
};

export const setRevisionVoidStatus = (teamspace: string, projectId: string, drawingId: string, revision: string, isVoid = true) => {
	return delay(500, null);
};

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
	for (let progress = 0; progress < 100;) {
		const { promiseToResolve, resolve } = getWaitablePromise();
		setTimeout(() => {
			progress = Math.min(progress + Math.round(Math.random() ** 2 * 100), 100);
			onProgress(progress);
			resolve();
		}, Math.random() * 1500);
		await promiseToResolve;
	}
	return delay(500, null);
};

export const getRevisionFileUrl = (teamspace: string, projectId: string, drawingId: string, revision: string) => (
	generateV5ApiUrl(
		`teamspaces/${teamspace}/projects/${projectId}/drawings/${drawingId}/revisions/${revision}/files`,
		clientConfigService.GET_API,
	)
);
