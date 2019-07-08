import axios from 'axios';
import { clientConfigService } from '../clientConfig';
import { memoize } from 'lodash';

import { AuthActions } from '../../modules/auth';
import { dispatch } from '../../modules/store';
import { DialogActions } from '../../modules/dialog';
import { push } from 'connected-react-router';
import { ROUTES } from '../../constants/routes';

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

const deleteRequest = (url, ...options) => {
	const requestUrl = encodeURI(clientConfigService.apiUrl(clientConfigService.POST_API, url));
	return axios.delete(requestUrl, ...options);
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
	return encodeURI(clientConfigService.apiUrl(clientConfigService.GET_API, url));
};

export const getResponseCode = memoize((errorToFind) => {
	return Object.keys(clientConfigService.responseCodes).indexOf(errorToFind);
});
