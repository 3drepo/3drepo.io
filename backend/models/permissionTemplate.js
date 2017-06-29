/**
 *  Copyright (C) 2017 3D Repo Ltd
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

(() => {
	"use strict";

	const mongoose = require("mongoose");
	const schema = mongoose.Schema({
		_id: String,
		permissions: [String]
	});
	const responseCodes = require('../response_codes.js');
	const C = require('../constants');
	const _ = require('lodash');

	const methods = {
		get: function(){
			return this.permissions;
		},

		init: function(user, permissions) {

			this.user = user;
			this.permissions = permissions;
			return this;
		},

		findById: function(id){
			return this.permissions.id(id);
		},

		add: function(permission){

			let isPermissionInvalid = !Array.isArray(permission.permissions) || 
				_.intersection(permission.permissions, C.MODEL_PERM_LIST).length !== permission.permissions.length;

			if (this.findById(permission._id)){
				return Promise.reject(responseCodes.DUP_PERM_TEMPLATE);
			} else if (isPermissionInvalid) {
				return Promise.reject(responseCodes.INVALID_PERM);
			} else {
				this.permissions.push(permission);
				return this.user.save().then(() => permission);
			}
		},

		remove: function(id){

			if(id === C.ADMIN_TEMPLATE){
				return Promise.reject(responseCodes.ADMIN_TEMPLATE_CANNOT_CHANGE);
			}

			let permission = this.findById(id);
			
			 if (!permission) {
				return Promise.reject(responseCodes.PERM_NOT_FOUND);
			} else {
				permission.remove();
				return this.user.save();
			}
			
		}
	};

	// Mongoose doesn't support subschema static method
	module.exports = {
		schema, methods
	};

})();