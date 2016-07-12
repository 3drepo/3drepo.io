var vat = [
	{ countryCode: 'AT', standardRate: 20 },
	{ countryCode: 'BE', standardRate: 21 },
	{ countryCode: 'BG', standardRate: 20 },
	{ countryCode: 'CY', standardRate: 19 },
	{ countryCode: 'CZ', standardRate: 21 },
	{ countryCode: 'DE', standardRate: 19 },
	{ countryCode: 'DK', standardRate: 25 },
	{ countryCode: 'EE', standardRate: 20 },
	{ countryCode: 'EL', standardRate: 23 },
	{ countryCode: 'ES', standardRate: 21 },
	{ countryCode: 'FI', standardRate: 24 },
	{ countryCode: 'FR', standardRate: 20 },
	{ countryCode: 'HR', standardRate: 25 },
	{ countryCode: 'HU', standardRate: 27 },
	{ countryCode: 'IE', standardRate: 23 },
	{ countryCode: 'IT', standardRate: 22 },
	{ countryCode: 'LT', standardRate: 21 },
	{ countryCode: 'LU', standardRate: 17 },
	{ countryCode: 'LV', standardRate: 21 },
	{ countryCode: 'MT', standardRate: 18 },
	{ countryCode: 'NL', standardRate: 21 },
	{ countryCode: 'PL', standardRate: 23 },
	{ countryCode: 'PT', standardRate: 23 },
	{ countryCode: 'RO', standardRate: 20 },
	{ countryCode: 'SE', standardRate: 25 },
	{ countryCode: 'SI', standardRate: 22 },
	{ countryCode: 'SK', standardRate: 20 },
	{ countryCode: 'GB', standardRate: 20 }
];

function getByCountryCode(code){
	'use strict';

	let rate = vat.find(item => item.countryCode === code);

	if(!rate){
		rate = vat.find(item => item.countryCode === 'GB');
	}

	return rate.standardRate / 100;
}

module.exports = {
	getByCountryCode
};