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

const Device = require('device');
const UaParserJs = require('ua-parser-js');

const UserAgent = {};

// Format:
// PLUGIN: {OS Name}/{OS Version} {Host Software Name}/{Host Software Version} {Plugin Type}/{Plugin Version}
// Example:
// PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0
const getUserAgentInfoFromPlugin = (userAgentString) => {
	const [osInfo, appInfo, engineInfo] = userAgentString.replace('PLUGIN: ', '').split(' ');

	const osInfoComponents = osInfo.split('/');
	const appInfoComponents = appInfo.split('/');
	const engineInfoComponents = engineInfo.split('/');

	const userAgentInfo = {
		application: {
			name: appInfoComponents[0],
			version: appInfoComponents[1],
			type: 'plugin',
		},
		engine: {
			name: '3drepoplugin',
			version: engineInfoComponents[1],
		},
		os: {
			name: osInfoComponents[0],
			version: osInfoComponents[1],
		},
		device: 'desktop',
	};

	return userAgentInfo;
};

const getUserAgentInfoFromBrowser = (userAgentString) => {
	const { browser, engine, os } = UaParserJs(userAgentString);
	const userAgentInfo = {
		application: browser.name ? { ...browser, type: 'browser' } : { type: 'unknown' },
		engine,
		os,
		device: Device(userAgentString).type,
	};

	return userAgentInfo;
};

const isUserAgentFromPlugin = (userAgent) => userAgent.split(' ')[0] === 'PLUGIN:';

UserAgent.isFromWebBrowser = (userAgent) => {
	const { browser } = UaParserJs(userAgent);
	const isFromWebBrowser = ['WebKit', 'Opera', 'IE', 'Edge', 'Chrome', 'Safari', 'Mobile Safari', 'Firefox', 'Mozilla']
		.includes(browser.name); // If any of these browser types matches then is a websession
	return isFromWebBrowser;
};

UserAgent.getUserAgentInfo = (userAgent) => {
	if (!userAgent) {
		return {
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
	}

	if (isUserAgentFromPlugin(userAgent)) {
		return getUserAgentInfoFromPlugin(userAgent);
	}

	return getUserAgentInfoFromBrowser(userAgent);
};

module.exports = UserAgent;
