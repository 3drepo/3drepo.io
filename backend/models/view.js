/**
 *  Copyright (C) 2018 3D Repo Ltd
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

const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const utils = require("../utils");
const uuid = require("node-uuid");
const Schema = mongoose.Schema;
const responseCodes = require("../response_codes.js");
const db = require("../db/db");

const viewSchema = Schema({
	_id: Object,
	name: String,
	clippingPlanes : [Schema.Types.Mixed ],
	viewpoint: {
		position: [Number],
		up: [Number],
		look_at: [Number],
		view_dir: [Number],
		right: [Number]
	},
	screenshot: {
		buffer : Object,
		thumbnail: String,
	}
});

viewSchema.statics.findByUID = function(dbCol, uid){

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(view => {

			if (!view) {
				return Promise.reject(responseCodes.VIEW_NOT_FOUND);
			}

			return view;
		});
};

viewSchema.statics.listViews = function(dbCol){

	const query = {};

	return this.find(dbCol, query).then(results => {
		results.forEach((result) => {
			result._id = utils.uuidToString(result._id);
			if (result.screenshot.buffer) {
				delete result.screenshot.buffer;
			}
		});
		return results;
	});

};

viewSchema.statics.getThumbnail = function(dbColOptions, uid){

	return this.findByUID(dbColOptions, uid).then(view => {
		if(!view.screenshot || !view.screenshot.buffer || !view.screenshot.buffer.buffer){
			return Promise.reject(responseCodes.SCREENSHOT_NOT_FOUND);
		} else {
			// Mongo stores it as it's own binary object, so we need to do buffer.buffer!
			return view.screenshot.buffer.buffer;
		}
	});

};

viewSchema.methods.updateAttrs = function(dbCol, data){

	const toUpdate = {};
	const fieldsCanBeUpdated = ["name", "clippingPlanes", "viewpoint", "screenshot"];
	let cropped;

	if (data.screenshot.base64) {
		cropped = utils.getCroppedScreenshotFromBase64(data.screenshot.base64, 120, 120);
	} else {
		cropped = Promise.resolve();
	}
	
	const updated = cropped.then((croppedScreenshot) => {

		if (croppedScreenshot) {
			// Remove the base64 version of the screenshot
			delete data.screenshot.base64;
			data.screenshot.buffer = new Buffer.from(croppedScreenshot, "base64");
		}

		// Set the data to be updated in Mongo
		fieldsCanBeUpdated.forEach((key) => {
			if (data[key]) {
				toUpdate[key] = data[key];
			}
		});

	});

	return updated.then(() => {
		return db.getCollection(dbCol.account, dbCol.model + ".views").then(_dbCol => {
			return _dbCol.update({_id: this._id}, {$set: toUpdate}).then(() => {
				return {_id: utils.uuidToString(this._id)};
			}); 
		});
	});
	
};

viewSchema.statics.createView = function(dbCol, data){
	const view = this.model("View").createInstance({
		account: dbCol.account, 
		model: dbCol.model
	});

	view._id = utils.stringToUUID(uuid.v1());

	const cropped = utils.getCroppedScreenshotFromBase64(data.screenshot.base64, 120, 120);

	return cropped.then((croppedScreenshot) => {

		const thumbnailUrl = `${dbCol.account}/${dbCol.model}/views/${utils.uuidToString(view._id)}/thumbnail.png`;

		// Remove the base64 version of the screenshot
		delete data.screenshot.base64; 
		data.screenshot.buffer = new Buffer.from(croppedScreenshot, "base64");
		data.screenshot.thumbnail = thumbnailUrl;

		return view.save().then((savedView) => {
			return savedView.updateAttrs(dbCol, data).catch((err) => {
				// remove the recently saved new view as update attributes failed
				return View.deleteView(dbCol, view._id).then(() => {
					return Promise.reject(err);
				});
			});
		});
	});

};

viewSchema.methods.clean = function(){

	let cleaned = this.toObject();
	cleaned._id = utils.uuidToString(cleaned._id);

	return cleaned;
};

viewSchema.statics.deleteView = function(dbCol, id){

	if ("[object String]" === Object.prototype.toString.call(id)) {
		id = utils.stringToUUID(id);
	}

	return View.findOneAndRemove(dbCol, { _id : id}).then(view => {

		if(!view){
			return Promise.reject(responseCodes.VIEW_NOT_FOUND);
		}

	});
};

const View = ModelFactory.createClass(
	"View", 
	viewSchema, 
	arg => { 
		return `${arg.model}.views`;
	}
);


module.exports = View;
