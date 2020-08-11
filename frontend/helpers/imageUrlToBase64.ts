import api from '../services/api/';

export const imageUrlToBase64 = (url: string) => api
	.get((url.split('/api/')[1]), {
		responseType: 'arraybuffer'
	})
	.then((response) =>
		Buffer.from(response.data, 'binary').toString('base64'));
