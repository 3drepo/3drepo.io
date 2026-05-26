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
import { useEffect } from 'react';
import { MEASURE_TYPE } from '../../../../../../modules/measurements/measurements.constants';
import { EmptyStateInfo } from '../../../../../components/components.styles';
import { IMeasure } from '../../../measurements/components/measureItem/measureItem.component';

// eslint-disable-next-line max-len
import { AllMeasurementsList } from '../../../measurements/components/measurementsList/allMeasurementsList.component';
import { MeasuringType } from '../../../measurements/components/measuringType';
import { Content } from '../riskDetails/riskDetails.styles';
import {MeasuringTypeContainer} from './shapesFormTab.styles';

interface IProps {
	active: boolean;
	addButtonsEnabled: boolean;
	shapes: IMeasure[];
	units: string;
	slopeUnits: string;
	measureMode: string;
	canEdit: boolean;
	removeMeasurement: (uuid) => void;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementName: (uuid, type, name) => void;
	setMeasureMode: (mode) => void;
}

export const ShapesFormTab = ({
	active,
	addButtonsEnabled,
	measureMode,
	setMeasureMode,
	...props
}: IProps) => {
	const shapes = props.shapes || [];
	const areaMeasurements = shapes.filter(({type}) => type === MEASURE_TYPE.AREA);
	const lengthMeasurements = shapes.filter(({type}) => type === MEASURE_TYPE.LENGTH);
	const angleMeasurements = shapes.filter(({type}) => type === MEASURE_TYPE.ANGLE);
	const slopeMeasurements = shapes.filter(({type}) => type === MEASURE_TYPE.SLOPE);

	useEffect(() => {
		if (!active) {
			setMeasureMode('');
		}
	}, [active]);

	useEffect(() => () => setMeasureMode(''), []);

	return (
		<Content active={active}>
			{addButtonsEnabled && props.canEdit &&
				<MeasuringTypeContainer>
					Create markup&nbsp; &nbsp;
					<MeasuringType basicTypes setMeasureMode={setMeasureMode} measureMode={measureMode} />
				</MeasuringTypeContainer>
			}
			<AllMeasurementsList
				{...props}
				areaMeasurements={areaMeasurements}
				lengthMeasurements={lengthMeasurements}
				pointMeasurements={[]}
				angleMeasurements={angleMeasurements}
				slopeMeasurements={slopeMeasurements}
				modelUnit={props.units}
				units={props.units === 'ft' ? props.units : 'm'}
				slopeUnits={props.slopeUnits}
			/>

			{isEmpty(shapes) && <EmptyStateInfo>No shapes have been attached yet</EmptyStateInfo>}

		</Content>
		);
};
