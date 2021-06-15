/**
 *	Copyright (C) 2021 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
const db = require("../handler/db");

//detects edge as browser but not device
const UaParserJs = require('ua-parser-js');
const Device = require('device');
const Ip2location = require('ip-to-location');

const LoginRecord = {};

LoginRecord.saveLoginRecord = async (req) => {
    const loginRecord = {
        _id: req.sessionID,
        loginTime: new Date(),
        ipAddr: req.ips[0] || req.ip
    }

    const referrer = req.header('Referer');
    if (referrer != null) {
        loginRecord.referrer = referrer;
    }

    const { country_name, city } = await getLocationFromIPAddress(loginRecord.ipAddr);
    loginRecord.location = {
        country: country_name,
        city
    };

    const userAgentString = req.headers['user-agent'];
    const uaInfo = isUserAgentFromPlugin(userAgentString) ?
        getUserAgentInfoFromPlugin(userAgentString) : getUserAgentInfoFromBrowser(userAgentString);

    loginRecord.application = uaInfo.application;
    loginRecord.engine = uaInfo.engine;
    loginRecord.os = uaInfo.os;
    loginRecord.device = uaInfo.device;

    await db.insert("loginRecords", req.body.username, loginRecord);

}

//Format: 
//PLUGIN: {OS Name}/{OS Version} {Host Software Name}/{Host Software Version} {Plugin Type}/{Plugin Version}
//Example:
//PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0
const getUserAgentInfoFromPlugin = (userAgentString) => {
    const [osInfo, appInfo, engineInfo] = userAgentString.replace("PLUGIN: ", "").split(' ');

    const osInfoComponents = osInfo.split('/');
    const appInfoComponents = appInfo.split('/');
    const engineInfoComponents = engineInfo.split('/');

    const userAgentInfo = {
        application: {
            name: appInfoComponents[0],
            version: appInfoComponents[1],
            type: "plugin"
        },
        engine: {
            name: "3drepoplugin",
            version: engineInfoComponents[1]
        },
        os: {
            name: osInfoComponents[0],
            version: osInfoComponents[1]
        },
        device: "desktop"
    };

    return userAgentInfo;
}

const getUserAgentInfoFromBrowser = (userAgentString) => {

    const { browser, engine, os } = UaParserJs(userAgentString);
    const userAgentInfo = {
        application: { ...browser, type: browser == null ? null : "browser"},
        engine,
        os,
        device: Device(userAgentString).type
    }    
  
    return userAgentInfo;
}

const getLocationFromIPAddress = async (ipAddress) => {
    return await Ip2location.fetch(ipAddress);
}

const isUserAgentFromPlugin = (userAgent) => {
    return userAgent.split(" ")[0] === "PLUGIN:";
}

module.exports = LoginRecord;