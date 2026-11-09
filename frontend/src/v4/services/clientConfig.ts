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
	public countries;
	public units;
	public acceptedFormat;
	public apiURL;
	public VERSION;
	public userNotice;
	public resourceUploadSizeLimit;
	public login_check_interval;
	public userId;
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
	private chatHost;
	private chatPath;
	private chatReconnectionAttempts;
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

	}

	public apiUrl(path) {
		return `${this.apiURL}/${path.replace(/^\//, '')}`;
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
