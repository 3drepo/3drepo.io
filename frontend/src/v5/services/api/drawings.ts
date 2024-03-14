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
import { DrawingStats, MinimumDrawing } from '@/v5/store/drawings/drawings.types';
import { AxiosResponse } from 'axios';
import uuid from 'uuidv4';

export const addFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};

export const removeFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};

const categories =  ['A drawing category', 'Another drawing category', 'Yet another one'];

const drawings = [ // TODO: The schema is unfinished
	{
		_id: uuid(),
		drawingNumber: uuid(),
		name: 'My cool drawing',
		isFavourite: true,
		role: Role.ADMIN,
	},
	{
		_id: uuid(),
		drawingNumber: uuid(),
		name: 'Still life',
		isFavourite: true,
		role: Role.COLLABORATOR,
	},
	{
		_id: uuid(),
		drawingNumber: uuid(),
		name: 'Boring Drawing',
		isFavourite: false,
		role: Role.COMMENTER,
	},
	{
		_id: uuid(),
		drawingNumber: uuid(),
		name: 'Another drawing',
		isFavourite: false,
		role: Role.VIEWER,
	},
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchDrawings = (teamspace, projectId): Promise<MinimumDrawing[]> => {
	return delay<MinimumDrawing[]>(Math.random() *  300, drawings);
};

export const fetchDrawingsStats = async (teamspace, projectId, drawingId): Promise<DrawingStats> => {
	const stats = [ // TODO: The schema is unfinished
		{
			_id: drawings[0]._id,
			revisions : {
				lastUpdated: null,
				total: 0,
				calibration: 'empty',
				isFavourite: false,
				type: 'Architectural',
				code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0001',
				category: categories[1],
			},
		},
		{
			_id: drawings[1]._id,
			revisions : {
				total: 1,
				lastUpdated: 1709569331628,
				latestRevision:'I dunno',
				calibration: 'calibrated',
				isFavourite: false,
				type: 'Existing',
				code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0002',
				status: 's4s',
				category: categories[0],
			},
		},
		{
			_id: drawings[2]._id,
			revisions : {
				total: 2,
				lastUpdated: 1009569331628,
				latestRevision:'Apple',
				calibration: 'outOfSync',
				isFavourite: true,
				type: 'Existing',
				code: 'SC1-SFT-V1-01-M3-ST-30_10_30-0003',
				category: categories[2],
			},
		},
		{
			_id: drawings[3]._id,
			revisions : {
				total: 10,
				lastUpdated: 1609569331628,
				latestRevision:'Shading and other such things to improve the drawing',
				calibration: 'uncalibrated',
				isFavourite: false,
				type: 'MEP',
				code: 'SC2-SFT-V1-01-M4-ST-30_11_30-0001',
				status: 's5',
				category: categories[0],
			},
		},
	];

	return delay<DrawingStats>(Math.random() * 250, stats.find(((s)=> s._id === drawingId)));
};


export const fetchCategories = (teamspace, projectId): Promise<string[]> => {
	return delay<string[]>(1000, categories) ;
};

export const createDrawing = (teamspace, projectId, drawing): Promise<string> => {
	delay(200, null);
	// throw new Error('name already exists');
	// throw new Error('Drawing number already exists');
	return delay<string>(500, uuid()) ;
};

export const updateDrawing = (teamspace, projectId, drawingId, drawing): Promise<string> => {
	// delay(200, null);
	// throw new Error('name already exists');
	// throw new Error('Drawing number already exists');
	return delay(500, null);
};

export const deleteDrawing = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};
