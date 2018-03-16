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
var utils = require('../utils');
var uuid = require('node-uuid');
var _ = require('lodash');
var Schema = mongoose.Schema;
var Mesh = require('./mesh');
var responseCodes = require('../response_codes.js');
var Meta = require('./meta');
var systemLogger = require("../logger.js").systemLogger;
var ifcIdMaps;

var groupSchema = Schema({
	// no extra attributes
	_id: Object,
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
	var account = obj.account;
	var model = obj.model;
	var uid = obj.shared_id;
	if ("[object String]" !== Object.prototype.toString.call(uid)) {
		uid = utils.uuidToString(uid);
	}
	var parent = utils.stringToUUID(uid);
	//Meta.find({ account, model }, { type: "meta", parents: { $in: objects } }, { "parents": 1, "metadata.IFC GUID": 1 })
	return Meta.find({ account, model }, { type: "meta", parents: parent }, { "parents": 1, "metadata.IFC GUID": 1 })
		.then(results => {
			let ifcGuids = [];
			results.forEach(res => {
				if (this.isIfcGuid(res.metadata['IFC GUID'])) {
					ifcGuids.push(res.metadata['IFC GUID']);
				}
			});
			return ifcGuids;
		});
};

function uuidsToIfcGuids(account, model, ids) {
	const query = { type: "meta", parents: {$in: ids} };
	const project =  { "metadata.IFC GUID": 1 };
	const db = require("../db/db");
	return db.getCollection(account, model+ ".scene").then(dbCol => {
		return dbCol.find(query, project).toArray().then(results => {
			return results;
		});
	});
};

/**
 * IFC Guid definition: [0-9,A-Z,a-z,_$]* (length = 22)
 */
groupSchema.statics.isIfcGuid = function(value) {
	return value && 22 === value.length;
};

groupSchema.statics.findIfcGroupByUID = function(dbCol, uid){
	'use strict';

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
	'use strict';

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {
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
				let returnGroup = { _id: utils.uuidToString(group._id), color: group.color}
				returnGroup.objects = sharedIdObjects;
				return returnGroup;
			});
		});
};

groupSchema.statics.listGroups = function(dbCol){
	'use strict';

	return this.find(dbCol, {});
};

groupSchema.statics.updateIssueId = function(dbCol, uid, issueId) {
	'use strict';

	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) }).then(group => {
		const issueIdData = {
			issue_id: issueId
		};

		return group.updateAttrs(issueIdData);
	});
};

groupSchema.methods.updateAttrs = function(data){
	'use strict';

	const ifcGuidPromises = [];
	const sharedIdsByAccount = {};	
	let modifiedObjectList = null;

	if (data.objects) {
		modifiedObjectList = []
		for (let i = 0; i < data.objects.length; i++) {
			const obj = data.objects[i];

			if (obj.shared_id) {
				const ns = obj.account + "__" + obj.model;
				if ("[object String]" === Object.prototype.toString.call(obj.id)) {
					obj.id = utils.stringToUUID(obj.shared_id);
				}
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
			const nsSplitArr = namespace.split("__");
			const account = nsSplitArr[0];
			const model = nsSplitArr[1];
			ifcGuidPromises.push(
				uuidsToIfcGuids(account, model, sharedIdsByAccount[namespace].sharedIDArr).then(ifcGuids => {
					if (ifcGuids && ifcGuids.length > 0) {
						for (let i = 0; i < ifcGuids.length; i++) {
							modifiedObjectList.push({account, model, ifc_guid: ifcGuids[i].metadata["IFC GUID"]});
						}
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

		this.name = data.name || this.name;
		this.objects = modifiedObjectList || this.objects;
		this.color = data.color || this.color;
		this.issue_id = data.issue_id || this.issue_id;

		this.markModified('objects');
		return this.save();
	});
};

groupSchema.statics.createGroup = function(dbCol, data){
	'use strict';

	let group = this.model('Group').createInstance({
		account: dbCol.account, 
		model: dbCol.model
	});

	group._id = utils.stringToUUID(uuid.v1());
	return group.updateAttrs(data);
};

groupSchema.methods.clean = function(){
	'use strict';

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
	'use strict';

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

var Group = ModelFactory.createClass(
	'Group', 
	groupSchema, 
	arg => { 
		return `${arg.model}.groups`;
	}
);


module.exports = Group;
