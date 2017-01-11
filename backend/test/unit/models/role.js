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

let modelFactoryMock = {
	db: {
		db: () => {
			return {
				command: cmd => {
					return {
						then: () => cmd
					}
				}
			};
		}
	}
};

let RoleTemplates = proxyquire('../../../models/role_templates', {
	'./factory/modelFactory': modelFactoryMock,
	'../response_codes': {}
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
			let project = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, project, C.ADMIN_TEMPLATE);

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
			let project = 'testproject';
			let roleName = 'abc123'
			let createCmd = RoleTemplates.createRoleFromTemplate(account, project, C.ADMIN_TEMPLATE, roleName);

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
			let project = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, project, C.VIEWER_TEMPLATE);

			let expectedCreateCmd = {
				createRole: `${project}.${C.VIEWER_TEMPLATE}`,
				privileges: [{
					"resource" : {
						"db" : account,
						"collection" : `${project}.history`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.scene`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.json_mpc.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.json_mpc.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.src.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.src.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.issues`
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
			let project = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, project, C.COMMENTER_TEMPLATE);

			let expectedCreateCmd = {
				createRole: `${project}.${C.COMMENTER_TEMPLATE}`,
				privileges: [{
					"resource" : {
						"db" : account,
						"collection" : `${project}.history`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.scene`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.json_mpc.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.json_mpc.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.src.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.src.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.issues`
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
			let project = 'testproject';
			let createCmd = RoleTemplates.createRoleFromTemplate(account, project, C.COLLABORATOR_TEMPLATE);

			let expectedCreateCmd = {
				createRole: `${project}.${C.COLLABORATOR_TEMPLATE}`,
				privileges: [{
					"resource" : {
						"db" : account,
						"collection" : `${project}.history`
					},
					"actions" : [ 
						"find", "insert"
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.scene`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.3drepo`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.json_mpc.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.json_mpc.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.src.chunks`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.stash.src.files`
					},
					"actions" : [ 
						"find",
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.history.chunks`
					},
					"actions" : [ 
						"find", "insert"
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.history.files`
					},
					"actions" : [ 
						"find", "insert"
					]
				},{
					"resource" : {
						"db" : account,
						"collection" : `${project}.issues`
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

	describe('#determinePermission', function(){

		it(`should able to determine permission for a admin role`, function(){
			
			let db = 'testacct';
			let project = 'testproject';
			let role = {
	            "inheritedPrivileges" : [ 
	                {
	                    "resource" : {
	                        "db" : db,
	                        "collection" : ""
	                    },
	                    "actions" : ["find", "insert", "update", "remove"]
	                }
	            ]
			};

			let permissions = RoleTemplates.determinePermission(db, project, role);

			expect(permissions).to.include.members(RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE]);
			expect(permissions.length).to.equal(RoleTemplates.roleTemplates[C.ADMIN_TEMPLATE].length);
		});

		it(`should able to determine permission - delete_project`, function(){
			
			let db = 'testacct';
			let project = 'testproject';
			let role = {
				inheritedPrivileges:[]
			};

			[
				"history", 
				"scene", 
				"stash.3drepo.chunks", 
				"stash.3drepo.files", 
				"stash.3drepo", 
				"stash.json_mpc.chunks", 
				"stash.json_mpc.files", 
				"stash.src.chunks", 
				"stash.src.files"

			].forEach(collection => {
				role.inheritedPrivileges.push({
					resource:{
						db: db,
						collection: `${project}.${collection}`
					},
					actions: ["remove"]
				});
			});

			let permissions = RoleTemplates.determinePermission(db, project, role);

			let expectedPerm = [C.PERM_DELETE_PROJECT];

			expect(permissions).to.include.members(expectedPerm);
			expect(permissions.length).to.equal(expectedPerm.length);
		});

		it(`should able to determine permission - delete_project - missing some collections`, function(){
			
			let db = 'testacct';
			let project = 'testproject';
			let role = {
				inheritedPrivileges:[]
			};

			[
				"history", 
				"scene", 
				"stash.3drepo.chunks", 
				"stash.3drepo.files", 
				"stash.3drepo"
			].forEach(collection => {
				role.inheritedPrivileges.push({
					resource:{
						db: db,
						collection: `${project}.${collection}`
					},
					actions: [ "remove"]
				});
			});

			let permissions = RoleTemplates.determinePermission(db, project, role);

			let expectedPerm = [];

			expect(permissions).to.include.members(expectedPerm);
			expect(permissions.length).to.equal(expectedPerm.length);
		});

		it(`should able to determine permission - view_project`, function(){
			
			let db = 'testacct';
			let project = 'testproject';
			let role = {
				inheritedPrivileges:[]
			};

			[
				"history", 
				"scene", 
				"stash.3drepo.chunks", 
				"stash.3drepo.files", 
				"stash.3drepo", 
				"stash.json_mpc.chunks", 
				"stash.json_mpc.files", 
				"stash.src.chunks", 
				"stash.src.files",
				"some_other_collections"

			].forEach(collection => {
				role.inheritedPrivileges.push({
					resource:{
						db: db,
						collection: `${project}.${collection}`
					},
					actions: ["find"]
				});
			});

			let permissions = RoleTemplates.determinePermission(db, project, role);

			let expectedPerm = [C.PERM_VIEW_PROJECT];

			expect(permissions).to.include.members(expectedPerm);
			expect(permissions.length).to.equal(expectedPerm.length);
		});

		it(`should able to determine permission - multiple permissions 1`, function(){
			
			let db = 'testacct';
			let project = 'testproject';
			let role = {
			    "inheritedPrivileges" : [ 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.history`
			            },
			            "actions" : [ 
			                "find", 
			                "insert"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.scene`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.3drepo.chunks`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.3drepo.files`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.3drepo`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.json_mpc.chunks`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.json_mpc.files`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.src.chunks`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.src.files`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.history.chunks`
			            },
			            "actions" : [ 
			                "find", 
			                "insert"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.history.files`
			            },
			            "actions" : [ 
			                "find", 
			                "insert"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.issues`
			            },
			            "actions" : [ 
			                "find", 
			                "insert", 
			                "update",
			                "remove"
			            ]
			        }
			    ]
			};

			let permissions = RoleTemplates.determinePermission(db, project, role);

			let expectedPerm = [C.PERM_EDIT_PROJECT, C.PERM_VIEW_PROJECT, C.PERM_UPLOAD_FILES, C.PERM_CREATE_ISSUE, C.PERM_COMMENT_ISSUE, C.PERM_DOWNLOAD_PROJECT, C.PERM_VIEW_ISSUE];

			expect(permissions).to.include.members(expectedPerm);
			expect(permissions.length).to.equal(expectedPerm.length);
		});

		it(`should able to determine permission - multiple permissions 2`, function(){
			
			let db = 'testacct';
			let project = 'testproject';
			let role = {
			    "inheritedPrivileges" : [ 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.history`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.scene`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.3drepo.chunks`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.3drepo.files`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.3drepo`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.json_mpc.chunks`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.json_mpc.files`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.src.chunks`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.stash.src.files`
			            },
			            "actions" : [ 
			                "find"
			            ]
			        }, 
			        {
			            "resource" : {
			                "db" : db,
			                "collection" : `${project}.issues`
			            },
			            "actions" : [ 
			                "find", 
			                "insert", 
			                "update"
			            ]
			        }
			    ]
			};

			let permissions = RoleTemplates.determinePermission(db, project, role);

			let expectedPerm = [C.PERM_VIEW_PROJECT, C.PERM_COMMENT_ISSUE, C.PERM_VIEW_ISSUE, C.PERM_COMMENT_ISSUE];

			expect(permissions).to.include.members(expectedPerm);
			expect(permissions.length).to.equal(expectedPerm.length);
		});

	})

});