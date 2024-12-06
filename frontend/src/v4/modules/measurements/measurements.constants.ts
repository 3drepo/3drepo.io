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

export const MEASURE_TYPE = {
	POINT: -1,
	LENGTH: 0,
	AREA: 1,
	ANGLE: 2,
	SLOPE: 3,
};

export const MEASURE_TYPE_NAME = {
	[MEASURE_TYPE.POINT]: 'Point',
	[MEASURE_TYPE.LENGTH]: 'Length',
	[MEASURE_TYPE.AREA]: 'Area',
	[MEASURE_TYPE.ANGLE]: 'Angle',
	[MEASURE_TYPE.SLOPE]: 'Slope',
};

export const MEASURE_TYPE_STATE_MAP = {
	[MEASURE_TYPE.POINT]: 'pointMeasurements',
	[MEASURE_TYPE.LENGTH]: 'lengthMeasurements',
	[MEASURE_TYPE.AREA]: 'areaMeasurements',
	[MEASURE_TYPE.ANGLE]: 'angleMeasurements',
	[MEASURE_TYPE.SLOPE]: 'slopeMeasurements',
};

export const MEASURING_TYPE = {
	CSAM: 'Custom Polygonal Area',
	SAM: 'Surface Area',
	MINIMUM_DISTANCE: 'Minimal Distance',
	POINT: 'Locate Point',
	POINT_TO_POINT: 'Point to Point',
	RAY_CAST: 'Ray Cast',
	ANGLE: 'Angle',
	SLOPE: 'Slope',
	POLYLINE: 'Polyline',
};
