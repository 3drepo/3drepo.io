/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
	public login_check_interval;
	public gtm;
	public userId;
	public development;
	public sequencesEnabled;
	public presenterEnabled;
	public captcha_client_key;
	public legalTemplates;
	public liveChatLicense;
	public intercomLicense;
	public apryseLicense;
	public tagRegExp;
	public uploadSizeLimit;
	public avatarSizeLimit;
	public projectImageSizeLimit;
	// imageSizeLimit is temporary, should be removed
	// when both projectImageSizeLimit and
	// avatarSizeLimit are sent
	public imageSizeLimit;
	public imageExtensions;
	public apiUrls;
	public hotjar;
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
			this.projectImageSizeLimit = this.imageSizeLimit;
			this.avatarSizeLimit = this.imageSizeLimit;
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
			return this.apiUrls[type][functionIndex] + '/' + path.replace(/^\//, '');
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
			// eslint-disable-next-line no-console
			console.log(`===== 3D REPO - Version ${this.VERSION} =====`);
		} else {
			console.error('No version number in config...');
		}
	}
}

export const clientConfigService = new ClientConfigService();
