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

import LessIcon from '@material-ui/icons/ExpandLess';
import MoreIcon from '@material-ui/icons/ExpandMore';

import { MEASURE_TYPE, MEASURE_TYPE_NAME} from '../../../../../../modules/measure/measure.constants';
import { getUnits, getValue, IMeasure, MeasureItem } from '../measureItem/measureItem.component';
import { StyledCheckbox, Units } from '../measureItem/measureItem.styles';
import { List, SectionHeader, StyledCheckboxCell, StyledIconButton, Title, Total } from './measurementsList.styles';

interface IProps {
	measurements: IMeasure[];
	units: string;
	setMeasurementCheck?: (uuid, type) => void;
	setMeasurementCheckAll?: (type) => void;
	removeMeasurement: (uuid) => void;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementName: (uuid, type, name) => void;
	measureType: number;
}

const getTotal = (measurements, type, units) => {
	const sum = measurements.reduce((acc, { checked, value }) => {
		if (checked) {
			return acc + value;
		}
		return acc;
	}, 0);

	return getValue(sum, units, type);
};

export const MeasurementsList = ({
	measurements, units, measureType, setMeasurementCheck, setMeasurementCheckAll, removeMeasurement,
	setMeasurementColor, setMeasurementName,
}: IProps) => {
	const [expanded, setExpanded] = React.useState(false);

	const handleOnClick = () => setExpanded(!expanded);

	const handleOnChange = () => setMeasurementCheckAll(measureType);

	const isChecked = measurements.every(({checked}) => checked);

	const isCountable = ![MEASURE_TYPE.POINT].includes(measureType);

	const getTitleProperties = isCountable ? ({}) : ({
		left: true,
	});

	return (
		<>
			<SectionHeader>
				<StyledIconButton onClick={handleOnClick}>
					{expanded ? <LessIcon /> : <MoreIcon />}
				</StyledIconButton>
				{isCountable && <StyledCheckboxCell width="36px">
					<StyledCheckbox
						onChange={handleOnChange}
						checked={isChecked}
					/>
				</StyledCheckboxCell>}
				<Title {...getTitleProperties}>{MEASURE_TYPE_NAME[measureType]}</Title>
				{
					isCountable &&
					<>
						<Total>
							Selected total:&nbsp;
							{getTotal(measurements, measureType, units)}
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
							setMeasurementCheck={setMeasurementCheck}
							setMeasurementName={setMeasurementName}
							{...measurement}
						/>
					))}
				</List>
			}
		</>
	);
};
