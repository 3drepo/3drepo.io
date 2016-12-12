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

(() => {
	"use strict";

	const mongoose = require("mongoose");
	const vat = require("./vat");
	const addressMeta = require("./addressMeta");
	const responseCodes = require("../response_codes");

	module.exports = function () {
		let _hasChanged = false;

		let hasChanged = function () {
			let tempHasChanged = _hasChanged;
			_hasChanged = false;
			return tempHasChanged;
		}

		let monitorChange = function(fieldName) {
			return function (newValue) {
				if (this[fieldName] !== newValue) {
					_hasChanged = true;
				}

				return newValue;
			};
		};

		let changeVATNumber = function(vatCode) {
			if (this.vat !== vat)
			{
				_hasChanged = true;
			}

			let cleanedVATNumber = this.vat;
			if (this.vat && this.vat.toUpperCase().startsWith(this.countryCode)) {
				cleanedVATNumber = this.vat.substr(2); 
			}

			let checkVAT = this.vat && addressMeta.euCountriesCode.indexOf(this.countryCode) !== -1 ? 
			vat.checkVAT(this.countryCode, cleanedVATNumber) : Promise.resolve(({ valid: true }));

			checkVAT.then(result => {
				if (!result.valid)
				{
					throw new Error(responseCodes.INVALID_VAT);
				} else {
					return vatCode;
				}
			});
		};

		let billingAddressSchema = new mongoose.Schema({
			vat: { type: String, set: changeVATNumber },
			line1: { type: String, set: monitorChange("line1") },
			line2: { type: String, set: monitorChange("line2") },
			line3: { type: String, set: monitorChange("line3") },
			firstName: { type: String, set: monitorChange("firstName") },
			lastName: { type: String, set: monitorChange("lastName") },
			company: { type: String, set: monitorChange("company") },
			city: { type: String, set: monitorChange("city") },
			postalCode: { type: String, set: monitorChange("postalCode") },
			countryCode: { type: String, set: monitorChange("countryCode") },
			state: { type: String, set: monitorChange("state") },
		});

		return billingAddressSchema;
	};
})();