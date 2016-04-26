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
