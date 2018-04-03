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
let responseCodes = require("../response_codes.js");
let Meta = require("./meta");


let groupSchema = Schema({
	// no extra attributes
	_id: Object,
	name: String,
	author: String,
	description: String,
	createdAt: Date,
	updatedAt: Date,
	updatedBy: String,
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

groupSchema.statics.ifcGuidsToUUIDs = function(account, model, ifcGuids) {
	const query = { type: "meta", "metadata.IFC GUID": {$in: ifcGuids }};
	const project = { parents: 1, _id: 0 };

	const db = require("../db/db");
	return db.getCollection(account, model+ ".scene").then(dbCol => {
		return dbCol.find(query, project).toArray().then(results => {
			return results;
		});
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
	return Meta.find({ account, model }, { type: "meta", parents: parent, "metadata.IFC GUID": {$exists: true} }, { "parents": 1, "metadata.IFC GUID": 1 })
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

function uuidsToIfcGuids(account, model, ids) {
	const query = { type: "meta", parents: {$in: ids}, "metadata.IFC GUID": {$exists: true} };
	const project =  { "metadata.IFC GUID": 1 , parents: 1};
	const db = require("../db/db");
	return db.getCollection(account, model+ ".scene").then(dbCol => {
		return dbCol.find(query, project).toArray().then(results => {
			return results;
		});
	});
}



/**
 * IFC Guid definition: [0-9,A-Z,a-z,_$]* (length = 22)
 */
groupSchema.statics.isIfcGuid = function(value) {
	return value && 22 === value.length;
};

groupSchema.statics.findIfcGroupByUID = function(dbCol, uid){

	// Extract a unique list of IDs only
	let groupObjectsMap = [];

	return this.findOne(dbCol, { _id: uid })
		.then(group => {

			if (!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

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
								for (let j = 0; j < ifcGuids.length; j++) {
									obj.ifc_guid = ifcGuids[j];
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
						if (groupObjectsMap.hasOwnProperty(id)) {
							group.objects.push(groupObjectsMap[id]);
						}
					}
				}
				return group;
			});
		});
};


groupSchema.statics.findByUID = function(dbCol, uid){

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {

			if (!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

			let sharedIdObjects = [];
			let sharedIdPromises = [];
			let ifcObjectByAccount = {};

			if (group.objects && group.objects.length) {
				for (let i = 0; i < group.objects.length; i++) {
					if (this.isIfcGuid(group.objects[i].ifc_guid)) {
						const namespace = group.objects[i].account + "__" + group.objects[i].model;
						if(!ifcObjectByAccount[namespace]) {
							ifcObjectByAccount[namespace] = [];
						}
						ifcObjectByAccount[namespace].push(group.objects[i].ifc_guid);
					}
				}
	
				for (let namespace in ifcObjectByAccount) {

					if (!ifcObjectByAccount.hasOwnProperty(namespace)) {
						continue;
					}

					const nsSplitArr = namespace.split("__");
					const account = nsSplitArr[0];
					const model = nsSplitArr[1];
					sharedIdPromises.push(
						this.ifcGuidsToUUIDs(account,
							model,
							ifcObjectByAccount[namespace]).then(sharedIds => {
							for (let j = 0; j < sharedIds.length; j++) {
								sharedIdObjects.push({
									account,
									model,
									shared_id: sharedIds[j]
								});
							}
						})
					);
					
				}
			}

			return Promise.all(sharedIdPromises).then(() => {
				if (sharedIdObjects && sharedIdObjects.length > 0) {
					group.objects = sharedIdObjects;
				}
				return group;
			});
		});

};

groupSchema.statics.findByUIDSerialised = function(dbCol, uid){

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {

			if (!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

			const sharedIdObjects = [];
			const sharedIdPromises = [];
			const ifcObjectByAccount = {};

			for (let i = 0; i < group.objects.length; i++) {
				if (this.isIfcGuid(group.objects[i].ifc_guid)) {
					const namespace = group.objects[i].account + "__" + group.objects[i].model;
					if(!ifcObjectByAccount[namespace]) {
						ifcObjectByAccount[namespace] = [];
					}
					ifcObjectByAccount[namespace].push(group.objects[i].ifc_guid);
				}
				else {
					sharedIdObjects.push(group.objects[i]);
				}

			}
			
			for (let namespace in ifcObjectByAccount) {
				if (!ifcObjectByAccount.hasOwnProperty(namespace)) {
					continue;
				}
				const nsSplitArr = namespace.split("__");
				const account = nsSplitArr[0];
				const model = nsSplitArr[1];
				if(account && model) {
					sharedIdPromises.push(this.ifcGuidsToUUIDs(account, model,
						ifcObjectByAccount[namespace]).then(results => {
						for (let i = 0; i < results.length; i++) {
							results[i].parents.forEach( id => {
								sharedIdObjects.push({account, model, shared_id: utils.uuidToString(id)});
							});
						}
					}));
				}

			}

			return Promise.all(sharedIdPromises).then(() => {
				const returnGroup = { _id: utils.uuidToString(group._id), color: group.color};
				returnGroup.objects = sharedIdObjects;
				return returnGroup;
			});
		});
};

groupSchema.statics.listGroups = function(dbCol, query){
	return this.find(dbCol, query || {});
};

groupSchema.statics.updateIssueId = function(dbCol, uid, issueId) {

	return this.findOne(dbCol, { _id: uid }).then(group => {
		const issueIdData = {
			issue_id: issueId
		};

		return group.updateAttrs(issueIdData);
	});
};

groupSchema.methods.updateAttrs = function(data){

	delete data.__v;
	const ifcGuidPromises = [];
	const sharedIdsByAccount = {};	
	const sharedIDSets = new Set();
	let modifiedObjectList = null;

	if (data.objects) {
		modifiedObjectList = [];
		for (let i = 0; i < data.objects.length; i++) {
			const obj = data.objects[i];

			if (obj.shared_id) {
				const ns = obj.account + "__" + obj.model;
				if ("[object String]" === Object.prototype.toString.call(obj.id)) {
					obj.id = utils.stringToUUID(obj.shared_id);
				}
				sharedIDSets.add(obj.id);
				if(!sharedIdsByAccount[ns]) {
					sharedIdsByAccount[ns] = { sharedIDArr : [], org: []};
				}
				sharedIdsByAccount[ns].sharedIDArr.push(obj.id);
				sharedIdsByAccount[ns].org.push(obj);
				
			}
			else {
				modifiedObjectList.push(obj);
			}
		}

		for (let namespace in sharedIdsByAccount) {
			if (!sharedIdsByAccount.hasOwnProperty(namespace)) {
				continue;
			}
			const nsSplitArr = namespace.split("__");
			const account = nsSplitArr[0];
			const model = nsSplitArr[1];
			ifcGuidPromises.push(
				uuidsToIfcGuids(account, model, sharedIdsByAccount[namespace].sharedIDArr).then(ifcGuids => {
					if (ifcGuids && ifcGuids.length > 0) {
						for (let i = 0; i < ifcGuids.length; i++) {
							modifiedObjectList.push({account, model, ifc_guid: ifcGuids[i].metadata["IFC GUID"]});
							for(let j = 0; j < ifcGuids[i].parents.length; j++) {
								sharedIDSets.delete(utils.uuidToString(ifcGuids[i].parents[j]));		
							}
						}

						//if sharedIDSets.size > 0 , it means there are sharedIDs with no IFC GUIDs
						sharedIDSets.forEach((sharedId) => {
							modifiedObjectList.push({
								account,
								model,
								shared_id: sharedId
							});
						});
					}
					else {
						//this isn't a IFC GUID model.
						modifiedObjectList = modifiedObjectList.concat(sharedIdsByAccount[namespace].org);
					}
					
				})
			);
		}

	}

	return Promise.all(ifcGuidPromises).then(() => {
		this.description = data.description;
		this.name = data.name;
		this.author = data.author;
		this.createdAt = data.createdAt;
		this.description = data.description;
		this.updatedAt = data.updatedAt;
		this.updatedBy = data.updatedBy;
		this.objects = modifiedObjectList || this.objects;
		this.color = data.color;
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
