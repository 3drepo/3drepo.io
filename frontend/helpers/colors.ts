import { memoize } from 'lodash';
import { WHITE } from '../styles';

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
	const {red, green, blue} = parseHex(hex);
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const rgbaToHex = memoize((rgbaColor): string => {
	// tslint:disable-next-line:prefer-const
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
	return WHITE;
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
