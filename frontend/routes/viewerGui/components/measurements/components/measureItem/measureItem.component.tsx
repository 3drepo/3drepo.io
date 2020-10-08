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

import Tooltip from '@material-ui/core/Tooltip';
import RemoveIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import { cond, matches, stubTrue } from 'lodash';

import { parseHex } from '../../../../../../helpers/colors';
import { getColor, MEASURE_TYPE } from '../../../../../../modules/measurements/measurements.constants';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
import {
	Actions,
	AxisLabel,
	AxisValue,
	Container,
	MeasurementPoint,
	MeasurementValue,
	StyledCheckbox,
	StyledCheckboxCell,
	StyledForm,
	StyledTextField
} from './measureItem.styles';

export interface IColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

interface IPosition {
	x: number;
	y: number;
	z: number;
}

export interface IMeasure {
	uuid: string;
	name: string;
	positions?: IPosition[];
	position?: number[];
	value: number;
	color: IColor;
	checked: boolean;
	customColor: IColor;
	type: number;
}

interface IProps extends IMeasure {
	index: number;
	typeName: string;
	removeMeasurement: (uuid) => void;
	units: string;
	setMeasurementColor: (uuid, color) => void;
	setMeasurementCheck?: (uuid, type) => void;
	setMeasurementName: (uuid, type, name) => void;
	modelUnit: string;
	colors: string[];
}

const roundNumber = (num: number, numDP: number) => {
	const factor = Math.pow(10, numDP);
	return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const getValue = (measureValue: number, units: string, type: number, modelUnits: string) => {
	const isAreaMeasurement = type === MEASURE_TYPE.AREA;

	const factor = isAreaMeasurement ? 2 : 1;

	const roundedValueMM = cond([
			[matches('mm'), () => Math.round(measureValue)],
			[matches('cm'), () => roundNumber(measureValue, 1 * factor) * Math.pow(10, factor)],
			[matches('dm'), () => roundNumber(measureValue, 2 * factor) * Math.pow(100, factor)],
			[matches('m'),  () => roundNumber(measureValue, 3 * factor) * Math.pow(1000, factor)],
			[stubTrue, () => Math.round(measureValue)]
	])(modelUnits);

	const valueInUnits = (units === 'mm') ? Math.round(roundedValueMM)
		: roundNumber(roundedValueMM / Math.pow(1000, factor), 2);

	return Number.parseFloat(valueInUnits.toPrecision(7)).toString(); // Unity only gives 7sf
};

export const getUnits = (units: string, type: number) => {
	if (type === MEASURE_TYPE.AREA) {
		return (
			<>
				{units}<sup>2</sup>
			</>
		);
	}
	return units;
};

export const MeasureItem = ({
	uuid, index, name, typeName, value, units, color, removeMeasurement, type, position, customColor, checked, ...props
}: IProps) => {
	const textFieldRef = React.useRef(null);

	const handleRemoveMeasurement = () => {
		removeMeasurement(uuid);
	};

	const handleCheckChange = () => {
		if (props.setMeasurementCheck) {
			props.setMeasurementCheck(uuid, type);
		}
	};

	const handleColorChange = (hexColor) => {
		const { red, green, blue } = parseHex(hexColor);

		props.setMeasurementColor(uuid, {
			r: red,
			g: green,
			b: blue,
			a: 1,
		});
	};

	const handleSave = ({ target: { value: newName }}) => props.setMeasurementName(uuid, newName, type);

	const handleSubmit = () => textFieldRef.current.saveChange();

	const isPointTypeMeasure = type === MEASURE_TYPE.POINT;

	return (
		<Container tall={Number(isPointTypeMeasure)}>
			{
				!isPointTypeMeasure &&
				<StyledCheckboxCell>
					<StyledCheckbox
						color="primary"
						onChange={handleCheckChange}
						checked={checked}
					/>
				</StyledCheckboxCell>
			}
			<Formik
				initialValues={{ newName: name }}
				onSubmit={handleSubmit}
			>
				<Tooltip title={name} placement="bottom">
					<StyledForm>
						<StyledTextField
							ref={textFieldRef}
							left={Number(isPointTypeMeasure)}
							requiredConfirm
							fullWidth
							value={name}
							name="newName"
							mutable
							onChange={handleSave}
							inputProps={{ maxLength: 15 }}
							disableShowDefaultUnderline
						/>
					</StyledForm>
				</Tooltip>
			</Formik>
			<Actions>
				{
					isPointTypeMeasure ?
					<>
						<div>
							<MeasurementPoint>
								<AxisLabel>x:</AxisLabel>
								<AxisValue>{getValue(position[0], units, type, props.modelUnit)} {getUnits(units, type)}</AxisValue>
							</MeasurementPoint>
							<MeasurementPoint>
								<AxisLabel>y:</AxisLabel>
								<AxisValue>{getValue(-position[2], units, type, props.modelUnit)} {getUnits(units, type)}</AxisValue>
							</MeasurementPoint>
							<MeasurementPoint>
								<AxisLabel>z:</AxisLabel>
								<AxisValue>{getValue(position[1], units, type, props.modelUnit)} {getUnits(units, type)}</AxisValue>
							</MeasurementPoint>
						</div>
					</>
					: <MeasurementValue>{getValue(value, units, type, props.modelUnit)} {getUnits(units, type)}</MeasurementValue>
				}
				<ColorPicker
					value={getColor(customColor || color)}
					onChange={handleColorChange}
					disableUnderline
					predefinedColors={props.colors}
				/>
				<SmallIconButton
					Icon={RemoveIcon}
					tooltip="Remove"
					onClick={handleRemoveMeasurement}
				/>
			</Actions>
		</Container>
	);
};
