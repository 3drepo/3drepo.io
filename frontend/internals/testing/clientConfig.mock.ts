const apiPath = 'http://api1.app-3drepo.com:80/api';

export default {
	host: 'www.example.org',
	servers: [{
		service: 'api',
		subdirectory: 'api',
		public_port: 80,
		public_protocol: 'http'
	}],
	apiURL: apiPath
};
