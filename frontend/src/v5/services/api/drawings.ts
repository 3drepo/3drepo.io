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
import { IDrawing, DrawingStats } from '@/v5/store/drawings/drawings.types';
import uuid from 'uuidv4';

const categories =  ['A drawing category', 'Another drawing category', 'Yet another one'];

const drawings: IDrawing[] = [ // TODO: The schema is unfinished
	{
		_id: uuid(),
		name: 'My cool drawing',
		drawingNumber: uuid(),
		category: categories[0],
		role: Role.COLLABORATOR,
		status: null,
		revisionsCount: 0,
		latestRevision: null,
		lastUpdated: null,
		isFavourite: false,
		hasStatsPending: false,
	},
	{
		_id: uuid(),
		name: 'Another drawing',
		drawingNumber: uuid(),
		category: categories[1],
		role: Role.COLLABORATOR,
		status: null,
		revisionsCount: 0,
		latestRevision: null,
		lastUpdated: null,
		isFavourite: false,
		hasStatsPending: false,
	},
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchDrawings = (teamspace, projectId): Promise<IDrawing[]> => {
	return delay<IDrawing[]>(Math.random() *  300, drawings) ;
};

export const fetchDrawingsStats = async (teamspace, projectId, drawingId): Promise<DrawingStats> => {
	const stats =   [{
		_id: drawings[0]._id,
		revisions : { total: 0 },
	},
	{
		_id: drawings[1]._id,
		revisions : { total: 1, lastUpdated: 1709569331628,  latestRevision:'I dunno' },
	}];

	return delay<DrawingStats>(Math.random() * 250, stats.find(((s)=> s._id === drawingId))) ;
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
