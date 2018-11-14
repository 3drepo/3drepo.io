import axios from 'axios';
import { clientConfigService } from '../clientConfig';
import { memoize } from 'lodash';

axios.defaults.withCredentials = true;

const getRequest = (url, ...options) => {
	const requestUrl = clientConfigService.apiUrl(clientConfigService.GET_API, url);
	return axios.get(requestUrl, ...options);
};

const postRequest = (url, ...options) => {
	const requestUrl = clientConfigService.apiUrl(clientConfigService.POST_API, url);
	return axios.post(requestUrl, ...options);
};

const putRequest = (url, ...options) => {
	const requestUrl = clientConfigService.apiUrl(clientConfigService.POST_API, url);
	return axios.put(requestUrl, ...options);
};

const deleteRequest = (url, ...options) => {
	const requestUrl = clientConfigService.apiUrl(clientConfigService.POST_API, url);
	return axios.delete(requestUrl, ...options);
};

const patchRequest = (url, ...options) => {
	const requestUrl = clientConfigService.apiUrl(clientConfigService.POST_API, url);
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
	return clientConfigService.apiUrl(clientConfigService.GET_API, url);
};

export const getResponseCode = memoize((errorToFind) => {
	return Object.keys(clientConfigService.responseCodes).indexOf(errorToFind);
});
