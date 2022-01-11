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

const { src } = require('../../../helper/path');

const UserAgentHelper = require(`${src}/utils/helper/userAgent`);

const matchHelper = (func, string, match) => {
	const res = func(string);
	expect(res).toEqual(match);
};

const testGetUserAgentInfoFromPlugin = () => {
	describe('Get user agent info from plugin user agent', () => {
		test('Should return user agent info object from plugin user agent', () => {
			const pluginUserAgent = 'PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0';
			const expectedUserAgentInfo = {
				application: {
					name: 'REVIT',
					version: '2021.1',
					type: 'plugin',
				},
				engine: {
					name: '3drepoplugin',
					version: '4.15.0',
				},
				os: {
					name: 'Windows',
					version: '10.0.19042.0',
				},
				device: 'desktop',
			};
			matchHelper(UserAgentHelper.getUserAgentInfoFromPlugin, pluginUserAgent, expectedUserAgentInfo);
		});
	});
};

const testGetUserAgentInfoFromBrowser = () => {
	describe('Get user agent info from browser user agent', () => {
		test('Should return user agent info object from browser', () => {
			const browserUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41';
			const expectedUserAgentInfo = {
				application: {
					major: '38',
					name: 'Opera',
					type: 'browser',
					version: '38.0.2220.41',
				},
				engine: {
					name: 'Blink',
					version: '51.0.2704.106',
				},
				os: {
					name: 'Linux',
					version: 'x86_64',
				},
				device: 'desktop',
			};
			matchHelper(UserAgentHelper.getUserAgentInfoFromBrowser, browserUserAgent, expectedUserAgentInfo);
		});

		test('Should return user agent info object if user agent is missing', () => {
			const browserUserAgent = '';
			const expectedUserAgentInfo = {
				application: {
					type: 'unknown',
				},
				engine: {
					name: undefined,
					version: undefined,
				},
				os: {
					name: undefined,
					version: undefined,
				},
				device: 'unknown',
			};
			matchHelper(UserAgentHelper.getUserAgentInfoFromBrowser, browserUserAgent, expectedUserAgentInfo);
		});
	});
};

const testIsUserAgentFromPlugin = () => {
	describe('Check whether user agent is coming from the plugin', () => {
		test('Should return true if user agent is coming from the plugin', () => {
			const pluginUserAgent = 'PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0';
			matchHelper(UserAgentHelper.isUserAgentFromPlugin, pluginUserAgent, true);
		});
		test('Should return false if user agent is not coming from the plugin', () => {
			const browserUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41';
			matchHelper(UserAgentHelper.isUserAgentFromPlugin, browserUserAgent, false);
		});
	});
};

const testIsFromWebBrowser = () => {
	describe('Check whether user agent is coming from a web browser', () => {
		test('Should return true if user agent is coming from a web browser', () => {
			const browserUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36 OPR/38.0.2220.41';
			matchHelper(UserAgentHelper.isFromWebBrowser, browserUserAgent, true);
		});
		test('Should return false if user agent is not coming from the plugin', () => {
			const pluginUserAgent = 'PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0';
			matchHelper(UserAgentHelper.isFromWebBrowser, pluginUserAgent, false);
		});
	});
};

describe('utils/helper/userAgent', () => {
	testGetUserAgentInfoFromPlugin();
	testGetUserAgentInfoFromBrowser();
	testIsUserAgentFromPlugin();
	testIsFromWebBrowser();
});
