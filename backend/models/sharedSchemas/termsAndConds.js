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


var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var keySchema = Schema({
	name: {type: String, required: true},
	datatype: {type: String, enum: ['string', 'boolean', 'date'], default: 'string'},
	control: {type: String, enum: ['checkbox', 'text', 'textarea', 'date'], default: 'text'}
});

var itemSchema = Schema({
	type: {type: String, enum: ['keyvalue', 'table']},
	keys: [ keySchema ],
	values: [Schema.Types.Mixed]
});

var blockSchema = Schema({
	block: {type: String, required: true},
	items : [ itemSchema ]
});

var termsAndConds = [blockSchema];
module.exports = termsAndConds;