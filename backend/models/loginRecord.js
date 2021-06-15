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
const uaParserJs = require('ua-parser-js');
const device = require('device');
const ip2location = require('ip-to-location');

 const LoginRecord = {};
 
 LoginRecord.saveLoginRecord = async (req) => {
        const loginRecord = {
                _id : req.sessionID,
                loginTime : new Date(),
                ipAddr: req.ips[0] || req.ip                    
        }

        const referrer = req.header('Referer');
        if(referrer != null){
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

         const col = await db.getCollection("loginRecords", req.body.username);
         await col.insertOne(loginRecord);
 }
 
 //Format: 
 //PLUGIN: {OS Name}/{OS Version} {Host Software Name}/{Host Software Version} {Plugin Type}/{Plugin Version}
 //Example:
 //PLUGIN: Windows/10.0.19042.0 REVIT/2021.1 PUBLISH/4.15.0
 function getUserAgentInfoFromPlugin(userAgentString){
        const userAgentInfo = {};        
        const userAgentComponents = userAgentString.replace("PLUGIN: ", "").split(' ');                  

        userAgentInfo.application = {
                name: userAgentComponents[1].split('/')[0],
                version: userAgentComponents[1].split('/')[1],
                type: "plugin"        
        }
        
        userAgentInfo.engine = {
                name: "3drepoplugin",
                version: userAgentComponents[2].split('/')[1]
        }

        userAgentInfo.os = {
                osName: userAgentComponents[0].split('/')[0],
                osVersion: userAgentComponents[0].split('/')[1]
        }

        userAgentInfo.device = "desktop";

        return userAgentInfo;
 }

 function getUserAgentInfoFromBrowser(userAgentString){
        const userAgentInfo = {};        
        const userAgentObject = uaParserJs(userAgentString);       

        userAgentInfo.application = {
                name: userAgentObject.browser.name,
                version: userAgentObject.browser.version,
                type: "browser"        
        }
        
        userAgentInfo.engine = {
                name: userAgentObject.engine.name,
                version: userAgentObject.engine.version
        }

        userAgentInfo.os = {
                osName: userAgentObject.os.name,
                osVersion: userAgentObject.os.version
        }

        userAgentInfo.device = device(userAgentString).type;

        return userAgentInfo;
}

async function getLocationFromIPAddress(ipAddress){
        return await ip2location.fetch(ipAddress);
}

function isUserAgentFromPlugin(userAgent){        
        return userAgent.split(" ")[0] == "PLUGIN:";
}

 module.exports = LoginRecord;