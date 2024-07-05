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

import { Coord2D, Vector2D, Vector3D } from '../../ui/routes/dashboard/projects/calibration/calibration.types';
import { Role } from '../currentUser/currentUser.types';

export enum CalibrationState {
	CALIBRATED = 'calibrated',
	OUT_OF_SYNC = 'outOfSync',
	UNCALIBRATED = 'uncalibrated',
	EMPTY = 'empty',
}

// TODO - fix once they are sure
export enum DrawingUploadStatus {
	OK = 'ok',
	FAILED = 'failed',
	UPLOADING = 'uploading',
	UPLOADED = 'uploaded',
	QUEUED = 'queued',
	PROCESSING = 'processing',
}

export interface MinimumDrawing {
	_id: string;
	name: string;
	role: Role;
	isFavourite: boolean;
	category: string; // TODO - add category types?
	drawingNumber: string;
}

export interface ICalibration {
	state: CalibrationState;
	verticalRange: Coord2D;
	horizontal: {
		model: Vector3D,
		drawing: Vector2D,
	}
	units: string,
}

// TODO: Unfinished interface
export interface IDrawing extends MinimumDrawing {
	desc?: string;
	lastUpdated?: Date;
	latestRevision?: string;
	calibration?: Partial<ICalibration>,
	status: DrawingUploadStatus;
	revisionsCount: number;
	role: any;
	isFavourite: boolean;
	hasStatsPending?: boolean;
	errorReason?: {
		message: string;
		timestamp: Date | null;
	};
}

// TODO: Unfinished interface
export interface DrawingStats {
	_id: string;
	revisions : {
		total: number;
		lastUpdated?: number;
		latestRevision?: string,
	};
	drawingNumber: string,
	category?: string, // TODO - add category types
	status?: DrawingUploadStatus,
	errorReason?: {
		message: string;
		timestamp: number;
	};
}

export type NewDrawing = {
	_id?: string;
	name: string;
	category: string;
	drawingNumber: string;
	desc?: string;
};