import axios from 'axios';
import { memoize } from 'lodash';

import { ClientConfigService } from '../clientConfig';

const clientConfigService = new ClientConfigService();

const api = axios.create({
	baseURL: ClientConfig.apiUrls.all[0]
});

export const getResponseCode = memoize((errorToFind) => {
	return Object.keys(clientConfigService.responseCodes).indexOf(errorToFind);
});

export * from './users';
export * from './teamspace';
export * from './jobs';

export default api;
