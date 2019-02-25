import { WHITE } from './../styles/colors';

const parseHex = (hex) => {
	hex = hex.replace(/^#/, '');
	if (hex.length === 8) {
		hex = hex.substring(0, 6);
	}

	if (hex.length === 4) {
		hex = hex.substring(0, 3);
	}

	if (hex.length === 3) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}

	const num = parseInt(hex, 16);
	const red = num >> 16;
	const green = (num >> 8) & 255;
	const blue = num & 255;

	return {red, green, blue};
};

export const hexToPinColor = (hex) => {
	const {red, green, blue} = parseHex(hex);
	return [red / 255, green / 255, blue / 255];
};

export const hexToRgba = (hex, alpha = 1) => {
	const {red, green, blue} = parseHex(hex);
	return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};

export const getRGBA = (color) => {
	const red = parseInt(color[0], 10);
	const blue = parseInt(color[1], 10);
	const green = parseInt(color[2], 10);
	return `rgba(${red}, ${blue}, ${green}, 1)`;
};

export const getGroupRGBAColor = (groupColor) => {
	if (groupColor) {
		return this.getRGBA(groupColor);
	}
	return hexToRgba(WHITE);
};

export const getRandomColor = () => {
	return [
		parseInt((Math.random() * 255).toFixed(0), 10),
		parseInt((Math.random() * 255).toFixed(0), 10),
		parseInt((Math.random() * 255).toFixed(0), 10)
	];
};
