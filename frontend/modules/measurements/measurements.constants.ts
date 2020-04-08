/**
 *  Copyright (C) 2020 3D Repo Ltd
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

export const DEFAULT = 'default';
export const ACTIVE = 'active';

export const MEASURE_TYPE = {
	POINT: -1,
	LENGTH: 0,
	AREA: 1,
};

export const MEASURE_TYPE_NAME = {
	[MEASURE_TYPE.POINT]: 'Point',
	[MEASURE_TYPE.LENGTH]: 'Length',
	[MEASURE_TYPE.AREA]: 'Area',
};

export const MEASURE_TYPE_STATE_MAP = {
	[MEASURE_TYPE.POINT]: 'pointMeasurements',
	[MEASURE_TYPE.LENGTH]: 'lengthMeasurements',
	[MEASURE_TYPE.AREA]: 'areaMeasurements',
};

export const MEASURING_TYPE = {
	CSAM: 'Custom surface area measurement',
	SAM: 'Surface area measurement',
	MINIMUM_DISTANCE: 'Minimum distance',
	POINT: 'Point',
	POINT_TO_POINT: 'Point to point',
	RAY_CAST: 'Ray cast',
};

export const MEASURING_MODE = {
	POINT: 'PointPin',
	RAY_CAST: 'Raycast',
	MINIMUM_DISTANCE: 'MinimumDistance',
	SAM: 'SurfaceArea',
	CSAM: 'PolygonArea',
	POINT_TO_POINT: 'Point',
};
