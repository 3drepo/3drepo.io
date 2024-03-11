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

import { delay } from '@/v4/helpers/async';
import { Drawing, DrawingStats } from '@/v5/store/drawings/drawings.types';



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchDrawings = (teamspace, projectId): Promise<Drawing[]> => {
	return delay<Drawing[]>(Math.random() *  300, [ // TODO: The schema is unfinished
		{
			_id: 'asdasdmom',
			name: 'My cool drawing',
		},
		{
			_id: 'stilllife',
			name: 'Still life',
		},
		{
			_id: 'boring',
			name: 'Boring Drawing',
		},
		{
			_id: 'liuhiuhlk',
			name: 'Another drawing',
		}]) ;
};

export const fetchDrawingsStats = async (teamspace, projectId, drawingId): Promise<DrawingStats> => {
	const stats =  { // TODO: The schema is unfinished
		asdasdmom: {
			_id: 'asdasdmom',
			revisions : { revisionCount: 0, calibration: 'empty', isFavourite: false, type: 'Architectural', code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0001' },
		},
		liuhiuhlk: {
			_id: 'liuhiuhlk',
			revisions : { revisionCount: 1, lastUpdated: 1709569331628,  latestRevision:'I dunno', calibration: 'calibrated', isFavourite: false, type: 'Existing', code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0002' },
		},
		stilllife: {
			_id: 'stilllife',
			revisions : { revisionCount: 2,  lastUpdated: 1009569331628,  latestRevision:'Apple', calibration: 'outOfSync', isFavourite: true, type: 'Existing', code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0003' },
		},
		boring: {
			_id: 'boring',
			revisions : { revisionCount: 10, lastUpdated: 1609569331628,  latestRevision:'Shading and other such things to improve the drawing', calibration: 'uncalibrated', isFavourite: false, type: 'MEP', code: 'SC2-SFT-V1-01-M4-ST-30_11_30-0001' },
		},

	};

	return delay<DrawingStats>(Math.random() * 250, stats[drawingId]) ;
};
