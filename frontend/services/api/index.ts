import axios from 'axios';

const api = axios.create({
	baseURL: ClientConfig.apiUrls.all[0]
});

export * from './users';
export * from './teamspace';
export * from './jobs';

export default api;
