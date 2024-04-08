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
import { CalibrationStates, DrawingStats, MinimumDrawing } from '@/v5/store/drawings/drawings.types';
import { AxiosResponse } from 'axios';
import uuid from 'uuidv4';

export const addFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};

export const removeFavourite = (teamspace, projectId, drawingId): Promise<AxiosResponse<void>> => {
	return delay(Math.random() * 15 ** 2, null) ;
};

const categories =  ['A drawing category', 'Another drawing category', 'Yet another one'];

const arr = (new Array(20)).fill(0);

const drawings = arr.map((_, index) => {
	const role = Role[Object.keys(Role)[index % 4]];
	return {
		_id: uuid(),
		name: 'A drawing ' + index + ' - ' + role,
		isFavourite: (Math.random() > 0.5),
		role,
	};
});

const randCal = () => {
	const i  = Math.round(Math.random() * 2);
	switch (i) {
		case 0:
			return CalibrationStates.CALIBRATED;
		case 1:
			return CalibrationStates.OUT_OF_SYNC;
		case 2:
			return CalibrationStates.UNCALIBRATED;
	}
};


const stats = arr.map((_, index) => {
	const lastUpdated = (Math.random() > 0.5) ? 1709569331628 + Math.round( Math.random() * 31556952000) : null;
	const total = lastUpdated ?  Math.round(Math.random() * 10) : 0;

	const calibration = total ? randCal() : CalibrationStates.EMPTY;
	const latestRevision = total ? 'Revision ' + total : undefined;
	const status = total ? 'status' : undefined;

	return {
		_id: drawings[index]._id,
		revisions : {
			lastUpdated,
			drawingNumber: uuid(), 
			total,
			calibration,
			category: categories[Math.round(Math.random() * (categories.length - 1))],
			latestRevision,
			status,
		},
	} as DrawingStats;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchDrawings = (teamspace, projectId): Promise<MinimumDrawing[]> => {
	return delay<MinimumDrawing[]>(Math.random() *  300, drawings);
};

export const fetchDrawingsStats = async (teamspace, projectId, drawingId): Promise<DrawingStats> => {
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
