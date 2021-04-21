export const MAX_URL_LENGTH = 2000;

const normalizeString = (text): string => text.replace(/^,/, '');

export const splitString = (text: string, by: string, limit: number) => {
	text = normalizeString(text);
	const splitPoint = text.indexOf(by, limit);
	const remains = normalizeString(text.substring(splitPoint));
	const part = text.substring(0, splitPoint);

	if (remains.length > limit) {
		return [part, ...splitString(remains, by, limit)];
	}

	return [part, remains];
};
