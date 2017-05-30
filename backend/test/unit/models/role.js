'use strict';
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

let chai = require("chai");
let expect = require('chai').expect;
let _ = require('lodash');


let proxyquire = require('proxyquire').noCallThru();
let sinon = require('sinon');
let C = require('../../../constants');
let mongoose = require('mongoose');
let mockgoose = require('mockgoose');
let ModelSetting = require('../../../models/modelSetting');

let modelFactoryMock = proxyquire('../../../models/factory/modelFactory', { 
	'mongoose': mongoose, 
});

modelFactoryMock.db = {
	db: () => {
		return {
			command: cmd => {
				return {
					then: () => cmd
				}
			}
		};
	}
};

let RoleTemplates = proxyquire('../../../models/role_templates', {
	'./factory/modelFactory': modelFactoryMock,
	'../response_codes': {}
});

let Role = proxyquire('../../../models/role', {
	'mongoose': mongoose,
	'../response_codes': {},
	'./factory/modelFactory': modelFactoryMock,
	'./role_templates': RoleTemplates
});

describe('Role templates model', function(){
	describe('#roleTemplates', function(){

		it('should have roleTemplates defined', function(){
			expect(RoleTemplates.roleTemplates).to.exist;

		})

	});


	describe('#createRoleFromTemplate', function(){

		it(`should create expected privileges for ${C.ADMIN_TEMPLATE} role`, function(){
			let account = 'testacct';
			let model = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, model, C.ADMIN_TEMPLATE);

			expect(createCmd).to.deep.equal({
				createRole: C.ADMIN_TEMPLATE,
				privileges: [],
				roles: [{
					role: 'readWrite',
					db: account
				}]
			});
		});

		it(`should create expected privileges for ${C.ADMIN_TEMPLATE} role with custom role name`, function(){
			let account = 'testacct';
			let model = 'testproject';
			let roleName = 'abc123'
			let createCmd = RoleTemplates.createRoleFromTemplate(account, model, C.ADMIN_TEMPLATE, roleName);

			expect(createCmd).to.deep.equal({
				createRole: roleName,
				privileges: [],
				roles: [{
					role: 'readWrite',
					db: account
				}]
			});
		});

		it(`should create expected privileges for ${C.VIEWER_TEMPLATE} role`, function(){
			let account = 'testacct';
			let model = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, model, C.VIEWER_TEMPLATE);

			let expectedCreateCmd = {
				createRole: `${model}.${C.VIEWER_TEMPLATE}`,
				privileges: [{
					"resource" : {
						"db" : account,
						"collection" : `${model}.history`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.scene`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.json_mpc.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.json_mpc.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.src.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.src.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.issues`
					},
					"actions" : [ 
						"find",
					]
				}],
				roles: []
			};

			expect(createCmd.createRole).to.equal(expectedCreateCmd.createRole);
			expect(createCmd.privileges).to.deep.include.members(expectedCreateCmd.privileges);
			// make sure no extra privileges are given
			expect(createCmd.privileges.length).to.equal(expectedCreateCmd.privileges.length);

		});


		it(`should create expected privileges for ${C.COMMENTER_TEMPLATE} role`, function(){
			let account = 'testacct';
			let model = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, model, C.COMMENTER_TEMPLATE);

			let expectedCreateCmd = {
				createRole: `${model}.${C.COMMENTER_TEMPLATE}`,
				privileges: [{
					"resource" : {
						"db" : account,
						"collection" : `${model}.history`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.scene`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.json_mpc.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.json_mpc.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.src.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.src.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.issues`
					},
					"actions" : [ 
						"find", "insert", "update"
					]
				}],
				roles: []
			};

			expect(createCmd.createRole).to.equal(expectedCreateCmd.createRole);
			expect(createCmd.privileges).to.deep.include.members(expectedCreateCmd.privileges);
			// make sure no extra privileges are given
			expect(createCmd.privileges.length).to.equal(expectedCreateCmd.privileges.length);
		});

		it(`should create expected privileges for ${C.COLLABORATOR_TEMPLATE} role`, function(){
			let account = 'testacct';
			let model = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, model, C.COLLABORATOR_TEMPLATE);

			let expectedCreateCmd = {
				createRole: `${model}.${C.COLLABORATOR_TEMPLATE}`,
				privileges: [{
					"resource" : {
						"db" : account,
						"collection" : `${model}.history`
					},
					"actions" : [ 
						"find", "insert"
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.scene`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.3drepo`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.json_mpc.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.json_mpc.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.src.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.stash.src.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.history.chunks`
					},
					"actions" : [ 
						"find", "insert"
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.history.files`
					},
					"actions" : [ 
						"find", "insert"
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${model}.issues`
					},
					"actions" : [ 
						"find", "insert", "update"
					]
				}],
				roles: []
			};

			expect(createCmd.createRole).to.equal(expectedCreateCmd.createRole);
			expect(createCmd.privileges).to.deep.include.members(expectedCreateCmd.privileges);
			// make sure no extra privileges are given
			expect(createCmd.privileges.length).to.equal(expectedCreateCmd.privileges.length);
		});
	});

});


describe('Role model', function(){

	function createViewerRole(roleName, account, models){
		let role = {
			role: roleName,
			db: account,
			inheritedPrivileges: []
		}

		models.forEach(model => {
			role.inheritedPrivileges.push({
				"resource" : {
					"db" : account,
					"collection" : `${model}.history`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.scene`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.stash.3drepo.chunks`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.stash.3drepo.files`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.stash.3drepo`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.stash.json_mpc.chunks`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.stash.json_mpc.files`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.stash.src.chunks`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.stash.src.files`
				},
				"actions" : [ 
					"find",
				]
			},{
				"resource" : {
					"db" : account,
					"collection" : `${model}.issues`
				},
				"actions" : [ 
					"find",
				]
			});
		});

		return role;
	}

})