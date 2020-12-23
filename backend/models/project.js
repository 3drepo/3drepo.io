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

"use strict";
(() => {

	const mongoose = require("mongoose");
	const C = require("../constants");
	const db = require("../handler/db");
	const responseCodes = require("../response_codes.js");
	const ModelFactory = require("./factory/modelFactory");
	const utils = require("../utils");
	const _ = require("lodash");
	const nodeuuid = require("uuid/v1");
	const ModelSetting = require("./modelSetting");
	const schema = mongoose.Schema({
		_id: {
			type: Object,
			get: v => {
				if(v.id) {
					return v;
				}

				return utils.uuidToString(v);
			},
			set: utils.stringToUUID
		},
		name: { type: String, unique: true},
		models: [String],
		permissions: [{
			_id: false,
			user: { type: String, required: true },
			permissions: [String]
		}]
	});

	function checkProjectNameValid (project) {
		const regex = "^[^/?=#+]{0,119}[^/?=#+ ]{1}$";
		return project && project.match(regex);
	}

	function getCollection(teamspace) {
		return db.getCollection(teamspace, "projects");
	}

	function populateUsers(userList, project) {
		userList.forEach(user => {
			let userFound;

			if (project.permissions && Array.isArray(project.permissions)) {
				userFound = project.permissions.find(perm => perm.user === user);
			} else {
				project.permissions = [];
			}

			if (!userFound) {
				project.permissions.push({
					permissions: [],
					user
				});
			}
		});

		return project;
	}

	schema.set("toObject", { getters: true });

	schema.pre("save", function checkInvalidName(next) {
		if(C.PROJECT_DEFAULT_ID === this.name) {
			return next(utils.makeError(responseCodes.INVALID_PROJECT_NAME));
		}

		return next();
	});

	schema.pre("save", function checkDupName(next) {
		Project.findOne(this._dbcolOptions, {name: this.name}).then(project => {
			if(project && project.id !== this.id) {
				return next(utils.makeError(responseCodes.PROJECT_EXIST));
			} else {
				return next();
			}
		});
	});

	schema.pre("save", function checkPermissionName(next) {
		for (let i = 0; i < this.permissions.length; i++) {
			const permission = this.permissions[i];

			if (_.intersection(C.PROJECT_PERM_LIST, permission.permissions).length < permission.permissions.length) {
				return next(utils.makeError(responseCodes.INVALID_PERM));
			}
		}

		return next();
	});

	const Project = ModelFactory.createClass(
		"Project",
		schema,
		() => {
			return "projects";
		}
	);

	Project.createProject = function(account, name, username, userPermissions) {
		if (checkProjectNameValid(name)) {
			const project = Project.createInstance({account});
			project.name = name;
			project._id = nodeuuid();

			if(userPermissions.indexOf(C.PERM_TEAMSPACE_ADMIN) === -1) {
				project.permissions = [{
					user: username,
					permissions: [C.PERM_PROJECT_ADMIN]
				}];
			}

			return project.save().then(() => {
				const proj = project.toObject();
				proj.permissions = C.IMPLIED_PERM[C.PERM_PROJECT_ADMIN].project;
				return proj;
			});
		} else {
			return Promise.reject(responseCodes.INVALID_PROJECT_NAME);
		}
	};

	// seems ok
	Project.delete = async function(account, name) {
		const ModelHelper = require("./helper/model");

		const projectsColl = await getCollection(account);
		const project = await projectsColl.findOne({name});

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		await projectsColl.findOneAndDelete({name});
		// remove all models as well
		if (project.models) {
			await Promise.all(project.models.map(m => ModelHelper.removeModel(account, m, true)));
		}

		return project;
	};

	// seems ok
	Project.findAndPopulateUsers = async function(account, query) {
		const User = require("./user");
		const userList = await User.getAllUsersInTeamspace(account.account);
		const projectsColl = await getCollection(account.account);
		const projects = await (await projectsColl.find(query)).toArray();

		if (projects) {
			projects.forEach(p => {
				populateUsers(userList, p);

				if (!p.models) {
					p.models = [];
				}
			});
		}

		return projects;
	};

	// called by invitation test
	// seems ok
	Project.findOneAndPopulateUsers = async function(account, query) {
		const User = require("./user");
		const userList = await User.getAllUsersInTeamspace(account.account);
		const projectsColl = await getCollection(account.account);
		const project = await projectsColl.findOne(query);

		if (project) {
			return populateUsers(userList, project);
		} else {
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		}
	};

	// seems ok
	Project.findByNames = async function(account, projectNames) {
		const projectsColl = await getCollection(account);
		return projectsColl.find({ name: { $in:projectNames } });
	};

	Project.findByIds = function(account, ids) {
		// const projectsColl = await getCollection(account);
		const projects = Project.find({account}, { _id: { $in: ids.map(utils.stringToUUID) } });

		/*
		projects.forEach(p => {
			if (!p.models) {
				p.models = [];
			}

			if (!p.permissions) {
				p.permissions = [];
			}
		});
		*/

		return projects;
	};

	// seems ok
	Project.findPermsByUser = async function(account, model, username) {
		const projectsColl = await getCollection(account);
		const project = await projectsColl.findOne({name: model});

		if (!project || !project.permissions) {
			return [];
		} else {
			return project.permissions.find(perm => perm.user === username);
		}
	};

	// seems ok
	Project.listModels = async function(account, project, username, filters) {
		const User = require("./user");
		const ModelHelper = require("./helper/model");
		const projectsColl = await getCollection(account);

		const [dbUser, projectObj] = await Promise.all([
			await User.findByUserName(account),
			projectsColl.findOne({name: project})
		]);

		if (!projectObj) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		if (!projectObj.permissions) {
			projectObj.permissions = [];
		}

		if (filters && filters.name) {
			filters.name = new RegExp(".*" + filters.name + ".*", "i");
		}

		let modelsSettings =  await ModelSetting.find({account}, { _id: { $in : projectObj.models }, ...filters});
		let permissions = [];

		const accountPerm = dbUser.customData.permissions.findByUser(username);
		const projectPerm = projectObj.permissions.find(p=> p.user === username);

		if (accountPerm && accountPerm.permissions) {
			permissions = permissions.concat(ModelHelper.flattenPermissions(accountPerm.permissions));
		}

		if (projectPerm && projectPerm.permissions) {
			permissions  = permissions.concat(ModelHelper.flattenPermissions(projectPerm.permissions));
		}

		modelsSettings = await Promise.all(modelsSettings.map(async setting => {
			const template = setting.findPermissionByUser(username);

			let settingsPermissions = [];
			if(template) {
				const permissionTemplate = dbUser.customData.permissionTemplates.findById(template.permission);
				if (permissionTemplate && permissionTemplate.permissions) {
					settingsPermissions = settingsPermissions.concat(ModelHelper.flattenPermissions(permissionTemplate.permissions, true));
				}
			}

			setting = await setting.clean();
			setting.permissions = _.uniq(permissions.concat(settingsPermissions));
			setting.model = setting._id;
			setting.account = account;
			setting.subModels = await ModelHelper.listSubModels(account, setting._id, C.MASTER_BRANCH_NAME);
			setting.headRevisions = {};

			return setting;
		}));

		return modelsSettings;
	};

	// seems ok
	Project.isProjectAdmin = async function(account, model, user) {
		const projection = { "permissions": { "$elemMatch": { user: user } }};
		const projectsColl = await getCollection(account);
		const project = await projectsColl.findOne({models: model}, projection);

		if (!project.permissions) {
			project.permissions = [];
		}

		const hasProjectPermissions = project && project.permissions.length > 0;

		return hasProjectPermissions && project.permissions[0].permissions.includes(C.PERM_PROJECT_ADMIN);
	};

	Project.removeModel = async function(account, model) {
		const projectsColl = await getCollection(account);
		return projectsColl.update({ models: model }, { "$pull" : { "models": model}}, {"multi": true});
	};

	// seems ok
	Project.setUserAsProjectAdmin = async function(teamspace, project, user) {
		const projectsColl = await getCollection(teamspace);
		const projectObj = await projectsColl.findOne({name: project});

		if (!projectObj.models) {
			projectObj.models = [];
		}

		if (!projectObj.permissions) {
			projectObj.permissions = [];
		}

		const projectPermission = { user, permissions: ["admin_project"]};
		return await Project.updateAttrs(teamspace, project, { permissions: projectObj.permissions.concat(projectPermission) });
	};

	// seems ok
	Project.setUserAsProjectAdminById = async function(teamspace, project, user) {
		const projectsColl = await getCollection(teamspace);
		const projectObj = await projectsColl.findOne({_id: utils.stringToUUID(project)});

		if (!projectObj.models) {
			projectObj.models = [];
		}

		if (!projectObj.permissions) {
			projectObj.permissions = [];
		}

		const projectPermission = { user, permissions: ["admin_project"]};
		return await Project.updateAttrs(teamspace, project, { permissions: projectObj.permissions.concat(projectPermission) });
	};

	Project.updateAttrs = async function(account, projectName, data) {
		const project = await Project.findOne({ account }, {name: projectName});

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		const whitelist = ["name", "permissions"];
		const User = require("./user");

		let usersToRemove = [];
		let check = Promise.resolve();

		if (data.permissions) {
			// user to delete
			for(let i = data.permissions.length - 1; i >= 0; i--) {
				if(!Array.isArray(data.permissions[i].permissions) || data.permissions[i].permissions.length === 0) {
					data.permissions.splice(i ,1);
				}
			}

			usersToRemove = _.difference(project.permissions.map(p => p.user), data.permissions.map(p => p.user));

			check = User.findByUserName(project._dbcolOptions.account).then(teamspace => {
				return User.getAllUsersInTeamspace(teamspace.user).then(members => {
					const someUserNotAssignedWithLicence = data.permissions.some(
						perm => {
							return !members.includes(perm.user);
						}
					);

					if (someUserNotAssignedWithLicence) {
						return Promise.reject(responseCodes.USER_NOT_ASSIGNED_WITH_LICENSE);
					}
				});
			});
		}

		if (data["name"] && !checkProjectNameValid(data["name"])) {
			return Promise.reject(responseCodes.INVALID_PROJECT_NAME);
		}

		await check;

		Object.keys(data).forEach(key => {
			if(whitelist.indexOf(key) !== -1) {
				project[key] = data[key];
			}
		});

		const userPromises = [];

		usersToRemove.forEach(user => {
			// remove all model permissions in this project as well, if any
			userPromises.push(
				ModelSetting.find(project._dbcolOptions, { "permissions.user": user}).then(settings =>
					Promise.all(
						settings.map(s => s.changePermissions(s.permissions.filter(perm => perm.user !== user)))
					)
				)
			);
		});

		await Promise.all(userPromises);
		await project.save();

		return project;
	};

	Project.updateProject = async function(account, projectName, data) {
		const projectsColl = await getCollection(account);
		const project = await projectsColl.findOne({ name: projectName });

		if (!project) {
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		} else {
			if (data.name) {
				project.name = data.name;
			}

			if (data.permissions) {
				data.permissions.forEach((permissionUpdate) => {
					if (!project.permissions) {
						project.permissions = [];
					}

					const userIndex = project.permissions.findIndex(x => x.user === permissionUpdate.user);

					if (-1 !== userIndex) {
						if (permissionUpdate.permissions && permissionUpdate.permissions.length) {
							project.permissions[userIndex].permissions = permissionUpdate.permissions;
						} else {
							project.permissions.splice(userIndex, 1);
						}
					} else if (permissionUpdate.permissions && permissionUpdate.permissions.length) {
						project.permissions.push(permissionUpdate);
					}
				});
			}

			return Project.updateAttrs(account, projectName, project);
		}
	};

	module.exports = Project;
})();
