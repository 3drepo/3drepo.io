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
	}],
	tablet: [{
		os: 'ios', minos: '9', browser: 'mobile safari',
	}, {
		os: 'android', minos: '5.0', browser: 'chrome',
	}, {
		browser: 'edge',
	}],
	mobile: [{
		os: 'ios', minos: '9', browser: 'mobile safari',
	}, {
		os: 'ios', minos: '5.0', browser: 'chrome',
	}, {
		os: 'android', minos: '5.0', browser: 'chrome', minversion: 50,
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
