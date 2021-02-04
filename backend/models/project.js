/**
 *  Copyright (C) 2021 3D Repo Ltd
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

	const C = require("../constants");
	const db = require("../handler/db");
	const responseCodes = require("../response_codes.js");
	const utils = require("../utils");
	const _ = require("lodash");
	const nodeuuid = require("uuid/v1");
	const ModelSetting = require("./modelSetting");
	const PermissionTemplates = require("./permissionTemplates");

	const PROJECTS_COLLECTION_NAME = "projects";

	async function checkDupName(teamspace, project) {
		const foundProject = await Project.findOneProject(teamspace, {name: project.name});

		if (foundProject && utils.uuidToString(foundProject._id) !== utils.uuidToString(project._id)) {
			throw responseCodes.PROJECT_EXIST;
		}
	}

	function checkPermissionName(permissions) {
		for (let i = 0; i < permissions.length; i++) {
			const permission = permissions[i];

			if (_.intersection(C.PROJECT_PERM_LIST, permission.permissions).length < permission.permissions.length) {
				throw responseCodes.INVALID_PERM;
			}
		}
	}

	function checkProjectNameValid(projectName) {
		const regex = "^[^/?=#+]{0,119}[^/?=#+ ]{1}$";
		if (!projectName || !projectName.match(regex) || C.PROJECT_DEFAULT_ID === projectName) {
			throw responseCodes.INVALID_PROJECT_NAME;
		}
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

	function prepareProject(project) {
		if (project) {
			project = { models: [], permissions: [], ...project };
		}

		return project;
	}

	const Project = {};

	Project.addModelToProject = async function(teamspace, projectName, modelId) {
		const foundProject = await Project.findOneProject(teamspace, {name: projectName});
		foundProject.models.push(modelId);

		return Project.updateAttrs(teamspace, projectName, { models: foundProject.models });
	};

	Project.createProject = async function(teamspace, name, username, userPermissions) {
		checkProjectNameValid(name);
		checkDupName(teamspace, project);

		const project = {
			_id: nodeuuid(),
			name,
			models: [],
			permissions: []
		};

		if (!userPermissions.includes(C.PERM_TEAMSPACE_ADMIN)) {
			project.permissions = [{
				user: username,
				permissions: [C.PERM_PROJECT_ADMIN]
			}];
		}

		await db.insert(teamspace, PROJECTS_COLLECTION_NAME, project);

		project.permissions = C.IMPLIED_PERM[C.PERM_PROJECT_ADMIN].project;

		return project;
	};

	Project.delete = async function(teamspace, name) {
		const ModelHelper = require("./helper/model");
		const project = await Project.findOneProject(teamspace, {name});

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		await db.remove(teamspace, PROJECTS_COLLECTION_NAME, {name});
		// remove all models as well
		if (project.models) {
			await Promise.all(project.models.map(m => ModelHelper.removeModel(teamspace, m, true)));
		}

		return project;
	};

	Project.listProjects = async function(teamspace, query = {}, projection) {
		const User = require("./user");
		const userList = await User.getAllUsersInTeamspace(teamspace);
		let projects = await db.find(teamspace, PROJECTS_COLLECTION_NAME, query, projection);

		if (projects) {
			projects = projects.map(p => populateUsers(userList, prepareProject(p)));
		}

		return projects;
	};

	Project.findProjectAndPopulateUsers = async function(teamspace, projectName) {
		const User = require("./user");
		const userList = await User.getAllUsersInTeamspace(teamspace);
		const project = await Project.findOneProject(teamspace, {name: projectName});

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		return populateUsers(userList, project);
	};

	Project.findProjectsById = async function(teamspace, ids) {
		const foundProjects = await Project.listProjects(teamspace, { _id: { $in: ids.map(utils.stringToUUID) } });

		foundProjects.forEach((project) => {
			project._id = utils.uuidToString(project._id);
		});

		return foundProjects;
	};

	Project.findOneProject = async function(teamspace, query, projection) {
		const foundProject = await db.findOne(teamspace, PROJECTS_COLLECTION_NAME, query, projection);

		return prepareProject(foundProject);
	};

	Project.findProjectPermsByUser = async function(teamspace, model, username) {
		const project = await Project.findOneProject(teamspace, {name: model}, {permissions: 1});

		if (!project) {
			return [];
		} else {
			return project.permissions.find(perm => perm.user === username);
		}
	};

	Project.listModels = async function(account, project, username, filters) {
		const AccountPermissions = require("./accountPermissions");
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

		const accountPerm = AccountPermissions.findByUser(dbUser, username);
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
				const permissionTemplate = PermissionTemplates.findById(dbUser, template.permission);
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

	Project.isProjectAdmin = async function(teamspace, model, user) {
		const projection = { "permissions": { "$elemMatch": { user: user } }};
		const project = await Project.findOneProject(teamspace, {models: model}, projection);
		const hasProjectPermissions = project && project.permissions.length > 0;

		return hasProjectPermissions && project.permissions[0].permissions.includes(C.PERM_PROJECT_ADMIN);
	};

	Project.removeProjectModel = async function(teamspace, model) {
		return db.update(teamspace, PROJECTS_COLLECTION_NAME, { models: model }, { "$pull" : { "models": model}}, {"multi": true});
	};

	Project.removeUserFromProjects = async function(teamspace, userToRemove) {
		const projects = await Project.listProjects(teamspace, { "permissions.user": userToRemove});
		await Promise.all(
			projects.map(proj => Project.updateAttrs(teamspace, proj.name, {
				permissions: proj.permissions.filter(perm => perm.user !== userToRemove)
			}))
		);
	};

	Project.setUserAsProjectAdmin = async function(teamspace, project, user) {
		const projectObj = await Project.findOneProject(teamspace, {name: project});
		const projectPermission = { user, permissions: ["admin_project"]};

		return await Project.updateAttrs(teamspace, project, { permissions: projectObj.permissions.concat(projectPermission) });
	};

	Project.setUserAsProjectAdminById = async function(teamspace, project, user) {
		const projectObj = await Project.findOneProject(teamspace, {_id: utils.stringToUUID(project)});
		const projectPermission = { user, permissions: ["admin_project"]};

		return await Project.updateAttrs(teamspace, projectObj.name, { permissions: projectObj.permissions.concat(projectPermission) });
	};

	Project.updateAttrs = async function(account, projectName, data) {
		const project = await Project.findOneProject(account, {name: projectName});

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		const whitelist = ["name", "permissions", "models"];
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

		if (data["name"]) {
			checkProjectNameValid(data["name"]);
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

		checkProjectNameValid(projectName);
		checkDupName(account, project);
		checkPermissionName(project.permissions);

		await db.update(account, PROJECTS_COLLECTION_NAME, {name: projectName}, project);

		return project;
	};

	Project.updateProject = async function(account, projectName, data) {
		const project = await Project.findOneProject(account, { name: projectName });

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

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
	};

	module.exports = Project;
})();
