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
	subscriptionToken: String,
	gateway: String,
	raw: {},
	createdAt: Date,
	currency: String,
	amount: String
});

schema.statics.findBySubscriptionToken = function(account, token){
	return this.find({account}, { subscriptionToken: token }, {}, {sort: {createdAt: -1}});
};

var Billing = ModelFactory.createClass(
	'Billing',
	schema,
	() => {
		return 'billings';
	}
);


module.exports = Billing;