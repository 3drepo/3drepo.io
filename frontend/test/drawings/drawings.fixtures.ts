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

import * as faker from 'faker';
import { IDrawing, DrawingStats, Calibration, DrawingSettings } from '@/v5/store/drawings/drawings.types';
import { Role } from '@/v5/store/currentUser/currentUser.types';
import { UploadStatus } from '@/v5/store/containers/containers.types';
import { getFakeCalibrationStatus, getFakeDrawingSettingsCalibration, getFakeVerticalRange, getRandomUnits } from './drawingRevisions/drawingRevisions.fixtures';
import { EMPTY_CALIBRATION } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';
import { Vector } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';

export const drawingMockFactory = (overrides?: Partial<IDrawing>): IDrawing => ({
	_id: faker.datatype.uuid(),
	latestRevision: faker.random.words(2),
	revisionsCount: faker.datatype.number({ min: 10, max: 1200 }),
	lastUpdated: faker.date.past(2),
	name: faker.random.words(3),
	role: faker.random.arrayElement([Role.ADMIN, Role.COLLABORATOR]),
	isFavourite: faker.datatype.boolean(),
	hasStatsPending: true,
	desc: faker.random.words(3),
	type: faker.random.word(),
	status: UploadStatus.OK,
	number: faker.random.alphaNumeric(),
	calibrationStatus: getFakeCalibrationStatus(),
	calibration: EMPTY_CALIBRATION,
	...overrides,
});

export const prepareMockStats = (overrides?: Partial<DrawingStats>): DrawingStats => ({
	revisions: {
		total: faker.datatype.number(),
		lastUpdated: faker.datatype.number(),
		latestRevision: faker.random.word(),
	},
	desc: faker.random.words(3),
	type: faker.random.word(),
	status: UploadStatus.OK,
	number: faker.random.alphaNumeric(),
	calibrationStatus: getFakeCalibrationStatus(),
	...overrides,
});

export const getFakeCoordinate = (dimensions: number): any => Array(dimensions).map(() => faker.datatype.number());
export const getFakeCalibrationArray = (dimensions: number): Vector<any> => [getFakeCoordinate(dimensions), getFakeCoordinate(dimensions)];
export const prepareMockCalibration = (overrides?: Partial<Calibration>): Calibration => ({
	horizontal: {
		drawing: getFakeCalibrationArray(2),
		model: getFakeCalibrationArray(3),
	},
	verticalRange: getFakeVerticalRange(),
	units: getRandomUnits(),
	...overrides,
});

export const prepareMockSettings = (overrides?: Partial<DrawingSettings>): DrawingSettings => ({
	calibration: getFakeDrawingSettingsCalibration(),
	desc: faker.random.words(3),
	type: faker.random.word(),
	number: faker.random.alphaNumeric(),
	name: faker.random.word(),
	...overrides,
});