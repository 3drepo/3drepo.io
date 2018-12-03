export const ellipsis = (width) => `
	text-overflow: ellipsis;
	width: ${width};
	overflow: hidden;
	white-space: nowrap;
`;

export const isWindows = (properties) => {
	if ((['Win32', 'Win64'] as any).includes(navigator.platform)) {
		return properties;
	}

	return '';
};

export const isFirefox = (properties) => {
	if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
		return properties;
	}

	return '';
};
