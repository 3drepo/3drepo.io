/**
 *  Copyright (C) 2014 3D Repo Ltd
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

"use strict";

const { checkVAT } = require("./vat");
const responseCodes = require("../response_codes");
const systemLogger = require("../logger.js").systemLogger;
const { omit } = require("lodash");

const BillingAddress = {};

BillingAddress.changeVATNumber = async function(billing, vatCode) {
	billing.vat = vatCode;

	let cleanedVATNumber = billing.vat.replace(/ /g,"");
	if (cleanedVATNumber.toUpperCase().startsWith(this.countryCode)) {
		cleanedVATNumber = cleanedVATNumber.substr(2);
	}

	try {
		const { valid } = await checkVAT(billing.countryCode, cleanedVATNumber);
		if (!valid) {
			throw (responseCodes.INVALID_VAT);
		}
	} catch(err) {
		systemLogger.logError(`VAT Error - ${err}`);
		throw (responseCodes.VAT_CODE_ERROR);
	}

	return billing;
};

BillingAddress.changeBillingAddress = async function (billing, billingAddress) {
	billing = {...billing, ...omit(billingAddress, "_.id")};

	if(billingAddress.vat) {
		billing = await this.changeVATNumber(billing, billingAddress.vat);
	}

	return billing;
};

module.exports = BillingAddress;
