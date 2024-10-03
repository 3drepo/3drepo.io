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

import { Vector1D, Vector2D, Vector3D } from '../../ui/routes/dashboard/projects/calibration/calibration.types';
import { UploadStatus } from '../containers/containers.types';
import { Role } from '../currentUser/currentUser.types';

export enum CalibrationStatus {
	CALIBRATED = 'calibrated',
	UNCONFIRMED = 'unconfirmed',
	UNCALIBRATED = 'uncalibrated',
	EMPTY = 'empty',
}

export interface MinimumDrawing {
	_id: string;
	name: string;
	role: Role;
	isFavourite: boolean;
}

export interface Calibration {
	verticalRange: Vector1D;
	horizontal?: {
		model: Vector3D,
		drawing: Vector2D,
	}
	units: string,
}

export interface DrawingStats {
	revisions: {
		total: number;
		lastUpdated?: number;
		latestRevision?: string,
	};
	number: string,
	calibrationStatus?: CalibrationStatus,
	type: string,
	status: UploadStatus,
	errorReason?: {
		message: string;
		timestamp: Date;
	};
	desc?: string;
}

type DrawingSettingsCalibration = Omit<Calibration, 'horizontal'>;

export interface DrawingSettings {
	name: string,
	number: string,
	type: string,
	desc: string,
	calibration: DrawingSettingsCalibration,
}

export interface IDrawing extends MinimumDrawing, Partial<Omit<DrawingStats, 'revisions'>> {
	lastUpdated?: Date;
	latestRevision?: string;
	revisionsCount: number;
	hasStatsPending?: boolean;
	calibration: Calibration;
}

export type NewDrawing = {
	_id: string;
	name: string;
	type: string;
	number: string;
	desc?: string;
	calibration: DrawingSettingsCalibration;
};
