import axios from 'axios';

const api = axios.create({
	baseURL: ClientConfig.apiUrls.all[0]
});

export default api;
