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
/* eslint-disable @typescript-eslint/no-unused-vars */

import { delay } from '@/v4/helpers/async';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { Drawing, DrawingStats, MinimumDrawing } from '@/v5/store/drawings/drawings.types';
import { AxiosResponse } from 'axios';

export const addFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};

export const removeFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchDrawings = (teamspace, projectId): Promise<MinimumDrawing[]> => {
	return delay<MinimumDrawing[]>(Math.random() *  300, [ // TODO: The schema is unfinished
		{
			_id: 'asdasdmom',
			name: 'My cool drawing',
			isFavourite: true,
			role: Role.ADMIN,
		},
		{
			_id: 'stilllife',
			name: 'Still life',
			isFavourite: true,
			role: Role.COLLABORATOR,
		},
		{
			_id: 'boring',
			name: 'Boring Drawing',
			isFavourite: false,
			role: Role.COMMENTER,
		},
		{
			_id: 'liuhiuhlk',
			name: 'Another drawing',
			isFavourite: false,
			role: Role.VIEWER,
		}]) ;
};

export const fetchDrawingsStats = async (teamspace, projectId, drawingId): Promise<DrawingStats> => {
	const stats =  { // TODO: The schema is unfinished
		asdasdmom: {
			_id: 'asdasdmom',
			revisions : { revisionsCount: 0, calibration: 'empty', isFavourite: false, type: 'Architectural', code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0001' },
		},
		liuhiuhlk: {
			_id: 'liuhiuhlk',
			revisions : { revisionsCount: 1, lastUpdated: 1709569331628,  latestRevision:'I dunno', calibration: 'calibrated', isFavourite: false, type: 'Existing', code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0002', status: 's4s' },
		},
		stilllife: {
			_id: 'stilllife',
			revisions : { revisionsCount: 2,  lastUpdated: 1009569331628,  latestRevision:'Apple', calibration: 'outOfSync', isFavourite: true, type: 'Existing', code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0003' },
		},
		boring: {
			_id: 'boring',
			revisions : { revisionsCount: 10, lastUpdated: 1609569331628,  latestRevision:'Shading and other such things to improve the drawing', calibration: 'uncalibrated', isFavourite: false, type: 'MEP', code: 'SC2-SFT-V1-01-M4-ST-30_11_30-0001', status: 's5' },
		},

	};

	return delay<DrawingStats>(Math.random() * 250, stats[drawingId]) ;
};

export const deleteDrawing = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};
