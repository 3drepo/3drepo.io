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

groupSchema.statics.ifcGuidToUUIDs = function(account, model, ifcGuid) {
	return Meta.find({ account, model }, { type: "meta", "metadata.IFC GUID": ifcGuid }, { "parents": 1, "metadata.IFC GUID": 1 })
		.then(results => {
			let uuids = [];
			for (let i = 0; i < results.length; i++) {
				uuids = uuids.concat(results[i].parents);
				/*if (results[i].parents.length > 0) {
					uuids.push(results[i].parents[0]);
				}*/
			}
			return uuids;
		});
}

groupSchema.methods.uuidToIfcGuids = function(obj) {
	var account = obj.account;
	var model = obj.model;
	var uid = obj.shared_id;
	var parent = utils.stringToUUID(uid);
	//Meta.find({ account, model }, { type: "meta", parents: { $in: objects } }, { "parents": 1, "metadata.IFC GUID": 1 })
	return Meta.find({ account, model }, { type: "meta", parents: parent }, { "parents": 1, "metadata.IFC GUID": 1 })
		.then(results => {
			var ifcGuids = [];
			results.forEach(res => {
				if (groupSchema.statics.isIfcGuid(res.metadata['IFC GUID'])) {
					ifcGuids.push(res.metadata['IFC GUID']);
				}
			});
			return ifcGuids;
		});
}

/**
 * IFC Guid definition: [0-9,A-Z,a-z,_$]* (length = 22)
 */
groupSchema.statics.isIfcGuid = function(value) {
	return value && 22 === value.length;
}

groupSchema.statics.findByUID = function(dbCol, uid){
	'use strict';
	
	return this.findOne(dbCol, { _id: utils.stringToUUID(uid) })
		.then(group => {
			let sharedIdObjects;
			let sharedIdPromises = [];

			for (let i = 0; i < group.objects.length; i++) {
				if (this.isIfcGuid(group.objects[i].ifc_guid)) {
					sharedIdPromises.push(
						this.ifcGuidToUUIDs(group.objects[i].account,
							group.objects[i].model,
							group.objects[i].ifc_guid).then(sharedIds => {
							for (let j = 0; j < sharedIds.length; j++) {
								if (!sharedIdObjects) {
									sharedIdObjects = [];
								}
								sharedIdObjects.push({
									account: group.objects[i].account,
									model: group.objects[i].model,
									shared_id: sharedIds[j]
								});
							}
						})
					)
				}
			}

			return Promise.all(sharedIdPromises).then(() => {
				if (sharedIdObjects && sharedIdObjects.length > 0) {
					group.objects = sharedIdObjects;
				}
				return group;
			});
		});;
};

groupSchema.statics.listGroups = function(dbCol){
	'use strict';

	return this.find(dbCol, {});
};

groupSchema.methods.updateAttrs = function(data){
	'use strict';

	let ifcGuidPromises = [];

	data.objects.forEach(obj => {
		if ("[object String]" === Object.prototype.toString.call(obj.id)) {
			obj.id = utils.stringToUUID(obj.id);
		}
		ifcGuidPromises.push(
			this.uuidToIfcGuids(obj).then(ifcGuids => {
				if (ifcGuids && ifcGuids.length > 0) {
					for (let i = 0; i < ifcGuids.length; i++) {
						obj.ifc_guid = ifcGuids[i];
						delete obj.shared_id;
					}
				}
			})
		);
	});

	return Promise.all(ifcGuidPromises).then(() => {

		this.name = data.name || this.name;
		this.objects = data.objects || this.objects;
		this.color = data.color || this.color;

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
		cleaned.objects.forEach(object => {
			if (object.shared_id &&
				"[object String]" !== Object.prototype.toString.call(object.shared_id)) {
				//object.id = utils.uuidToString(object.id);
				object.shared_id = utils.uuidToString(object.shared_id);
			}
		});
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
