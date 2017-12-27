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
var DB = require('../db/db');
	
var schema = mongoose.Schema({
	type: String,
	count: Number
});

//inc counter and return the number atomically
schema.statics.findAndIncInvoiceNumber = function(){
	//mongoose findOneAndUpdate hanged for no reason, fallback to mongo native api

	return DB.getDB('admin')
	.then(db => {
		return db.db('admin')
			.collection('counters')
			.findOneAndUpdate(
				{ type: 'invoice' },
				{ '$inc': {'count': 1 }},
				{ upsert : true, returnOriginal: false }
			);
	})
	.then(doc => 'SO-' + doc.value.count);

};


//inc counter and return the number atomically
schema.statics.findAndIncRefundNumber = function(){


	//mongoose findOneAndUpdate hanged for no reason, fallback to mongo native api

	return DB.getDB('admin')
	.then(db => {
		return db.db('admin')
			.collection('counters')
			.findOneAndUpdate(
				{ type: 'refund' },
				{ '$inc': {'count': 1 }},
				{ upsert : true, returnOriginal: false }
			);
	})
	.then(doc => 'CN-' + doc.value.count);

};

var Counter = ModelFactory.createClass(
	'Counter',
	schema,
	() => {
		return 'counters';
	}
);



module.exports = Counter;
