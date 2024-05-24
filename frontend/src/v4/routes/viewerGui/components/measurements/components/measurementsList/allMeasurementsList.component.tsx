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

import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { GLToHexColor } from '../../../../../../helpers/colors';
import { MEASURE_TYPE } from '../../../../../../modules/measurements/measurements.constants';
import { IMeasure } from '../measureItem/measureItem.component';
import { MeasurementsList } from './measurementsList.component';

export interface IProps {
	pointMeasurements: IMeasure[];
	lengthMeasurements: IMeasure[];
	areaMeasurements: IMeasure[];
	angleMeasurements: IMeasure[];
	units: string;
	removeMeasurement: (uuid) => void;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementName: (uuid, type, name) => void;
	modelUnit: string;
	canEdit?: boolean;
}

export const AllMeasurementsList = ({areaMeasurements, lengthMeasurements, pointMeasurements, angleMeasurements, ...props}: IProps) => {
	const [colors, setColors] = useState([]);

	useEffect(() => {

		const addColors = [
			...(angleMeasurements || []),
			...(areaMeasurements || []),
			...(lengthMeasurements || []),
			...(pointMeasurements || [])
		].map(({customColor, color}) => GLToHexColor(customColor || color));

		setColors(Array.from(new Set(addColors)));
	}, [pointMeasurements, lengthMeasurements, areaMeasurements, angleMeasurements]);

	return (
		<div>
			{
				!isEmpty(pointMeasurements) &&
				<MeasurementsList {...props} measureType={MEASURE_TYPE.POINT} measurements={pointMeasurements} colors={colors} />
			}
			{
				!isEmpty(lengthMeasurements) &&
				<MeasurementsList {...props} measureType={MEASURE_TYPE.LENGTH} measurements={lengthMeasurements} colors={colors} />
			}
			{
				!isEmpty(areaMeasurements) &&
				<MeasurementsList {...props} measureType={MEASURE_TYPE.AREA} measurements={areaMeasurements} colors={colors} />
			}
			{
				!isEmpty(angleMeasurements) &&
				<MeasurementsList {...props} measureType={MEASURE_TYPE.ANGLE} measurements={angleMeasurements} colors={colors} />
			}
		</div>
	);
};
