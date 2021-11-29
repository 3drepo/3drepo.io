 const db = require("../handler/db");
 
 // detects edge as browser but not device
 const {getLocationFromIPAddress, getUserAgentInfoFromBrowser, getUserAgentInfoFromPlugin, 
    isUserAgentFromPlugin } = require("../utils/helper/strings");

 const LoginRecord = {};
 
 LoginRecord.saveLoginRecord = async (sessionId, username, ipAddress, userAgent, referer) => {    
     let loginRecord = {_id: sessionId, loginTime: new Date(), ipAddr: ipAddress };
 
     const uaInfo = isUserAgentFromPlugin(userAgent) ?
         getUserAgentInfoFromPlugin(userAgent) : getUserAgentInfoFromBrowser(userAgent);

     loginRecord = {...loginRecord, ...uaInfo};
 
     const { country, city } = getLocationFromIPAddress(loginRecord.ipAddr);
     loginRecord.location = {country,city};
 
     if (referer) {
         loginRecord.referer = referer;
     }

     await db.insertOne("loginRecords", username, loginRecord);
     return loginRecord;     
 };
 
 module.exports = LoginRecord;
 