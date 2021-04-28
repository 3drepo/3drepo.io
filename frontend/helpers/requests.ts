import { clientConfigService } from '../services/clientConfig';

const MAX_URL_LENGTH = 2000;

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

export const splitValuesIfNecessary = (path, argumentIndication) => {
	const request = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, path));
	const requestParts = request.split(argumentIndication);

	if (request.length < MAX_URL_LENGTH) { return [requestParts[1]]; }

	const chunksLimit = MAX_URL_LENGTH - argumentIndication.length - requestParts[0].length;

	return splitString(requestParts[1], chunksLimit);
};
