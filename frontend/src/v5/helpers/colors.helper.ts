/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { isNumber, memoize } from 'lodash';

type GroupColor = {
	color?: any,
	opacity?: number,
};
export type RgbArray = [number, number, number, number?];
export type RgbGroupColor = GroupColor & { color?: RgbArray };
export type HexGroupColor = GroupColor & { color?: string };

// Misc
export const contrastColor = ({ hex = '#FFFFFF', threshold }) => {
	if (!hex) return '#000000';

	if (hex.indexOf('#') === 0) {
		hex = hex.slice(1);
	}
	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	return (r * 0.299 + g * 0.587 + b * 0.114) > (threshold ?? 127)
		? '#000000'
		: '#FFFFFF';
};

export const isLight = (hex: string, threshold?: number) => contrastColor({ hex, threshold }) !== '#FFFFFF';

export const getRandomRgbColor = () => ([
	parseInt((Math.random() * 255).toFixed(0), 10),
	parseInt((Math.random() * 255).toFixed(0), 10),
	parseInt((Math.random() * 255).toFixed(0), 10),
]);

export const componentToHex = memoize((c) => {
	if (isNaN(c)) return '';
	const hex = c.toString(16).toUpperCase();
	return hex.length === 1 ? '0' + hex : hex;
});

export const getGroupHexColor = (groupColor) => {
	if (groupColor) {
		return '#' + groupColor.map(componentToHex).join('');
	}
	return '#ffffff'; // Removed the import that created a circular dependency
};

export const decimalToHex = (decimal) => decimal.toString(16).padStart(2, '0');

export const hexColorRE = /^#[0-9A-F]{6}$/i;
export const getColorHexIsValid = (color: string) => !color || hexColorRE.test(color);

// Transparency
export const hexToOpacity = (hex: string, opacityInPercentage: number): string => {
	const formattedOpacity = Math.floor((opacityInPercentage / 100) * 255)
		.toString(16).padStart(2, '0');
	return hex + formattedOpacity;
};
export const hasTransparency = (color) => Array.isArray(color) ? color.length > 3 : color.length === 9;
export const getTransparency = (color) => (Array.isArray(color) ? color[3] : parseInt(color.slice(7), 16)) / 255;

// RGB converters
export const rgbToHex = (color: RgbArray) => color && muiRgbToHex(`rgb(${color.filter(isNumber).join()})`);
export const rgbGroupColorToHex = ({ opacity, color }: RgbGroupColor): HexGroupColor => ({
	opacity,
	color: rgbToHex(color),
});

// Hex converters
const rgbaValuesRE = /\((.*)\)/;
export const hexToRgb = (color) => {
	const rgbcolor = color && muiHexToRgb(color).match(rgbaValuesRE)[1].split(',').map(Number);
	if (rgbcolor.length === 4 ) {
		rgbcolor[3] = (rgbcolor[3] ?? 1) * 255;
	}

	return rgbcolor;
};

export const hexGroupColorToRgb = ({ opacity, color }: HexGroupColor): RgbGroupColor => ({
	opacity,
	color: hexToRgb(color) as any,
});
export const hexToGLColor = (hex) => hexToRgb(hex).map((v) =>  v / 255);
export const hexToDecimal = (hex) => parseInt(hex, 16);

// GL Converters
export const GLToHexColor = (glColors) => '#' + glColors.map((c) => componentToHex( Math.round(c * 255))).join('');
