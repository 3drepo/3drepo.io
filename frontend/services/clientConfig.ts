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
	public resourceUploadSizeLimit;
	// tslint:disable-next-line
	public login_check_interval;
	public gtm;
	public userId;
	public development;
	public sequencesEnabled;
	public presenterEnabled;
	// tslint:disable-next-line
	public captcha_client_key;
	public legalTemplates;
	public liveChatLicense;
	public intercomLicense;
	public tagRegExp;
	public uploadSizeLimit;
	public apiUrls;
	private chatHost;
	private chatPath;
	private chatReconnectionAttempts;
	private apiAlgorithm;
	private MAP_API;
	private C;
	private customLogins;
	private maintenanceMode;

	constructor() {
		if (!this.isValid) {
			console.error('ClientConfig has not been provided...');
			return;
		}
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

	public get isMaintenanceEnabled() {
		return this.maintenanceMode;
	}

	public get isValid() {
		return !!window.ClientConfig;
	}

	public get chatConfig() {
		return {
			host: this.chatHost,
			path: this.chatPath,
			reconnectionAttempts: this.chatReconnectionAttempts || Infinity
		};
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

	public getCustomBackgroundImagePath() {
		const subdomain = getSubdomain();
		const custom = this.customLogins && this.customLogins[subdomain];

		if (subdomain && custom && custom.backgroundImage &&
			typeof custom.backgroundImage === 'string') {
			return custom.backgroundImage;
		}

		return '';
	}

	public getCustomLoginMessage() {
		const subdomain = getSubdomain();
		const custom = this.customLogins && this.customLogins[subdomain];

		if (subdomain && custom && custom.loginMessage) {
			return custom.loginMessage;
		}

		return '';
	}

	public injectCustomCSS() {
		const subdomain = getSubdomain();
		const custom = this.customLogins && this.customLogins[subdomain];

		if (custom && custom.css) {
			const link = document.createElement('link');
			link.setAttribute('rel', 'stylesheet');
			link.setAttribute('type', 'text/css');
			link.setAttribute('href', custom.css);
			document.getElementsByTagName('head')[0].appendChild(link);
		}
	}

	public logAppVersion() {
		if (this.VERSION) {
			/* tslint:disable */
			console.log(`===== 3D REPO - Version ${this.VERSION} =====`);
			/* tslint:enable */
		} else {
			console.error('No version number in config...');
		}
	}
}

export const clientConfigService = new ClientConfigService();
