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

import axios from 'axios';
import { clientConfigService } from '@/v4/services/clientConfig';

axios.defaults.withCredentials = true;

export const generateV5ApiUrl = (url: string, requestMethod: string): string => encodeURI(clientConfigService.apiUrl(requestMethod, `v5/${url}`));

const getRequest = (url, ...options) => {
	const requestUrl = generateV5ApiUrl(url, clientConfigService.GET_API);
	return axios.get(requestUrl, ...options);
};

const postRequest = (url, ...options) => {
	const requestUrl = generateV5ApiUrl(url, clientConfigService.POST_API);
	return axios.post(requestUrl, ...options);
};

const putRequest = (url, ...options) => {
	const requestUrl = generateV5ApiUrl(url, clientConfigService.POST_API);
	return axios.put(requestUrl, ...options);
};

const deleteRequest = (url, data?) => {
	const requestUrl = generateV5ApiUrl(url, clientConfigService.POST_API);
	return axios.delete(requestUrl, { data });
};

const patchRequest = (url, ...options) => {
	const requestUrl = generateV5ApiUrl(url, clientConfigService.POST_API);
	return axios.patch(requestUrl, ...options);
};

export const setSocketIdHeader = (socketId) => {
	axios.defaults.headers['x-socket-id'] = socketId;
};

export const getUrl = (path) => generateV5ApiUrl(path, clientConfigService.GET_API);

export const isApiUrl = (url) => {
	const apiUrl = clientConfigService.apiUrl('all', '');
	return url.includes(apiUrl);
};

export default {
	get: getRequest,
	post: postRequest,
	put: putRequest,
	patch: patchRequest,
	delete: deleteRequest,
};
