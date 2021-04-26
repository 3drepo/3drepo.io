export const MAX_URL_LENGTH = 240;
export const IDS_ARGUMENT_INDICATION = '?ids=';

const normalizeString = (text): string => text.replace(/^,/, '');

const getPartLength = (text: string, by: string = ',') => text.split(by)[0]?.length || 0;

const getSplitPoint = (text: string, limit: number, by: string = ',') => {
	const splitPoint = text.indexOf(by, limit);

	if (splitPoint > -1) { return splitPoint; }

	const partLength = getPartLength(text);

	return partLength || getSplitPoint(text, limit - partLength, by);
};

export const splitString = (text: string = '', limit: number = MAX_URL_LENGTH, by: string = ',') => {
	text = normalizeString(text);
	const splitPoint = getSplitPoint(text, limit, by);
	const remains = normalizeString(text.substring(splitPoint));
	const part = text.substring(0, splitPoint);

	if (remains.length > limit) {
		return [part, ...splitString(remains, limit, by)];
	}

	return [part, remains];
};
