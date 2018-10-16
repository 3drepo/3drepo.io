import axios from 'axios';
import { memoize } from 'lodash';

import { ClientConfigService } from '../clientConfig';

const clientConfigService = new ClientConfigService();

axios.defaults.withCredentials = true;

const api = axios.create({
	baseURL: ClientConfig.apiUrls.all[0]
});

export const getResponseCode = memoize((errorToFind) => {
	return Object.keys(clientConfigService.responseCodes).indexOf(errorToFind);
});

export * from './users';
export * from './teamspace';
export * from './jobs';
export * from './projects';
export * from './models';

export default api;
