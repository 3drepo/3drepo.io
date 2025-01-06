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

	const { v5Path } = require("../../interop");
	const C = require("../constants");
	const db = require("../handler/db");
	const responseCodes = require("../response_codes.js");
	const utils = require("../utils");
	const _ = require("lodash");
	const { changePermissions, findModelSettings, removePermissionsFromModels } = require("./modelSetting");
	const { publish } = require(`${v5Path}/services/eventsManager/eventsManager`);
	const { events } = require(`${v5Path}/services/eventsManager/eventsManager.constants`);

	const PROJECTS_COLLECTION_NAME = "projects";

	async function checkDupName(teamspace, project) {
		const count = await db.count(teamspace, PROJECTS_COLLECTION_NAME, {_id: {$ne: project._id}, name: project.name});

		if (count > 0) {
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

	function clean(projectToClean) {
		if (projectToClean) {
			projectToClean._id = utils.uuidToString(projectToClean._id);
		}

		return projectToClean;
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

	async function setUserAsProjectAdminByQuery(teamspace, user, query) {
		const foundProject = await Project.findOneProject(teamspace, query);
		const projectPermission = { user, permissions: ["admin_project"]};

		return await Project.updateAttrs(teamspace, foundProject.name, { permissions: foundProject.permissions.concat(projectPermission) });
	}

	const Project = {};

	Project.addModelToProject = async function(teamspace, projectName, modelId) {
		return db.updateOne(teamspace, PROJECTS_COLLECTION_NAME, { name: projectName }, { "$push" : { "models": modelId } });
	};

	Project.createProject = async function (teamspace, name, username, userPermissions) {
		checkProjectNameValid(name);

		const project = {
			_id: utils.generateUUID(),
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

		await checkDupName(teamspace, project);

		await db.insertOne(teamspace, PROJECTS_COLLECTION_NAME, project);

		project._id = utils.uuidToString(project._id);
		project.permissions = C.IMPLIED_PERM[C.PERM_PROJECT_ADMIN].project;

		return project;
	};

	Project.delete = async function(teamspace, name) {
		const ModelHelper = require("./helper/model");
		const project = await db.findOneAndDelete(teamspace, PROJECTS_COLLECTION_NAME, {name}, {models: 1});

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		// remove all models as well
		if (project.models) {
			await Promise.all(project.models.map(m => ModelHelper.removeModel(teamspace, m, true, project._id)));
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

	Project.findProjectsById = async function(teamspace, ids) {
		const foundProjects = await Project.listProjects(teamspace, { _id: { $in: ids.map(utils.stringToUUID) } });

		foundProjects.forEach(clean);

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

	Project.getProjectUserPermissions = async function(teamspace, projectName) {
		const User = require("./user");
		const [userList, project] = await Promise.all([
			User.getAllUsersInTeamspace(teamspace),
			Project.findOneProject(teamspace, {name: projectName})
		]);

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		return populateUsers(userList, project);
	};

	Project.getProjectsAndModelsForUser = async function(teamspace, teamspacePermissions, teamspaceModels, teamspaceFeds, username) {
		const projects = await Project.listProjects(teamspace, {});

		projects.forEach((project, i) => {
			project._id = utils.uuidToString(project._id);

			let permissions = project.permissions.find(p => p.user === username);
			permissions = _.get(permissions, "permissions") || [];
			// show inherited and implied permissions
			permissions = permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || p);
			permissions = permissions.concat(teamspacePermissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || null));

			project.permissions = _.uniq(_.compact(_.flatten(permissions)));

			projects[i] = project;

			const findModel = model => (m, index, modelList) => {
				if (m.model === model) {
					modelList.splice(index, 1);
					return true;
				}
			};

			project.models.forEach((model, j) => {
				const fullModel = teamspaceModels.find(findModel(model)) || teamspaceFeds.find(findModel(model));
				project.models[j] = fullModel;
			});

			project.models = _.compact(project.models);
		});

		return projects;
	};

	Project.getProjectsForAccountsList = async function(teamspace, accounts, username, hasAvatar) {
		const projPromises = [];
		const query = { "permissions": { "$elemMatch": { user: username } } };
		const projection = { "permissions": { "$elemMatch": { user: username } }, "models": 1, "name": 1 };
		const projects = await Project.listProjects(teamspace, query, projection);
		let account = null;

		projects.forEach(_proj => {
			projPromises.push(new Promise(function (resolve) {
				let myProj;
				if (!_proj || _proj.permissions.length === 0) {
					resolve();
					return;
				}

				if (!account) {
					account = accounts.find(_account => _account.account === teamspace);

					if (!account) {
						const {_makeAccountObject} = require("./helper/model");
						account = _makeAccountObject(teamspace);
						account.hasAvatar = hasAvatar;
						accounts.push(account);
					}
				}

				myProj = account.projects.find(p => p.name === _proj.name);

				if (!myProj) {
					myProj = _proj;
					account.projects.push(myProj);
					myProj.permissions = myProj.permissions[0].permissions;
				} else {
					myProj.permissions = _.uniq(myProj.permissions.concat(_proj.permissions[0].permissions));
				}

				// show implied and inherited permissions
				myProj.permissions = myProj.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].project || p);
				myProj.permissions = _.uniq(_.flatten(myProj.permissions));

				let inheritedModelPerms = myProj.permissions.map(p => C.IMPLIED_PERM[p] && C.IMPLIED_PERM[p].model || null);
				inheritedModelPerms = _.uniq(_.flatten(inheritedModelPerms));

				const newModelIds = _.difference(_proj.models, myProj.models.map(m => m.model));
				if (newModelIds.length) {
					const {_getModels} = require("./helper/model");
					_getModels(account.account, newModelIds, inheritedModelPerms).then(models => {
						myProj.models = models.models.concat(models.fedModels);
						resolve();
					});
				} else {
					resolve();
				}
			}));
		});

		await Promise.all(projPromises);

		return account;
	};

	Project.getProjectNamesAccessibleToUser = async function(teamspace, username) {
		const projects = await Project.listProjects(teamspace, { "permissions.user": username }, {name: 1});
		return projects.map(p => p.name);
	};

	Project.isProjectAdmin = async function(teamspace, model, user) {
		const projection = { "permissions": { "$elemMatch": { user: user } }};
		const project = await Project.findOneProject(teamspace, {models: model}, projection);
		const hasProjectPermissions = project && project.permissions.length > 0;

		return hasProjectPermissions && project.permissions[0].permissions.includes(C.PERM_PROJECT_ADMIN);
	};

	Project.removeProjectModel = async function(teamspace, model) {
		return db.updateMany(teamspace, PROJECTS_COLLECTION_NAME, { models: model }, { "$pull" : { "models": model}});
	};

	Project.removeUserFromProjects = async function(teamspace, userToRemove) {
		const projects = await Project.listProjects(teamspace, { "permissions.user": userToRemove});
		await Promise.all(
			projects.map(proj => Project.updateAttrs(teamspace, proj.name, {
				permissions: proj.permissions.filter(perm => perm.user !== userToRemove)
			}))
		);
	};

	Project.setUserAsProjectAdmin = async function(teamspace, projectName, user) {
		return setUserAsProjectAdminByQuery(teamspace, user, {name: projectName});
	};

	Project.setUserAsProjectAdminById = async function(teamspace, projectId, user) {
		return setUserAsProjectAdminByQuery(teamspace, user, {_id: utils.stringToUUID(projectId)});
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
				findModelSettings(account, { "permissions.user": user}).then(settings =>
					Promise.all(
						settings.map(s => changePermissions(account, s._id, s.permissions.filter(perm => perm.user !== user)))
					)
				)
			);
		});

		await Promise.all(userPromises);

		checkProjectNameValid(projectName);
		await checkDupName(account, project);
		checkPermissionName(project.permissions);

		await db.updateOne(account, PROJECTS_COLLECTION_NAME, {name: projectName}, { $set: project });

		return project;
	};

	Project.updateProject = async function(account, projectName, data, executor) {
		const project = await Project.findOneProject(account, { name: projectName });

		if (!project) {
			throw responseCodes.PROJECT_NOT_FOUND;
		}

		if (data.name) {
			project.name = data.name;
		}

		let permissionChange;
		if (data.permissions) {
			await Promise.all(data.permissions.map(async (permissionUpdate) => {
				const userIndex = project.permissions.findIndex(x => x.user === permissionUpdate.user);

				const fromVal = project.permissions[userIndex]?.permissions[0] ?? null;
				const toVal = permissionUpdate.permissions.length ? permissionUpdate.permissions[0] : null;

				if(fromVal !== toVal) {
					if(!permissionChange) {
						permissionChange = { from: fromVal ? [fromVal] : fromVal, to: toVal ? [toVal] : toVal, users: [] };
					}

					permissionChange.users.push(permissionUpdate.user);
				}

				if (-1 !== userIndex) {
					if (permissionUpdate.permissions && permissionUpdate.permissions.length) {
						project.permissions[userIndex].permissions = permissionUpdate.permissions;
					} else {
						project.permissions.splice(userIndex, 1);
					}
				} else if (permissionUpdate.permissions && permissionUpdate.permissions.length) {
					project.permissions.push(permissionUpdate);
					await removePermissionsFromModels(account, project.models, permissionUpdate.user);
				}
			}));
		}

		const updatedProject = await Project.updateAttrs(account, projectName, project);

		if (permissionChange && executor) {
			publish(events.PROJECT_PERMISSIONS_UPDATED, { teamspace: account, executor, project: project._id, ...permissionChange});
		}

		return updatedProject;
	};

	Project.removePermissionsFromAllProjects = async (account, userToRemove) => {
		const projects = await Project.listProjects(account, {}, { name:1, models: 1 });

		await Promise.all(projects.map(async (project) => {
			await Project.updateProject(account, project.name, { permissions: [{ user: userToRemove, permissions: [] }] });
			await removePermissionsFromModels(account, project.models, userToRemove);
		}));
	};

	module.exports = Project;
})();
