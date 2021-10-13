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
import { push } from 'connected-react-router';

import { dispatch } from '@/v4/modules/store';
import { clientConfigService } from '@/v4/services/clientConfig';
import { AuthActions } from '@/v4/modules/auth';

const axiosInstance = axios.create();
axiosInstance.defaults.withCredentials = true;

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		try {
			const invalidMessages = ['Authentication error', 'You are not logged in'] as any;

			switch (error.response.status) {
				case 401:
					if (error.response.data) {
						const notLogin = error.response.data.place !== 'GET /login';
						const unauthorized = invalidMessages.includes(error.response.data.message);

						const sessionHasExpired = unauthorized && notLogin;

						if (sessionHasExpired) {
							dispatch(AuthActions.sessionExpired());
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
					dispatch(push('/'));
					break;
				default:
					break;
			}

			return Promise.reject(error.response);
		} catch (e) {
			return Promise.reject(error.response);
		}
	},
);

const generateV5ApiUrl = (url: string): string => `v5/${url}`;

const getRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.GET_API, generateV5ApiUrl(url)));
	return axiosInstance.get(requestUrl, ...options);
};

const postRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, generateV5ApiUrl(url)));
	return axiosInstance.post(requestUrl, ...options);
};

const putRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, generateV5ApiUrl(url)));
	return axiosInstance.put(requestUrl, ...options);
};

const deleteRequest = (url, data?) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, generateV5ApiUrl(url)));
	return axiosInstance.delete(requestUrl, { data });
};

const patchRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, generateV5ApiUrl(url)));
	return axiosInstance.patch(requestUrl, ...options);
};

export default {
	get: getRequest,
	post: postRequest,
	put: putRequest,
	patch: patchRequest,
	delete: deleteRequest,
};
