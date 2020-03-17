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
import {MEASURE_TYPE} from '../../../../../../modules/measure/measure.constants';
import { ColorPicker } from '../../../../../components/colorPicker/colorPicker.component';
import { SmallIconButton } from '../../../../../components/smallIconButon/smallIconButton.component';
import { Name as NameText, NameWrapper} from '../../../tree/components/treeNode/treeNode.styles';
import { Actions, Container, MeasurementValue } from './measureItem.styles';

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
	positions: IPosition[];
	value: number;
	color: IColor;
	type: number;
}

interface IProps extends IMeasure {
	index: number;
	typeName: string;
	removeMeasurement: (uuid) => void;
	units: string;
	setMeasurementColor: (uuid, color) => void;
}

const getValue = (value: number, units: string, type: number) => {
	if (type === MEASURE_TYPE.LENGTH) {
		return cond([
			[matches('mm'), () => Math.trunc(value)],
			[matches('cm'), () => Math.trunc(value / 10)],
			[matches('m'), () => Number(value / 1000).toFixed(2)],
			[stubTrue, () => Math.trunc(value)]
		])(units);
	}

	if (type === MEASURE_TYPE.AREA) {
		return cond([
			[matches('mm'), () => Math.trunc(value)],
			[matches('cm'), () => Math.trunc(value / 100)],
			[matches('m'), () => Number(value / 1000000).toFixed(2)],
			[stubTrue, () => Math.trunc(value)]
		])(units);
	}

	return Math.trunc(value);
};

export const getColor = ({ r, g, b }) => `#${[r, g, b].map(componentToHex).join('')}`;

export const MeasureItem = ({
	uuid, index, typeName, value, units, color, removeMeasurement, ...props
}: IProps) => {
	const handleRemoveMeasurement = () => {
		removeMeasurement(uuid);
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
		<Container>
			<Name>
				{`${typeName} ${index}`}
			</Name>
			<Actions>
				<MeasurementValue>{getValue(value, units, props.type)} {units}</MeasurementValue>
				<ColorPicker
					value={getColor(color)}
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

export const Name = ({ children }) => (
	<NameWrapper>
		<NameText>
			{children}
		</NameText>
	</NameWrapper>
);
