 "use strict";
 const db = require("../handler/db");
 
 // detects edge as browser but not device

 const Elastic = require("../handler/elastic");
 const getLocationFromIPAddress = require("../../v5/utils/helper/strings");
 const { getUserAgentInfoFromBrowser, getUserAgentInfoFromPlugin, 
    isUserAgentFromPlugin } = require("../utils/helper/strings");
 
 const LoginRecord = {};
 
 LoginRecord.saveLoginRecord = async (id, username, ipAddr, userAgent, referer) => {
     let loginRecord = {_id: id,loginTime: new Date(),ipAddr: ipAddr};
 
     const uaInfo = isUserAgentFromPlugin(userAgent) ?
         getUserAgentInfoFromPlugin(userAgent) : getUserAgentInfoFromBrowser(userAgent);
 
     loginRecord = {...loginRecord, ...uaInfo};
 
     const { country, city } = getLocationFromIPAddress(loginRecord.ipAddr);
     loginRecord.location = {country,city};
 
     if (referer) {
         loginRecord.referrer = referer;
     }
 
     return Promise.all([
         db.insertOne("loginRecords", username, loginRecord),
         Elastic.createLoginRecord(username, loginRecord)]);
 };
 
 
 


 
 module.exports = LoginRecord;
 