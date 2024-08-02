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

import { CalibrationVectors, Vector, Vector1D } from './calibration.types';

export const EMPTY_VECTOR = [null, null] as Vector<any>;
export const EMPTY_VECTOR_1D = [null, null] as Vector1D;

export const EMPTY_CALIBRATION = {
	horizontal: {
		model: EMPTY_VECTOR,
		drawing: EMPTY_VECTOR,
	}, 
	verticalRange: EMPTY_VECTOR_1D,
} as CalibrationVectors;
