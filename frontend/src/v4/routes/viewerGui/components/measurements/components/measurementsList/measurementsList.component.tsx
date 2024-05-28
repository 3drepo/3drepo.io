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

import { useState } from 'react';

import MoreIcon from '@mui/icons-material/ChevronRight';
import LessIcon from '@mui/icons-material/ExpandMore';

import { MEASURE_TYPE, MEASURE_TYPE_NAME} from '../../../../../../modules/measurements/measurements.constants';
import { MeasureItem } from '../measureItem/';
import { getUnits, getValue, IMeasure } from '../measureItem/measureItem.component';
import {
	List,
	SectionHeader,
	StyledCheckboxCell,
	StyledIconButton,
	Title,
	Total,
	Units,
	Container,
} from './measurementsList.styles';

interface IProps {
	measurements: IMeasure[];
	units: string;
	removeMeasurement: (uuid) => void;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementName: (uuid, type, name) => void;
	measureType: number;
	modelUnit: string;
	colors: string[];
	canEdit?: boolean;
}

const getTotal = (measurements, type, units, modelUnit) => {
	const sum = measurements.reduce((acc, { value }) =>  acc + value, 0);
	return getValue(sum, units, type, modelUnit);
};

export const MeasurementsList = ({
	measurements, units, measureType, removeMeasurement, canEdit,
	setMeasurementColor, setMeasurementName, colors, ...props
}: IProps) => {
	const [expanded, setExpanded] = useState(true);

	const handleOnClick = () => setExpanded(!expanded);

	const isCountable = ![MEASURE_TYPE.POINT, MEASURE_TYPE.ANGLE].includes(measureType);

	return (
		<Container>
			<SectionHeader>
				<StyledIconButton onClick={handleOnClick}>
					{expanded ? <LessIcon /> : <MoreIcon />}
				</StyledIconButton>

				<Title>{MEASURE_TYPE_NAME[measureType]}</Title>
				{
					isCountable &&
					<>
						<Total>
							Total:&nbsp;
							{getTotal(measurements, measureType, units, props.modelUnit)}
						</Total>
						<Units sum>{getUnits(units, measureType)}</Units>
					</>
				}
			</SectionHeader>
			{expanded &&
				<List>
					{measurements.map((measurement, index) => (
						<MeasureItem
							key={measurement.uuid}
							index={index + 1}
							typeName={MEASURE_TYPE_NAME[measureType]}
							units={units}
							removeMeasurement={removeMeasurement}
							setMeasurementColor={setMeasurementColor}
							setMeasurementName={setMeasurementName}
							{...measurement}
							colors={colors}
							canEdit={canEdit ?? true}
						/>
					))}
				</List>
			}
		</Container>
	);
};
