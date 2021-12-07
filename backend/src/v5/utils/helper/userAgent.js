const Device = require('device');
const UaParserJs = require('ua-parser-js');
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

UserAgent.isUserAgentFromPlugin = (userAgent) => userAgent.split(' ')[0] === 'PLUGIN:';

 module.exports = UserAgent;
 