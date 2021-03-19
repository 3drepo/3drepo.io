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

import { isEmpty } from 'lodash';
import React from 'react';
import { MEASURE_TYPE } from '../../../../../../modules/measurements/measurements.constants';
import { IMeasure } from '../measureItem/measureItem.component';
import { MeasurementsList } from './measurementsList.component';

interface IProps {
	pointMeasurements: IMeasure[];
	lengthMeasurements: IMeasure[];
	areaMeasurements: IMeasure[];
	units: string;
	setMeasurementCheck?: (uuid, type) => void;
	setMeasurementCheckAll?: (type) => void;
	removeMeasurement: (uuid) => void;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementName: (uuid, type, name) => void;
	modelUnit: string;
}

export const AllMeasurementsList = (props: IProps) => (
	<div>
		{
			!isEmpty(props.pointMeasurements) &&
			<MeasurementsList {...props} measureType={MEASURE_TYPE.POINT} measurements={props.pointMeasurements} />
		}
		{
			!isEmpty(props.lengthMeasurements) &&
			<MeasurementsList {...props} measureType={MEASURE_TYPE.LENGTH} measurements={props.lengthMeasurements} />
		}
		{
			!isEmpty(props.areaMeasurements) &&
			<MeasurementsList {...props} measureType={MEASURE_TYPE.AREA} measurements={props.areaMeasurements} />
		}
	</div>
);
