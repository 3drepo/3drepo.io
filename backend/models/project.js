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

	const PROJECTS_COLLECTION_NAME = "projects";

	function checkProjectNameValid (project) {
		const regex = "^[^/?=#+]{0,119}[^/?=#+ ]{1}$";
		return project && project.match(regex);
	}

	function populateUsers(userList, project) {
		project._id = utils.uuidToString(project._id);

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

	function _checkInvalidName(projectName) {
		if (C.PROJECT_DEFAULT_ID === projectName) {
			throw responseCodes.INVALID_PROJECT_NAME;
		}

		return true;
	}

	async function _checkDupName(account, project) {
		const foundProject = await Project.findOneProject(account, {name: project.name});

		if (foundProject && utils.uuidToString(foundProject._id) !== utils.uuidToString(project._id)) {
			throw responseCodes.PROJECT_EXIST;
		}

		return true;
	}

	function _checkPermissionName(permissions) {
		for (let i = 0; i < permissions.length; i++) {
			const permission = permissions[i];

			if (_.intersection(C.PROJECT_PERM_LIST, permission.permissions).length < permission.permissions.length) {
				throw responseCodes.INVALID_PERM;
			}
		}

		return true;
	}

	function clean(project) {
		if (project) {
			if (!project.models) {
				project.models = [];
			}

			if (!project.permissions) {
				project.permissions = [];
			}
		}

		return project;
	}

	const Project = ModelFactory.createClass(
		"Project",
		schema,
		() => {
			return "projects";
		}
	);

	Project.createProject = async function(account, name, username, userPermissions) {
		if (checkProjectNameValid(name)) {
			const project = {
				_id: nodeuuid(),
				name,
				models: [],
				permissions: []
			};

			if (userPermissions.indexOf(C.PERM_TEAMSPACE_ADMIN) === -1) {
				project.permissions = [{
					user: username,
					permissions: [C.PERM_PROJECT_ADMIN]
				}];
			}

			await _checkInvalidName(name);
			await _checkDupName(account, project);
			await _checkPermissionName(project.permissions);

			await db.insert(account, PROJECTS_COLLECTION_NAME, project);

			project.permissions = C.IMPLIED_PERM[C.PERM_PROJECT_ADMIN].project;

			return project;
		} else {
			return Promise.reject(responseCodes.INVALID_PROJECT_NAME);
		}
	};

	// seems ok
	Project.delete = async function(account, name) {
		const ModelHelper = require("./helper/model");
		const project = await Project.findOneProject(account, {name});

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		await db.remove(account, PROJECTS_COLLECTION_NAME, {name});
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
		const projects = await Project.findAndClean(account.account, query);

		if (projects) {
			projects.forEach(p => populateUsers(userList, p));
		}

		return projects;
	};

	// called by invitation test
	// seems ok
	Project.findOneAndPopulateUsers = async function(account, query) {
		const User = require("./user");
		const userList = await User.getAllUsersInTeamspace(account.account);
		const project = await Project.findOneProject(account.account, query);

		if (project) {
			return populateUsers(userList, project);
		} else {
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		}
	};

	Project.findAndClean = async function(teamspace, query, projection) {
		const foundProjects = await db.find(teamspace, PROJECTS_COLLECTION_NAME, query, projection);

		return foundProjects.map(clean);
	};

	// seems ok
	Project.findByNames = async function(account, projectNames) {
		return Project.findAndClean(account, { name: { $in:projectNames } });
	};

	Project.findProjectsById = async function(account, ids) {
		const foundProjects = await Project.findAndClean(account, { _id: { $in: ids.map(utils.stringToUUID) } });

		foundProjects.forEach((project) => {
			project._id = utils.uuidToString(project._id);
		});

		return foundProjects;
	};

	Project.findOneProject = async function(teamspace, query, projection) {
		const foundProject = await db.findOne(teamspace, PROJECTS_COLLECTION_NAME, query, projection);

		return clean(foundProject);
	};

	// seems ok
	Project.findProjectPermsByUser = async function(account, model, username) {
		const project = await Project.findOneProject(account, {name: model});

		if (!project) {
			return [];
		} else {
			return project.permissions.find(perm => perm.user === username);
		}
	};

	// seems ok
	Project.listModels = async function(account, project, username, filters) {
		const User = require("./user");
		const ModelHelper = require("./helper/model");

		const [dbUser, projectObj] = await Promise.all([
			await User.findByUserName(account),
			Project.findOneProject(account, {name: project})
		]);

		if (!projectObj) {
			throw responseCodes.PROJECT_NOT_FOUND;
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
		const project = await Project.findOneProject(account, {models: model}, projection);
		const hasProjectPermissions = project && project.permissions.length > 0;

		return hasProjectPermissions && project.permissions[0].permissions.includes(C.PERM_PROJECT_ADMIN);
	};

	Project.removeModel = async function(account, model) {
		return db.update(account, PROJECTS_COLLECTION_NAME, { models: model }, { "$pull" : { "models": model}}, {"multi": true});
	};

	// seems ok
	Project.setUserAsProjectAdmin = async function(teamspace, project, user) {
		const projectObj = await Project.findOneProject(teamspace, {name: project});
		const projectPermission = { user, permissions: ["admin_project"]};

		return await Project.updateAttrs(teamspace, project, { permissions: projectObj.permissions.concat(projectPermission) });
	};

	// seems ok
	Project.setUserAsProjectAdminById = async function(teamspace, project, user) {
		const projectObj = await Project.findOneProject(teamspace, {_id: utils.stringToUUID(project)});
		const projectPermission = { user, permissions: ["admin_project"]};

		return await Project.updateAttrs(teamspace, project, { permissions: projectObj.permissions.concat(projectPermission) });
	};

	Project.updateAttrs = async function(account, projectName, data) {
		const project = await Project.findOneProject(account, {name: projectName});

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

			check = User.findByUserName(account).then(teamspace => {
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
				ModelSetting.find({ account }, { "permissions.user": user}).then(settings =>
					Promise.all(
						settings.map(s => s.changePermissions(s.permissions.filter(perm => perm.user !== user)))
					)
				)
			);
		});

		await Promise.all(userPromises);

		await _checkInvalidName(projectName);
		await _checkDupName(account, project);
		await _checkPermissionName(project.permissions);

		await db.update(account, PROJECTS_COLLECTION_NAME, {name: projectName}, project);

		return project;
	};

	Project.updateProject = async function(account, projectName, data) {
		const project = await Project.findOneProject(account, { name: projectName });

		if (!project) {
			return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
		} else {
			if (data.name) {
				project.name = data.name;
			}

			if (data.permissions) {
				data.permissions.forEach((permissionUpdate) => {
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
