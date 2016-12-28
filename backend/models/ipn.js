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
(() => {
	"use strict";

	const mongoose = require('mongoose');
	const ModelFactory = require('./factory/modelFactory');
		
	let schema = mongoose.Schema({
		createdAt: Date,
		message: {}
	});


	schema.pre('save', function(next){

		if(!this.createdAt){
			this.createdAt = new Date();
		}

		next();
	});

	schema.statics.save = function(ipnMessage){
		
		let ipn = IPN.createInstance({ account: 'admin' });
		ipn.message = ipnMessage;
		ipn.markModified('message');

		return ipn.save();
	};


	let IPN = ModelFactory.createClass(
		'IPN',
		schema,
		() => {
			return 'ipns';
		}
	);

	module.exports = IPN;
	
})();
