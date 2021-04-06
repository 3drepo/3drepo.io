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

import React from 'react';
import { IMeasure } from '../../../measurements/components/measureItem/measureItem.component';

// tslint:disable-next-line:max-line-length
import { AllMeasurementsList } from '../../../measurements/components/measurementsList/allMeasurementsList.component';
import { MeasuringType } from '../../../measurements/components/measuringType';
import { Content } from '../riskDetails/riskDetails.styles';

interface IProps {
	active: boolean;
	lengthMeasurements: IMeasure[];
	areaMeasurements: IMeasure[];
	units: string;
	removeMeasurement: (uuid) => void;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementName: (uuid, type, name) => void;
}

export const ShapesFormTab = ({
	active,
	...props
}: IProps) => {
	return (
		<Content active={active}>
			<MeasuringType basicTypes />
			<AllMeasurementsList {...props} pointMeasurements={[]} modelUnit={props.units} />
		</Content>
		);
};
