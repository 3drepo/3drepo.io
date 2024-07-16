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
}

export interface DrawingStats {
	_id: string;
	desc?: string;
	revisions : {
		total: number;
		lastUpdated?: number;
		latestRevision?: string,
	};
	number: string,
	calibration?: CalibrationStates,
	type?: string,
	status?: DrawingUploadStatus,
	errorReason?: {
		message: string;
		timestamp: Date | number;
	};
}

export interface IDrawing extends MinimumDrawing, Omit<DrawingStats, 'revisions'> {
	lastUpdated?: Date;
	latestRevision?: string;
	revisionsCount: number;
	hasStatsPending?: boolean;
}

export type NewDrawing = {
	_id: string;
	name: string;
	type: string;
	number: string;
	desc?: string;
};