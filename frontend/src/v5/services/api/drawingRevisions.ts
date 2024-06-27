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
import { IDrawingRevision } from '@/v5/store/drawings/revisions/drawingRevisions.types';
import { uuid } from '@/v4/helpers/uuid';
import faker from 'faker';
/* eslint-disable @typescript-eslint/no-unused-vars */

const getRevisions = (length) => Array(length ?? Math.round(Math.random() ** 2 * 5)).fill(0).map((_, index) => ({
	_id: uuid(),
	name: 'rev' + index,
	timestamp: new Date(1_409_000_000_000 + Math.random() * 10 ** 8),
	desc: Math.random() > .5 ? 'this is a description' : undefined,
	author: 'John',
	format: Math.random() > .5 ? '.dwg' : '.pdf',
	statusCode: faker.datatype.string() + Math.round(Math.random() * 10 ** (Math.random())),
	revisionCode: faker.datatype.string() + Math.round(Math.random() * 10 ** (Math.random())),
})) as IDrawingRevision[];

// TODO - remove last param, it's for demo only
export const fetchRevisions = (teamspace: string, projectId: string, drawingId: string, revisionsCount, showVoid = true): Promise<any> => {
	// throw new Error('name already exists');
	// throw new Error('Drawing number already exists');
	const revisions = getRevisions(revisionsCount);
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
