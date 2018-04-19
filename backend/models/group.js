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

const mongoose = require("mongoose");
const ModelFactory = require("./factory/modelFactory");
const utils = require("../utils");
const uuid = require("node-uuid");
const Schema = mongoose.Schema;
const responseCodes = require("../response_codes.js");
const Meta = require("./meta");


const groupSchema = Schema({
	_id: Object,
	name: String,
	author: String,
	description: String,
	createdAt: Date,
	updatedAt: Date,
	updatedBy: String,
	objects: [{
		_id : false,
		account: String,
		model: String,
		shared_ids: [],
		ifc_guids: [String]
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

			const parents = results.map(x => x = x.parents).reduce((acc, val) => acc.concat(val), []);

			const meshQuery = { shared_id: { $in: parents }, type: "mesh" };
			const meshProject = { shared_id: 1, _id: 0 };

			return dbCol.find(meshQuery, meshProject).toArray();
		});
	});

};

groupSchema.statics.uuidToIfcGuids = function(obj) {
	const account = obj.account;
	const model = obj.model;
	const uid =("[object String]" !== Object.prototype.toString.call(uid)) ?  utils.uuidToString(uid) :  obj.shared_id;
	const parent = utils.stringToUUID(uid);
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

	console.log("findIfcGroupByUID");

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

/**
 * Converts all IFC Guids to shared IDs if applicable and return the objects array.
 */
groupSchema.methods.getObjectsArrayAsSharedIDs = function(convertSharedIDsToString) {

	const sharedIdPromises = [];

	for (let i = 0; i < this.objects.length; i++) {

		const sharedIdsSet = new Set();

		const sharedIdObject = {};
		sharedIdObject.account = this.objects[i].account;
		sharedIdObject.model = this.objects[i].model;

		let ifcGuids = this.objects[i].ifc_guids ? this.objects[i].ifc_guids : [];

		for (let j = 0; this.objects[i].shared_ids && j < this.objects[i].shared_ids.length; j++) {
			let sharedId = this.objects[i].shared_ids[j];
			if ("[object String]" !== Object.prototype.toString.call(sharedId)) {
				sharedId = utils.uuidToString(sharedId);
			}
			sharedIdsSet.add(sharedId);
		}

		sharedIdPromises.push(Group.ifcGuidsToUUIDs(
					sharedIdObject.account,
					sharedIdObject.model,
					ifcGuids
					).then(sharedIdResults => {
			for (let j = 0; j < sharedIdResults.length; j++) {
				if ("[object String]" !== Object.prototype.toString.call(sharedIdResults[j].shared_id)) {
					sharedIdResults[j].shared_id = utils.uuidToString(sharedIdResults[j].shared_id);
				}
				sharedIdsSet.add(sharedIdResults[j].shared_id);
			}

			if (sharedIdsSet.size > 0) {
				sharedIdObject.shared_ids = [];
				sharedIdsSet.forEach(id => {
					if (!convertSharedIDsToString) {
						id = utils.stringToUUID(id);
					}
					sharedIdObject.shared_ids.push(id);
				});
			}

			return sharedIdObject;
		}));
	}

	return Promise.all(sharedIdPromises).then(sharedIdObjects => {
		return sharedIdObjects;
	});
}

groupSchema.statics.findByUID = function(dbCol, uid){

	console.log("findByUID");

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {

			if (!group) {
				return Promise.reject(responseCodes.GROUP_NOT_FOUND);
			}

			return group.getObjectsArrayAsSharedIDs(false).then((sharedIdObjects) => {
				group.objects = sharedIdObjects;
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

			return group.getObjectsArrayAsSharedIDs(true).then((sharedIdObjects) => {

				const returnGroup = { _id: utils.uuidToString(group._id), color: group.color};
				returnGroup.objects = sharedIdObjects;
				return returnGroup;
			});
		});
};

groupSchema.statics.listGroups = function(dbCol, queryParams){

	console.log("listGroups");
	const query = {};

	// If we want groups that aren't from issues
	if (queryParams.noIssues) {
		query.issue_id = { $exists: false };
	}
	return this.find(dbCol, query).then(results => {
		const sharedIdConversionPromises = [];

		results.forEach(result => {
			sharedIdConversionPromises.push(
				result.getObjectsArrayAsSharedIDs(false).then(sharedIdObjects => {
					result.objects = sharedIdObjects;
				})
			);
		});

		return Promise.all(sharedIdConversionPromises).then(() => {
			return results;
		});
	});
};

groupSchema.statics.updateIssueId = function(dbCol, uid, issueId) {

	return this.findOne(dbCol, { _id: uid }).then(group => {
		const issueIdData = {
			issue_id: issueId
		};

		return group.updateAttrs(dbCol, issueIdData);
	});
};

groupSchema.methods.updateAttrs = function(dbCol, data){

	const ifcGuidPromises = [];

	if (data.objects) {
		for (let i = 0; i < data.objects.length; i++) {
			const account = data.objects[i].account;
			const model = data.objects[i].model;

			const sharedIdsSet = new Set();
			const ifcGuidsSet = new Set();

			let sharedIds = data.objects[i].shared_ids ? data.objects[i].shared_ids : [];
				
			for (let j = 0; j < sharedIds.length; j++) {
				if ("[object String]" === Object.prototype.toString.call(sharedIds[j])) {
					sharedIds[j] = utils.stringToUUID(sharedIds[j]);
				}

				sharedIdsSet.add(utils.uuidToString(sharedIds[j]));
			}

			if (data.objects[i].ifc_guids) {
				data.objects[i].ifc_guids.forEach(ifcGuid => {
					ifcGuidsSet.add(ifcGuid);
				});
			}

			ifcGuidPromises.push(
				uuidsToIfcGuids(account, model, sharedIds).then(ifcGuids => {
					if (ifcGuids && ifcGuids.length > 0) {
						for (let j = 0; j < ifcGuids.length; j++) {
							ifcGuidsSet.add(ifcGuids[j].metadata["IFC GUID"]);

							for (let k = 0; k < ifcGuids[j].parents.length; k++) {
								sharedIdsSet.delete(utils.uuidToString(ifcGuids[j].parents[k]));
							}
						}
					}

					const convertedObjectsResponse = {
						account,
						model
					};

					if (sharedIdsSet.size > 0) {
						convertedObjectsResponse.shared_ids = [];
						sharedIdsSet.forEach(id => {
							convertedObjectsResponse.shared_ids.push(utils.stringToUUID(id));
						});
					}

					if (ifcGuidsSet.size > 0) {
						convertedObjectsResponse.ifc_guids = [];
						ifcGuidsSet.forEach(id => {
							convertedObjectsResponse.ifc_guids.push(id);
						});
					}

					return convertedObjectsResponse;
				})
			);
		}
	}

	return Promise.all(ifcGuidPromises).then(convertedObjects => {
		const toUpdate = {};
		const fieldsCanBeUpdated = ["description", "name", "author", "createdAt", "updatedBy", "updatedAt", "objects", "color", "issue_id"];
		
		fieldsCanBeUpdated.forEach((key) => {
			if (data[key]) {
				if (key === "objects") {
					toUpdate.objects = convertedObjects;
				}
				else {
					toUpdate[key] = data[key];
				}
			}
		});

		
		const db = require("../db/db");
		return db.getCollection(dbCol.account, dbCol.model + ".groups").then(dbCol => {
			return dbCol.update({_id: this._id}, {$set: toUpdate}).then( ()=>{
				return {_id: utils.uuidToString(this._id)};
			}); 
		});
	});

};

groupSchema.statics.createGroup = function(dbCol, data){
	const group = this.model("Group").createInstance({
		account: dbCol.account, 
		model: dbCol.model
	});

	group._id = utils.stringToUUID(uuid.v1());
	return group.save().then( (savedGroup)=>{
		return savedGroup.updateAttrs(dbCol, data).catch((err) => {
			//remove the recently saved new group as update attributes failed
			return Group.deleteGroup(dbCol, group._id).then(() => {
				return Promise.reject(err);
			});
		});
	});
};

groupSchema.methods.clean = function(){

	console.log("clean");

	let cleaned = this.toObject();
	cleaned._id = utils.uuidToString(cleaned._id);
	cleaned.issue_id = cleaned.issue_id && utils.uuidToString(cleaned.issue_id);
	if (cleaned.objects) {
		for (let i = 0; i < cleaned.objects.length; i++) {
			const object = cleaned.objects[i];
			if (object.shared_id &&
				"[object String]" !== Object.prototype.toString.call(object.shared_id)) {
				object.shared_id = utils.uuidToString(object.shared_id);
			}
		}
	}
	return cleaned;

};


groupSchema.statics.deleteGroup = function(dbCol, id){

	if ("[object String]" === Object.prototype.toString.call(id)) {
		id = utils.stringToUUID(id);
	}

	return Group.findOneAndRemove(dbCol, { _id : id}).then(group => {

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
