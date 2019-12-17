import { WHITE } from './../styles/colors';

const parseHex = (hex) => {
	hex = hex.replace(/^#/, '');
	if (hex.length === 6) {
		hex += 'FF' ;
	}

	if (hex.length === 3) {
		hex += 'F';
	}

	if (hex.length === 4) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[4];
	}

	const red = parseInt(hex.substr(0, 2), 16);
	const green = parseInt(hex.substr(2, 2), 16);
	const blue = parseInt(hex.substr(4, 2), 16);
	const alpha = parseInt(hex.substr(6, 2), 16);

	return {red, green, blue, alpha};
};

export const hexToGLColor = (hex) => {
	const {red, green, blue, alpha} = parseHex(hex);
	return [red / 255, green / 255, blue / 255, alpha / 255];
};

export const hexToArray = (hex) => {
	const {red, green, blue, alpha} = parseHex(hex);
	return [red, green, blue, alpha];
};

export const hexToRgba = (hex, alpha = 1) => {
	const {red, green, blue} = parseHex(hex);
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const rgbaToHex = (hex) => {
	const rgb: any[] = hex.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),(\d+(\.\d+)?)/i).slice(0, 5);

	if (!rgb || rgb.length !== 5) {
		throw new Error('Invalid RGB(a) colour');
	}

	rgb[4] = parseFloat(rgb[4]) * 255;
	if ( Math.round(rgb[4]) === 255) {
		rgb.pop();
	}

	return `#${rgb.slice(1).map((v) => (`0${parseInt(v, 10).toString(16)}`).slice(-2)).join('')}`;
};

export const getRGBA = (color) => {
	const red = parseInt(color[0], 10);
	const blue = parseInt(color[1], 10);
	const green = parseInt(color[2], 10);
	const alpha = (color.length < 4) ? 1 : parseInt(color[3], 10) / 255;
	return `rgba(${red}, ${blue}, ${green}, ${alpha})`;
};

export const getGroupHexColor = (groupColor) => {
	if (groupColor) {
		return rgbaToHex(getRGBA(groupColor));
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
