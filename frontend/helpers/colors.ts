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
