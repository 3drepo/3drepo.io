import axios from 'axios';
import { push } from 'connected-react-router';
import { memoize } from 'lodash';

import { splitString, IDS_ARGUMENT_INDICATION, MAX_URL_LENGTH } from '../../constants/requests';
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

const splitRequestIfNecessary = (request) => {
	const requestLength = request.length;

	if (requestLength < MAX_URL_LENGTH) { return [request]; }

	const requestParts = request.split(IDS_ARGUMENT_INDICATION);
	const chunksLimit = MAX_URL_LENGTH - IDS_ARGUMENT_INDICATION.length - requestParts[0].length;
	const idsChunks = splitString(requestParts[1], chunksLimit);

	return idsChunks.map((ids) => `${requestParts[0]}${IDS_ARGUMENT_INDICATION}${ids}`);
};

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
	const requests = splitRequestIfNecessary(requestUrl);

	return Promise.all(requests.map((request) => axios.delete(request, { data })));
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
