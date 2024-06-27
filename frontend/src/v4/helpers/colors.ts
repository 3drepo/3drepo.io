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

import { memoize } from 'lodash';

export const parseHex = (hex) => {
	if (Array.isArray(hex)) { // if is already a rgb array return it
		return hex;
	}

	hex = hex.replace(/^#/, '');

	if (hex.length <= 4) {
		hex = hex.map((v) => [v, v]).flat();
	}

	const red = parseInt(hex.substr(0, 2), 16);
	const green = parseInt(hex.substr(2, 2), 16);
	const blue = parseInt(hex.substr(4, 2), 16);
	let alpha: any = {alpha: parseInt(hex.substr(6, 2), 16)};

	if ( isNaN(alpha.alpha)) {
		alpha = {};
	}

	return {red, green, blue, ...alpha};
};

export const hexToGLColor = (hex) => hexToArray(hex).map((v) => v / 255);

export const GLToHexColor = (glColors) => '#' + glColors.map((c) => componentToHex( Math.round(c * 255))).join('');

export const hexToArray = (hex): number[] => Object.values(parseHex(hex));

export const hexToRgba = (hex, alpha = 1) => {
	const {red, green, blue, alpha: alphaColor} = parseHex(hex);
	return `rgba(${red}, ${green}, ${blue}, ${alphaColor || alpha})`;
};

export const rgbaToHex = memoize((rgbaColor): string => {
	// eslint-disable-next-line prefer-const
	let [r, g, b, a] = rgbaColor.match(/[.\d]+/g).map(Number);
	a = Math.round(a * 255);
	return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a);
});

export const componentToHex = memoize((c) => {
	if (isNaN(c)) {
		return '';
	}

	const hex = c.toString(16).toUpperCase();
	return hex.length === 1 ? '0' + hex : hex;
});

export const getGroupHexColor = (groupColor) => {
	if (groupColor) {
		return '#' + groupColor.map(componentToHex).join('');
	}
	return '#ffffff'; // Removed the import that created a circular dependency
};

export const getRandomColor = () => {
	return [
		parseInt((Math.random() * 255).toFixed(0), 10),
		parseInt((Math.random() * 255).toFixed(0), 10),
		parseInt((Math.random() * 255).toFixed(0), 10)
	];
};

export const hasTransparency = (color) => Array.isArray(color) ? color.length > 3 : color.length === 9;

export const getTransparency = (color) => (Array.isArray(color) ? color[3] : parseInt(color.slice(7), 16) ) / 255;

export const hexColorRE = /^\#[0-F]{2}[0-F]{2}[0-F]{2}$/i;
