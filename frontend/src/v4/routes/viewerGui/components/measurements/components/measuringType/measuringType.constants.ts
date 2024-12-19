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

import CSAMIcon from '@assets/icons/measurements/custom_surface_area_measurement.svg';
import MinimumDistanceIcon from '@assets/icons/measurements/minimum_distance.svg';
import PointIcon from '@assets/icons/measurements/point.svg';
import PointToPointIcon from '@assets/icons/measurements/point_to_point.svg';
import RayCastIcon from '@assets/icons/measurements/ray_cast.svg';
import SAMIcon from '@assets/icons/measurements/surface_area_measurement.svg';

import {
	MEASURING_TYPE
} from '@/v4/modules/measurements/measurements.constants';

import { VIEWER_MEASURING_MODE } from '@/v4/constants/viewer';
import PolylineIcon from '@assets/icons/measurements/polyline.svg';
import AngleIcon from '@assets/icons/measurements/angle.svg';
import SlopeIcon from '@assets/icons/measurements/slope.svg';

export const MEASURING_TYPES = [
	{
		name: MEASURING_TYPE.POINT,
		mode: VIEWER_MEASURING_MODE.POINT,
		Icon: PointIcon,
	},
	{
		name: MEASURING_TYPE.POINT_TO_POINT,
		mode: VIEWER_MEASURING_MODE.POINT_TO_POINT,
		Icon: PointToPointIcon,
	},
	{
		name: MEASURING_TYPE.POLYLINE,
		mode: VIEWER_MEASURING_MODE.POLYLINE,
		Icon: PolylineIcon,
	},
	{
		name: MEASURING_TYPE.RAY_CAST,
		mode: VIEWER_MEASURING_MODE.RAY_CAST,
		Icon: RayCastIcon,
	},
	{
		name: MEASURING_TYPE.MINIMUM_DISTANCE,
		mode: VIEWER_MEASURING_MODE.MINIMUM_DISTANCE,
		Icon: MinimumDistanceIcon,
	},
	{
		name: MEASURING_TYPE.ANGLE,
		mode: VIEWER_MEASURING_MODE.ANGLE,
		Icon: AngleIcon,
	},
	{
		name: MEASURING_TYPE.SLOPE,
		mode: VIEWER_MEASURING_MODE.SLOPE,
		Icon: SlopeIcon,
	},
	{
		name: MEASURING_TYPE.SAM,
		mode: VIEWER_MEASURING_MODE.SAM,
		Icon: SAMIcon,
	},
	{
		name: MEASURING_TYPE.CSAM,
		mode: VIEWER_MEASURING_MODE.CSAM,
		Icon: CSAMIcon,
	},
];

export const BASIC_TYPES = [
	VIEWER_MEASURING_MODE.POINT_TO_POINT,
	VIEWER_MEASURING_MODE.CSAM,
	VIEWER_MEASURING_MODE.POLYLINE,
	VIEWER_MEASURING_MODE.ANGLE,
	VIEWER_MEASURING_MODE.SLOPE,
];
