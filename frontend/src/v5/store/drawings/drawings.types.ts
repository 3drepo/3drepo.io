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

import { Role } from '../currentUser/currentUser.types';

export enum CalibrationStates {
	CALIBRATED = 'calibrated',
	OUT_OF_SYNC = 'outOfSync',
	UNCALIBRATED = 'uncalibrated',
	EMPTY = 'empty',
}

export interface MinimumDrawing {
	_id: string;
	name: string;
	role: Role;
	isFavourite: boolean;
}

// TODO: Unfinished interface
export interface IDrawing extends MinimumDrawing {
	desc?: string;
	total: number;
	lastUpdated?: Date;
	latestRevision?: string;
	calibration?: CalibrationStates;
	category?: string; // TODO - add category types?
	drawingNumber: string;
	hasStatsPending?: boolean;
	status?: any; // TODO - add drawing statuses
	errorReason?: {
		message: string;
		timestamp: Date | null;
	};
}

// TODO: Unfinished interface
export interface DrawingStats {
	_id: string,
	revisions: {
		total: number,
		lastUpdated?: number,
		drawingNumber: string,
		latestRevision?: string,
		calibration?: CalibrationStates,
		category?: string, // TODO - add category types
		status?: any, // TODO - add drawing statuses
		errorReason?: {
			message: string,
			timestamp: number,
		},
	}
}
