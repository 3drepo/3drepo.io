const getSubdomain = () => {
	const {host} = location;
	if (host.indexOf('.') < 0) {
		return '';
	}
	return host.split('.')[0];
};

export class ClientConfigService {
	public responseCodes;
	public countries;
	public units;
	public acceptedFormat;
	public apiUrl;
	public GET_API;
	public POST_API;
	public VERSION;
	public userNotice;
	// tslint:disable-next-line
	public login_check_interval;
	// tslint:disable-next-line
	public captcha_client_key;
	public legalTemplates;
	public liveChatLicense;
	private apiUrls;
	private apiAlgorithm;
	private MAP_API;
	private C;
	private customLogins;

	constructor() {
		if (window && window.ClientConfig) {
			for (const key in window.ClientConfig) {
				if (key) {
					this[key] = window.ClientConfig[key];
				}
			}
		}

		this.apiAlgorithm = this.createRoundRobinAlgorithm();
		this.apiUrls = this.apiAlgorithm.apiUrls;
		this.apiUrl = this.apiAlgorithm.apiUrl.bind(this.apiAlgorithm);

		const C = this.C;

		this.GET_API = C.GET_API;
		this.POST_API = (this.apiUrls[C.POST_API]) ? C.POST_API : this.GET_API;
		this.MAP_API = (this.apiUrls[C.MAP_API]) ? C.MAP_API : this.GET_API;
	}

	public createRoundRobinAlgorithm() {

		const roundRobin: any = {
			apiUrls : this.apiUrls,
			apiUrlCounter: {}
		};

		roundRobin.apiUrl = function(type, path) {
			const typeFunctions = this.apiUrls[type];
			const functionIndex = this.apiUrlCounter[type] % Object.keys(typeFunctions).length;

			this.apiUrlCounter[type] += 1;

			return this.apiUrls[type][functionIndex] + '/' + path;
		};

		for (const k in this.apiUrls) {
			if (this.apiUrls.hasOwnProperty(k)) {
				roundRobin.apiUrlCounter[k] = 0;
			}
		}

		return roundRobin;
	}

	public getCustomLogoPath() {
		const subdomain = getSubdomain();
		const custom = this.customLogins && this.customLogins[subdomain];

		if (subdomain && custom && custom.topLogo &&
			typeof custom.topLogo === 'string') {
			return custom.topLogo;
		}

		return '';
	}
}

export const clientConfigService = new ClientConfigService();
