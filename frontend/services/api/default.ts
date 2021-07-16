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
import { memoize } from 'lodash';

import { ROUTES } from '../../constants/routes';
import { AuthActions } from '../../modules/auth';
import { DialogActions } from '../../modules/dialog';
import { dispatch } from '../../modules/store';
import { clientConfigService } from '../clientConfig';

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
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
						error.handled = true;
					}
					break;
				case 403:
					dispatch(DialogActions.showDialog({
						title: 'Forbidden',
						content: 'No access',
						onCancel: () => {
							dispatch(push(ROUTES.TEAMSPACES));
						}
					}));
					error.handled = true;
					break;
				default:
					break;
			}

			return Promise.reject(error);
		} catch (e) {
			return Promise.reject(error);
		}
	}
);

const getRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.GET_API, url));
	return axios.get(requestUrl, ...options);
};

const postRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, url));
	return axios.post(requestUrl, ...options);
};

const putRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, url));
	return axios.put(requestUrl, ...options);
};

const deleteRequest = (url, data?) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, url));
	return axios.delete(requestUrl, { data });
};

const patchRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, url));
	return axios.patch(requestUrl, ...options);
};

export const API = {
	get: getRequest,
	post: postRequest,
	put: putRequest,
	patch: patchRequest,
	delete: deleteRequest
};

export const setSocketIdHeader = (socketId) => {
	axios.defaults.headers['x-socket-id'] = socketId;
};

export const getAPIUrl = (url: string) => {
	return url.startsWith(`data:image`) ? url : encodeURI(clientConfigService.apiUrl(clientConfigService.GET_API, url));
};

export const getResponseCode = memoize((errorToFind) => {
	return Object.keys(clientConfigService.responseCodes).indexOf(errorToFind);
});
