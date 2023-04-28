/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { rgbToHex as muiRgbToHex, hexToRgb as muiHexToRgb } from '@mui/material';

type GroupColor = {
	color?: any,
	opacity?: number,
};
export type RgbArray = [number, number, number];
export type RgbGroupColor = GroupColor & { color?: RgbArray };
export type HexGroupColor = GroupColor & { color?: string };

const rgbToHex = (color: RgbArray) => color && muiRgbToHex(`rgb(${color.join()})`);
export const rgbGroupColorToHex = ({ opacity, color }: RgbGroupColor): HexGroupColor => ({
	opacity,
	color: rgbToHex(color),
});

const hexToRgb = (color) => color && muiHexToRgb(color).slice(4, -1).split(',').map(Number) as RgbArray;
export const hexGroupColorToRgb = ({ opacity, color }: HexGroupColor): RgbGroupColor => ({
	opacity,
	color: hexToRgb(color),
});

export const getColorIsValid = (color: string) => !color || /[0-9a-f]{6}/.test(color?.toLocaleLowerCase());

export const UNSET_RGB_COLOR: RgbArray = [120, 120, 120];
export const UNSET_HEX_COLOR = '#787878';
export const DEFAULT_SUGGESTED_HEX_COLORS = [
	// transparent,
	'#ffffff',
	'#75140c',
	'#d32c1f',
	'#eb5281',
	'#ef87aa',

	'#dc88f5',
	'#b160e4',
	'#925fb1',
	'#7356f6',
	'#023adf',
	'#8ab2f9',

	'#f5d849',
	'#a87f3d',
	'#ef7f31',
	'#d65a26',
	'#b6bcc1',
	'#697683',

	'#4681b2',
	'#49a8ee',
	'#4f97d7',
	'#53b9d1',
	'#57b89d',
	'#65c978',
];
