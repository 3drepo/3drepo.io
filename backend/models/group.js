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

"use strict";

let mongoose = require("mongoose");
let ModelFactory = require("./factory/modelFactory");
let utils = require("../utils");
let uuid = require("node-uuid");
let Schema = mongoose.Schema;
let Mesh = require("./mesh");
let responseCodes = require("../response_codes.js");
let Meta = require("./meta");


let groupSchema = Schema({
	// no extra attributes
	_id: Object,
	name: String,
	author: String,
	description: String,
	createdAt: Number,
	objects: [{
		_id : false,
		shared_id: Object,
		account: String,
		model: String,
		ifc_guid: String
	}],
	issue_id: Object,
	color: [Number]
});

groupSchema.statics.ifcGuidToUUIDs = function(account, model, ifcGuid) {
	return Meta.find({ account, model }, { type: "meta", "metadata.IFC GUID": ifcGuid }, { "parents": 1, "metadata.IFC GUID": 1 })
		.then(results => {
			let uuids = [];
			for (let i = 0; i < results.length; i++) {
				uuids = uuids.concat(results[i].parents);
			}
			return uuids;
		});
};

groupSchema.statics.uuidToIfcGuids = function(obj) {
	let account = obj.account;
	let model = obj.model;
	let uid = obj.shared_id;
	if ("[object String]" !== Object.prototype.toString.call(uid)) {
		uid = utils.uuidToString(uid);
	}
	let parent = utils.stringToUUID(uid);
	//Meta.find({ account, model }, { type: "meta", parents: { $in: objects } }, { "parents": 1, "metadata.IFC GUID": 1 })
	return Meta.find({ account, model }, { type: "meta", parents: parent }, { "parents": 1, "metadata.IFC GUID": 1 })
		.then(results => {
			let ifcGuids = [];
			results.forEach(res => {
				if (this.isIfcGuid(res.metadata["IFC GUID"])) {
					ifcGuids.push(res.metadata["IFC GUID"]);
				}
			});
			return ifcGuids;
		});
};

/**
 * IFC Guid definition: [0-9,A-Z,a-z,_$]* (length = 22)
 */
groupSchema.statics.isIfcGuid = function(value) {
	return value && 22 === value.length;
};

groupSchema.statics.findIfcGroupByUID = function(dbCol, uid){

	// Extract a unique list of IDs only
	let groupObjectsMap = [];

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {
			let ifcGuidPromises = [];

			for (let i = 0; group && i < group.objects.length; i++) {
				const obj = group.objects[i];
				if (obj.ifc_guid) {
					groupObjectsMap[obj.ifc_guid] = obj;
				}
				if (obj.shared_id) {
					// Convert sharedIds to IFC Guids
					ifcGuidPromises.push(
						this.uuidToIfcGuids(obj).then(ifcGuids => {
							if (ifcGuids && ifcGuids.length > 0) {
								for (let i = 0; i < ifcGuids.length; i++) {
									obj.ifc_guid = ifcGuids[i];
									delete obj.shared_id;
									groupObjectsMap[obj.ifc_guid] = obj;
								}
							} else {
								groupObjectsMap[obj.shared_id] = obj;
							}
						})
					);
				}
			}

			return Promise.all(ifcGuidPromises).then(() => {
				if (groupObjectsMap && groupObjectsMap.length > 0) {
					group.objects = [];
					for (let id in groupObjectsMap) {
						group.objects.push(groupObjectsMap[id]);
					}
				}
				return group;
			});
		});
};

groupSchema.statics.findByUID = function(dbCol, uid){

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {
			let sharedIdObjects;
			let sharedIdPromises = [];
			let uniqueGroupObjects = [];

			for (let i = 0; i < group.objects.length; i++) {
				if (this.isIfcGuid(group.objects[i].ifc_guid)) {
					uniqueGroupObjects[group.objects[i].ifc_guid] = group.objects[i];
				}
			}

			for (let ifcGuid in uniqueGroupObjects) {
				const groupObject = uniqueGroupObjects[ifcGuid];
				sharedIdPromises.push(
					this.ifcGuidToUUIDs(groupObject.account,
						groupObject.model,
						groupObject.ifc_guid).then(sharedIds => {
						for (let j = 0; j < sharedIds.length; j++) {
							if (!sharedIdObjects) {
								sharedIdObjects = [];
							}
							sharedIdObjects.push({
								account: groupObject.account,
								model: groupObject.model,
								shared_id: sharedIds[j]
							});
						}
					})
				);
			}

			return Promise.all(sharedIdPromises).then(() => {
				if (sharedIdObjects && sharedIdObjects.length > 0) {
					group.objects = sharedIdObjects;
				}
				return group;
			});
		});
};

groupSchema.statics.listGroups = function(dbCol, query){
	return this.find(dbCol, query || {});
};

groupSchema.statics.updateIssueId = function(dbCol, uid, issueId) {
	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) }).then(group => {
		const issueIdData = {
			issue_id: issueId
		};

		return group.updateAttrs(issueIdData);
	});
};

groupSchema.methods.updateAttrs = function(data){
	let ifcGuidPromises = [];

	if (data.objects) {
		for (let i = 0; i < data.objects.length; i++) {
			const obj = data.objects[i];

			if (obj.shared_id) {
				if ("[object String]" === Object.prototype.toString.call(obj.id)) {
					obj.id = utils.stringToUUID(obj.id);
				}
				ifcGuidPromises.push(
					groupSchema.statics.uuidToIfcGuids(obj).then(ifcGuids => {
						if (ifcGuids && ifcGuids.length > 0) {
							for (let i = 0; i < ifcGuids.length; i++) {
								obj.ifc_guid = ifcGuids[i];
								delete obj.shared_id;
							}
						}
					})
				);
			}
		}
	}

	return Promise.all(ifcGuidPromises).then(() => {
		Object.assign(this, data);
		this.markModified("objects");
		return this.save();
	});

};

groupSchema.statics.createGroup = function(dbCol, data){
	let group = this.model("Group").createInstance({
		account: dbCol.account, 
		model: dbCol.model
	});

	group._id = utils.stringToUUID(uuid.v1());
	return group.updateAttrs(data);
};

groupSchema.methods.clean = function(){

	let cleaned = this.toObject();
	cleaned._id = utils.uuidToString(cleaned._id);
	cleaned.issue_id = cleaned.issue_id && utils.uuidToString(cleaned.issue_id);
	if (cleaned.objects) {
		for (let i = 0; i < cleaned.objects.length; i++) {
			const object = cleaned.objects[i];
			if (object.shared_id &&
				"[object String]" !== Object.prototype.toString.call(object.shared_id)) {
				//object.id = utils.uuidToString(object.id);
				object.shared_id = utils.uuidToString(object.shared_id);
			}
		}
	}
	return cleaned;

};


groupSchema.statics.deleteGroup = function(dbCol, id){

	return Group.findOneAndRemove(dbCol, { _id : utils.stringToUUID(id)}).then(group => {

		if(!group){
			return Promise.reject(responseCodes.GROUP_NOT_FOUND);
		}

		let removePromises = [];

		group.objects.forEach(obj => removePromises.push(
			Mesh.removeGroup(
				obj.account,
				obj.model,
				utils.uuidToString(obj.id),
				id
			)
		));

		return Promise.all(removePromises);

	});
};

const Group = ModelFactory.createClass(
	"Group", 
	groupSchema, 
	arg => { 
		return `${arg.model}.groups`;
	}
);


module.exports = Group;
