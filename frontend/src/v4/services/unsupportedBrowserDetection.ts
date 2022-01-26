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

import semverCompare from 'semver-compare';
import UAParser from 'ua-parser-js';

const DEFAULT_SUPPORTED_BROWSERS_CONFIG = {
	desktop: [{
		browser: 'firefox', minversion: 54,
	}, {
		browser: 'chrome', minversion: 51,
	}, {
		browser: 'chrome headless', minversion: 51,
	}, {
		browser: 'edge', minversion: 14,
	}, {
		os: 'mac os', minos: '10.12.0', browser: 'safari', minversion: 10.1,
	}, {
		browser: 'opera', minversion: 38,
	}, {
		browser: 'electron'
	}],
	tablet: [{
		os: 'ios', minos: '9', browser: 'mobile safari',
	}, {
		os: 'android', minos: '5.0', browser: 'chrome',
	},{
		os: 'android', minos: '5.0', browser: 'firefox',
	}, {
		os: 'android', minos: '5.0', browser: 'edge',
	}, {
		browser: 'edge',
	}],
	mobile: [{
		os: 'ios', minos: '9', browser: 'mobile safari',
	}, {
		os: 'ios', minos: '5.0', browser: 'chrome',
	}, {
		os: 'android', minos: '5.0', browser: 'chrome', minversion: 50,
	},{
		os: 'android', minos: '5.0', browser: 'firefox',
	}, {
		os: 'android', minos: '5.0', browser: 'edge',
	}],
};

export default class UnsupportedBrowserDetection {
	private supportedBrowsersConfig;
	private isInAppBrowserSupported;
	private parser = new UAParser();

	constructor(config = DEFAULT_SUPPORTED_BROWSERS_CONFIG, isInAppBrowserSupported = true) {
		this.supportedBrowsersConfig = config;
		this.isInAppBrowserSupported = isInAppBrowserSupported;
	}

	get isInAppBrowser() {
		return (
			this.ua.includes('FBAN') ||
			this.ua.includes('FBAV') ||
			this.ua.includes('Twitter')
		);
	}

	get isSearchEngineBot() {
		return this.ua.includes('Google');
	}

	get device() {
		return this.parser.getDevice();
	}

	get ua() {
		return this.parser.getUA();
	}

	get browser() {
		return this.parser.getBrowser();
	}

	get os() {
		return this.parser.getOS();
	}

	get deviceType() {
		const { type = 'desktop' } = this.device;
		return type;
	}

	public compareVersions(a, b) {
		if (typeof a === 'string' || a instanceof String) {
			return semverCompare(a, b) <= 0;
		}

		return a <= parseInt(b, 10);
	}

	public isSupported() {
		if (this.isInAppBrowser) {
			return this.isInAppBrowserSupported;
		}

		if (this.isSearchEngineBot) {
			return true;
		}

		const { version: browserVersion } = this.browser;

		const isSupported = !this.supportedBrowsersConfig[this.deviceType]
			.every((options) => {
				const { os, minos, browser, minversion, versions } = options;
				const parsedVersion = isNaN(parseInt(browserVersion, 10))
					? browserVersion.toLocaleLowerCase()
					: parseInt(browserVersion, 10);

				const checked = {
					os: os === this.os.name.toLowerCase(),
					minos: this.compareVersions(minos, this.os.version),
					browser: browser === this.browser.name.toLowerCase(),
					minversion: this.compareVersions(minversion, browserVersion),
					versions: versions ? versions.indexOf(parsedVersion) >= 0 : false,
				};
				return Object.keys(options).map((key) => checked[key]).indexOf(false) !== -1;
			});
		return isSupported;
	}
}
