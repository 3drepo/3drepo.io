/**
 *  Copyright (C) 2016 3D Repo Ltd
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
var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');


var schema = mongoose.Schema({
	billingAgreementId: String,
	gateway: String,
	raw: {},
	createdAt: Date,
	currency: String,
	amount: String,
	items: [{
		name: String,
		description:  String, 
		currency: String,
		amount: Number,
		taxAmount: Number
	}],
	periodStart: Date,
	periodEnd: Date,
	nextPaymentDate: Date,
	nextPaymentAmount: String,
	taxAmount: String,
	info: {
		"vat": String,
		"line1": String,
		"line2": String,
		"line3": String,
		"state": String,
		"firstName": String,
		"lastName": String,
		"company": String,
		"city": String,
		"postalCode": String,
		"countryCode": String
	}
});

schema.statics.findByAccount = function(account){
	return this.find({account}, {}, {raw: 0}, {sort: {periodStart: -1}});
};

var Billing = ModelFactory.createClass(
	'Billing',
	schema,
	() => {
		return 'billings';
	}
);


module.exports = Billing;