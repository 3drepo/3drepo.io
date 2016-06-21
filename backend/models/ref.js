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


var _ = require('lodash');
var repoBase = require('./base/repo');
var mongoose = require('mongoose');
var ModelFactory = require('./factory/modelFactory');

var Schema = mongoose.Schema;

var refSchema = Schema(
	_.extend({}, repoBase.attrs, {
		// no extra attributes
		_id: Object,
		type: { type: String, default: 'ref'},
		unique: Object,
		project: String,
		owner: String,
		_rid: Object

	})
);


refSchema.statics = {};
refSchema.methods = {};


var Ref = ModelFactory.createClass(
	'Ref', 
	refSchema, 
	arg => { 
		return `${arg.project}.scene`;
	}
);

module.exports = Ref;