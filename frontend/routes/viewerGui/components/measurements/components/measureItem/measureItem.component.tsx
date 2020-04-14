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

import RemoveIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import { cond, eq, matches, stubTrue } from 'lodash';
import React from 'react';

import { parseHex } from '../../../../../../helpers/colors';
import { getColor, MEASURE_TYPE } from '../../../../../../modules/measurements/measurements.constants';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
import { StyledForm } from '../../../views/components/viewItem/viewItem.styles';
import {
	Actions,
	AxisLabel,
	AxisValue,
	Container,
	MeasurementPoint,
	MeasurementValue,
	StyledCheckbox,
	StyledCheckboxCell,
	StyledTextField,
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

export const getValue = (measureValue: number, units: string, type: number, modelUnit: string) => {
	const isAreaMeasurement = type === MEASURE_TYPE.AREA;
	const isRecalculationNeeded = modelUnit !== 'mm';
	const value = cond([
		[(is) => eq(is, true), () => isAreaMeasurement ? measureValue * 1000 * 1000 : measureValue * 1000],
		[stubTrue, () => measureValue],
	])(isRecalculationNeeded);

	if (isAreaMeasurement) {
		return cond([
			[matches('mm'), () => Math.round(value).toString()],
			[matches('cm'), () => Math.round(value / 100).toString()],
			[matches('m'), () => (Math.round((Number(value / 1000000) + Number.EPSILON) * 100) / 100).toFixed(2)],
			[stubTrue, () => Math.round(value).toString()]
		])(units);
	}

	return cond([
		[matches('mm'), () => Math.round(value).toString()],
		[matches('cm'), () => Math.round(value / 10).toString()],
		[matches('m'), () => (Math.round((Number(value / 1000) + Number.EPSILON) * 100) / 100).toFixed(2)],
		[stubTrue, () => Math.round(value).toString()]
	])(units);
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
						onKeyDown={this._handleKeyDown}
						inputProps={{ maxLength: 15 }}
						disableShowDefaultUnderline
					/>
				</StyledForm>
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
								<AxisValue>{getValue(position[1], units, type, props.modelUnit)} {getUnits(units, type)}</AxisValue>
							</MeasurementPoint>
							<MeasurementPoint>
								<AxisLabel>z:</AxisLabel>
								<AxisValue>{getValue(position[2], units, type, props.modelUnit)} {getUnits(units, type)}</AxisValue>
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
