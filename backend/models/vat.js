"use strict";

const soap = require("soap");
const config = require("../config");
const vatValidationUrl = config.vat.checkUrl;
const addressMeta = require("./addressMeta");

// Country Code : Standard Rate
const vat = { 
	AT: 20,
	BE: 21,
	BG: 20,
	CY: 19,
	CZ: 21,
	DE: 19,
	DK: 25,
	EE: 20,
	GR: 23,
	ES: 21,
	FI: 24,
	FR: 20,
	HR: 25,
	HU: 27,
	IE: 23,
	IT: 22,
	LT: 21,
	LU: 17,
	LV: 21,
	MT: 18,
	NL: 21,
	PL: 23,
	PT: 23,
	RO: 19,
	SE: 25,
	SI: 22,
	SK: 20,
	GB: 20 
};
  

function getByCountryCode(code, isBusiness){

	let rate;

	if(isBusiness) {

		if(code === "GB"){
			rate = { standardRate : vat["GB"] };
		} else {
			rate = { standardRate : 0 };
		}

	} else {

		rate = { standardRate : vat[code] };

		if(!rate){
			rate = {standardRate : 0 };
		}
	}

	if (rate.standardRate) {
		return rate.standardRate / 100;
	} else {
		return 0;
	}

}

const soapClient = soap.createClientAsync(vatValidationUrl);

function checkVAT(code, vatNum){

	const isDebug = config.vat && config.vat.debug && config.vat.debug.skipChecking;
	const isOutsideEU = addressMeta.euCountriesCode.indexOf(code) === -1;
	
	return new Promise((resolve, reject) => {

		// TODO: Should we try to validate the country code at least?
		if(isDebug || isOutsideEU) {
			return resolve({ valid: true });
		} 

		if(!vatValidationUrl){
			const vatMsg = "vat.checkUrl is not defined in config file";
			return reject({message: vatMsg});
		}

		console.log("checkVAT Slow Path hit")

		soapClient.then((client) => {
			return client.checkVatAsync({
				countryCode: code,
				vatNumber: vatNum
			});
		}).then((result) => {
			resolve(result);
		})
		.catch((err) => {
			reject(err);
		});

	});

}

module.exports = {
	getByCountryCode,
	checkVAT
};