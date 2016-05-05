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
var ModelFactory = require('./factory/modelFactory');

var schema = mongoose.Schema({
	_id : String,
	owner: String,
	users: [String],
	desc: String,
	type: String,
	permissions: [Number],
	properties: {}, // TO-DO: ask tim/carmen for full properties and update this schema
	info: mongoose.Schema({

		name: String,
		site: String,
		code: String,
		client: String,
		budget: Number,
		completedBy: Date,
		contact: String
	})
});

schema.statics.mapTilesProp = ['lat', 'lon', 'width', 'height'];
schema.methods.updateMapTileCoors = function(updateObj){
	'use strict';

	let mapTilesProp = this.constructor.mapTilesProp;

	this.properties = this.properties || {};
	this.properties.mapTile = this.properties.mapTile || {};

	mapTilesProp.forEach(key => {

		if(updateObj[key]){
			this.properties.mapTile[key] = updateObj[key];
		}
	});

	// this is needed since properties didn't have a strict schema, need to tell mongoose this is changed
	this.markModified('properties');
	return this.save();

};

var ProjectSetting = ModelFactory.createClass(
	'ProjectSetting',
	schema,
	() => {
		return 'settings';
	}
);

module.exports = ProjectSetting;
