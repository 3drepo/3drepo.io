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
const useragent = require('useragent');

const UserAgent = {};

// Format:
// PLUGIN: {OS Name}/{OS Version} {Host Software Name}/{Host Software Version} {Plugin Type}/{Plugin Version}
// Example:
// PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0
UserAgent.getUserAgentInfoFromPlugin = (userAgentString) => {
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

UserAgent.getUserAgentInfoFromBrowser = (userAgentString) => {
	const { browser, engine, os } = UaParserJs(userAgentString);
	const userAgentInfo = {
		application: browser.name ? { ...browser, type: 'browser' } : { type: 'unknown' },
		engine,
		os,
		device: userAgentString ? Device(userAgentString).type : 'unknown',
	};

	return userAgentInfo;
};

UserAgent.isUserAgentFromPlugin = (userAgent) =>
	userAgent.split(' ')[0] === 'PLUGIN:';

UserAgent.isFromWebBrowser = (userAgent) => {
	const ua = useragent.is(userAgent);
	const isFromWebBrowser = ['webkit', 'opera', 'ie', 'chrome', 'safari', 'mobile_safari', 'firefox', 'mozilla', 'android']
		.some((browserType) =>
			ua[browserType]); // If any of these browser types matches then is a websession
	return isFromWebBrowser;
};

module.exports = UserAgent;
