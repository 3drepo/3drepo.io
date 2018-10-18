export const formatBytesGB = (input: number = 0) => {
	const factor: number = 1024;
	const units: string = 'GB';

	return (Math.round((input / factor) * 100) / 100).toString() + units;
};

export const formatBytes = (input: number = 0, referenceValue: number) => {
	const bytesInMB: number = 1048576;
	const bytesInGB: number = 1073741824;
	let factor: number;

	let units: string;

	if (referenceValue !== undefined || referenceValue !== null) {
		if (referenceValue > 1073741824) {
			factor = bytesInGB;
			units = ' GB';
		} else {
			factor = bytesInMB;
			units = ' MB';
		}
	} else {
		if (input > 1073741824) {
			factor = bytesInGB;
			units = ' GB';
		} else {
			factor = bytesInMB;
			units = ' MB';
		}
	}

	return (Math.round((input / factor) * 100) / 100).toString() + units;
};
