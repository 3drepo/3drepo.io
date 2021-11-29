 const { src } = require('../../helper/path'); 
 const db = require(`${src}/handler/db`);
 const { templates } = require(`${src}/utils/responseCodes`);
 jest.mock('../../../../src/v5/utils/helper/strings');
 const StringHelper  = require(`${src}/utils/helper/strings`);

 StringHelper.isUserAgentFromPlugin.mockImplementation((userAgent) => {
    return userAgent.split(" ")[0] === "PLUGIN:";
});

 StringHelper.getLocationFromIPAddress.mockImplementation((ipAddress) => {
     return {
        country: "United Kingdom", 
        city: "London" }
     });

StringHelper.getUserAgentInfoFromBrowser.mockImplementation((userAgent) => { 
    return {
		application: {
			name: "ua name",
			version: "1",
			type: "browser"
		},
		engine: {
			name: "some browser",
			version: "1"
		},
		os: {
			name: "os name",
			version: "1"
		},
		device: "desktop"
	}
 });

 StringHelper.getUserAgentInfoFromPlugin.mockImplementation((userAgent) => { 
    return {
		application: {
			name: "ua name",
			version: "1",
			type: "plugin"
		},
		engine: {
			name: "3drepoplugin",
			version: "1"
		},
		os: {
			name: "os name",
			version: "1"
		},
		device: "desktop"
	}
 });

 const sessionId = '123456';
 const username = 'someUsername';
 const ipAddress = '290.241.146.180';
 const browserUserAgent = 'browser user agent';
 const pluginUserAgent = 'PLUGIN: plugin user agent';
 const referer = 'www.google.com';
 const LoginRecord = require(`${src}/models/loginRecord`);
 
 const testSaveLoginRecord = () => {  
    const formatLoginRecord = (userAgentInfo, loginTime, referer) => {
        const formattedLoginRecord = { 
            _id: sessionId,
            loginTime: loginTime,
            ipAddr: ipAddress,
            referer: referer,
            location:{
                country: "United Kingdom",
                city: "London",
            },
            ...userAgentInfo
        };

        if(referer){
            formattedLoginRecord.referer = referer;
        }

        return formattedLoginRecord;
    };

    const checkResults = (fn, username, dataInserted) => {
        expect(fn.mock.calls.length).toBe(1);
        expect(fn.mock.calls[0][1]).toEqual(username);
        expect(fn.mock.calls[0][2]).toEqual(dataInserted); 
    };
 
     describe('Save new login record', () => {
         test('Should save a new login record if user agent is from plugin', async () => {                 
             const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);
             const res = await LoginRecord.saveLoginRecord(sessionId, username, ipAddress, pluginUserAgent, referer);
             checkResults(fn, username, res);
             const formattedLoginRecord = formatLoginRecord(StringHelper.getUserAgentInfoFromPlugin(), res.loginTime, referer);
             expect(res).toEqual(formattedLoginRecord);
         });

         test('Should save a new login record if user agent is from browser', async () => {            	
            const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);
            const res = await LoginRecord.saveLoginRecord(sessionId, username, ipAddress, browserUserAgent, referer);
            checkResults(fn, username, res);
            const formattedLoginRecord = formatLoginRecord(StringHelper.getUserAgentInfoFromBrowser(),res.loginTime, referer);
            expect(res).toEqual(formattedLoginRecord);
        });

        test('Should save a new login record if there is no referer', async () => {            	
            const fn = jest.spyOn(db, 'insertOne').mockResolvedValue(undefined);
            const res = await LoginRecord.saveLoginRecord(sessionId, username, ipAddress, browserUserAgent);
            checkResults(fn, username, res);
            const formattedLoginRecord = formatLoginRecord(StringHelper.getUserAgentInfoFromBrowser(), res.loginTime);
            expect(res).toEqual(formattedLoginRecord);
        });
     });
     
 };
 
 
 describe('models/loginRecord', () => {
    testSaveLoginRecord();
 });
 