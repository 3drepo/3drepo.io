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
import { LOGIN_PATH } from '@/v5/ui/routes/routes.constants';
import { clientConfigService } from '@/v4/services/clientConfig';
import { AuthActionsDispatchers } from '../actionsDispatchers/authActions.dispatchers';

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
	(response) => response,
	(error) => {
		try {
			const invalidMessages = ['Authentication error', 'You are not logged in'] as any;

			switch (error.response.status) {
				case 401:
					if (error.response.data) {
						const notLogin = error.response.data.place !== `GET ${LOGIN_PATH}`;
						const unauthorized = invalidMessages.includes(error.response.data.message);

						const sessionHasExpired = unauthorized && notLogin;

						if (sessionHasExpired) {
							AuthActionsDispatchers.sessionExpired();
						} else {
							throw error.response;
						}
						// eslint-disable-next-line no-param-reassign
						error.handled = true;
					}
					break;
				case 403:
					// eslint-disable-next-line no-param-reassign
					error.handled = true;
					break;
				default:
					break;
			}

			return Promise.reject(error);
		} catch (e) {
			return Promise.reject(error);
		}
	},
);
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

export default {
	get: getRequest,
	post: postRequest,
	put: putRequest,
	patch: patchRequest,
	delete: deleteRequest,
};
