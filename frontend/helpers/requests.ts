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

import { clientConfigService } from '../services/clientConfig';

const MAX_URL_LENGTH = 2000;

const normalizeString = (text): string => text.replace(/^,/, '');

const getPartLength = (text: string, by: string = ',') => text.split(by)[0]?.length || 0;

const getSplitPoint = (text: string, limit: number, by: string = ',') => {
	const splitPoint = text.indexOf(by, limit);

	if (splitPoint > -1) {
 		return splitPoint;
	}

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

	if (request.length < MAX_URL_LENGTH) {
 		return [requestParts[1]];
	}

	const chunksLimit = MAX_URL_LENGTH - argumentIndication.length - requestParts[0].length;

	return splitString(requestParts[1], chunksLimit);
};
