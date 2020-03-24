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

import RemoveIcon from '@material-ui/icons/Close';
import { cond, matches, stubTrue } from 'lodash';

import { componentToHex, parseHex } from '../../../../../../helpers/colors';
import { MEASURE_TYPE } from '../../../../../../modules/measure/measure.constants';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
import { NameWrapper} from '../../../tree/components/treeNode/treeNode.styles';
import {
	Actions,
	Container,
	MeasurementPoint,
	MeasurementValue,
	StyledCheckbox,
	StyledCheckboxCell,
	StyledName,
	Units,
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
}

export const getValue = (value: number, units: string, type: number) => {
	if (type === MEASURE_TYPE.AREA) {
		return cond([
			[matches('mm'), () => Math.trunc(value)],
			[matches('cm'), () => Math.trunc(value / 100)],
			[matches('m'), () => Number(value / 1000000).toFixed(2)],
			[stubTrue, () => Math.trunc(value)]
		])(units);
	}

	return cond([
		[matches('mm'), () => Math.trunc(value)],
		[matches('cm'), () => Math.trunc(value / 10)],
		[matches('m'), () => Number(value / 1000).toFixed(2)],
		[stubTrue, () => Math.trunc(value)]
	])(units);
};

export const getColor = ({ r, g, b }) => `#${[r, g, b].map(componentToHex).join('')}`;

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

	return (
		<Container tall={Number(type === MEASURE_TYPE.POINT)}>
			{
				type !== MEASURE_TYPE.POINT &&
				<StyledCheckboxCell width="36px">
					<StyledCheckbox
						onChange={handleCheckChange}
						checked={checked}
					/>
				</StyledCheckboxCell>
			}
			<Name left={Number(type === MEASURE_TYPE.POINT)}>
				{name}
			</Name>
			<Actions>
				{
					typeName === 'Point' ?
					<>
						<div>
							<MeasurementPoint>x: {getValue(position[0], units, type)}</MeasurementPoint>
							<MeasurementPoint>y: {getValue(position[1], units, type)}</MeasurementPoint>
							<MeasurementPoint>z: {getValue(position[2], units, type)}</MeasurementPoint>
						</div>
						<Units>{getUnits(units, type)}</Units>
					</>
					: <MeasurementValue>{getValue(value, units, type)} {getUnits(units, type)}</MeasurementValue>
				}
				<ColorPicker
					value={getColor(customColor || color)}
					onChange={handleColorChange}
					disableUnderline
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

export const Name = ({ children, left }) => (
	<NameWrapper>
		<StyledName left={left}>
			{children}
		</StyledName>
	</NameWrapper>
);
