import axios from 'axios';
import { clientConfigService } from '../clientConfig';
import { memoize } from 'lodash';
import { getAngularService } from '../../helpers/migration';

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
	(response) => response,
	(error) => {
		try {
			const interceptor = getAngularService('AuthInterceptor') as any;
			interceptor.responseError(error.response);
			error.response.handled = true;
			return Promise.reject(error);
		} catch (e) {
			return Promise.reject(error);
		}
	}
);

const addSocketIdToHeader = () => {
	const ChatService = getAngularService('ChatService') as any;
	axios.defaults.headers['x-socket-id'] = ChatService.socket.id;
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
	return axios.delete(requestUrl, {data});
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

export const getAPIUrl = (url: string) => {
	addSocketIdToHeader();
	return encodeURI(clientConfigService.apiUrl(clientConfigService.GET_API, url));
};

export const getResponseCode = memoize((errorToFind) => {
	return Object.keys(clientConfigService.responseCodes).indexOf(errorToFind);
});
