/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { dispatch } from '@/v5/helpers/redux.helpers';
import { MEASURE_TYPE_NAME } from '../modules/measurements/measurements.constants';
import { ViewerGuiActions } from '../modules/viewerGui';

export const generateName = (measurement, measurements) => {
	let index = 1;
	measurements.forEach((element) => {
		if (element.type === measurement.type) {
			index ++;
		}
	});

	return `${MEASURE_TYPE_NAME[measurement.type]} ${index}`;
};

export const disableConflictingMeasurementActions = () => {
	dispatch(ViewerGuiActions.setClipEdit(false));
};
