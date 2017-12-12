/**
 *	Copyright (C) 2017 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(() => {
	"use strict";

	const mongoose = require('mongoose');
	const ModelFactory = require('./factory/modelFactory');
	const C = require('../constants');

	const schema = mongoose.Schema({
		_id : String,
		role: String,
		privileges: {},
		roles: []
	});

	schema.statics.createTeamSpaceRole = function (account) {
		const roleId = `${account}.${C.DEFAULT_MEMBER_ROLE}`;

		return Role.findByRoleID(roleId).then(roleFound => {
			if(roleFound){
				roleFound = roleFound.toObject();
				return { role: roleFound.role, db: roleFound.db};
			} else {
				let roleName = C.DEFAULT_MEMBER_ROLE;
				let createRoleCmd = {
					'createRole': roleName,
			   		'privileges':[{
							"resource":{
								"db": account,
			   					"collection": "settings"
							},
			   				"actions": ["find"]}
						],
			   		'roles': []
				};

				return ModelFactory.dbManager.runCommand(account, createRoleCmd).then(()=> {
							return {role: roleName, db: account};
						});
			}
		});

	};

	schema.statics.dropTeamSpaceRole = function (account) {
		let dropRoleCmd = {
			'dropRole' : C.DEFAULT_MEMBER_ROLE
		};

		return this.findByRoleID(`${account}.${C.DEFAULT_MEMBER_ROLE}`).then(role => {
			if(!role){
				return Promise.resolve();
			} else {
				return ModelFactory.dbManager.runCommand(account, dropRoleCmd);
			}
		});
		
	};

	schema.statics.grantTeamSpaceRoleToUser = function (username, account) {
		
		let grantRoleCmd = {
			grantRolesToUser: username,
			roles: [{role: C.DEFAULT_MEMBER_ROLE, db: account}]
		};
		
		return ModelFactory.dbManager.command("admin", grantRoleCmd);
	};


	schema.statics.findByRoleID = function(id){
		return this.findOne({ account: 'admin'}, { _id: id});
	};

	schema.statics.revokeTeamSpaceRoleFromUser = function(username, account){

		let cmd = {
			revokeRolesFromUser: username,
			roles: [{role: C.DEFAULT_MEMBER_ROLE, db: account}]
		};

		return ModelFactory.dbManager.runCommand("admin", cmd);
	};


	var Role = ModelFactory.createClass(
		'Role', 
		schema, 
		() => {
			return 'system.roles';
		}
	);

	module.exports = Role;

})();
