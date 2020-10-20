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

	schema.statics.createProject = function(account, name, username, userPermissions) {
		if(checkProjectNameValid(name)) {
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

	schema.statics.delete = function(account, name) {
		const ModelHelper = require("./helper/model");

		let project;

		return Project.findOneAndRemove({account}, {name}).then(_project => {
			project = _project;

			// remove all models as well

			if (!project) {
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			} else {
				return Promise.resolve();
			}
		}).then(() => {
			return Promise.all(project.models.map(m => ModelHelper.removeModel(account, m, true)));
		}).then(() => project);
	};

	schema.statics.removeModel = function(account, model) {
		return Project.update({account}, { models: model }, { "$pull" : { "models": model}}, {"multi": true});
	};

	schema.methods.updateAttrs = function(data) {
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

			usersToRemove = _.difference(this.permissions.map(p => p.user), data.permissions.map(p => p.user));

			check = User.findByUserName(this._dbcolOptions.account).then(teamspace => {
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

		return check.then(() => {
			Object.keys(data).forEach(key => {
				if(whitelist.indexOf(key) !== -1) {
					this[key] = data[key];
				}
			});

			const userPromises = [];

			usersToRemove.forEach(user => {
				// remove all model permissions in this project as well, if any
				userPromises.push(
					ModelSetting.find(this._dbcolOptions, { "permissions.user": user}).then(settings =>
						Promise.all(
							settings.map(s => s.changePermissions(s.permissions.filter(perm => perm.user !== user)))
						)
					)
				);
			});

			return Promise.all(userPromises);
		}).then(() => {
			return this.save();
		});
	};

	schema.statics.findAndPopulateUsers = function(account, query) {
		const User = require("./user");
		let userList;

		return User.getAllUsersInTeamspace(account.account).then(users => {
			userList = users;
			return Project.find(account, query);
		}).then(projects => {
			if (projects) {
				projects.forEach(p => Project.populateUsers(userList, p));
			}

			return projects;
		});
	};

	schema.statics.findOneAndPopulateUsers = function(account, query) {
		const User = require("./user");
		let userList;

		return User.getAllUsersInTeamspace(account.account).then(users => {
			userList = users;
			return Project.findOne(account, query);
		}).then(project => {
			if (project) {
				return Project.populateUsers(userList, project);
			} else {
				return Promise.reject(responseCodes.PROJECT_NOT_FOUND);
			}
		});
	};

	schema.statics.findByNames = function(account, projectNames) {
		return Project.find({account}, { name: { $in:projectNames } });
	};

	schema.statics.findByIds = function(account, _ids) {
		return Project.find({account}, { _id: { $in: _ids.map(utils.stringToUUID) } });
	};

	schema.statics.populateUsers = function(userList, project) {
		userList.forEach(user => {
			const userFound = project.permissions.find(perm => perm.user === user);

			if(!userFound) {
				project.permissions.push({
					user
				});
			}
		});

		return project;
	};

	schema.methods.findPermsByUser = function(username) {
		return this.permissions.find(perm => perm.user === username);
	};

	schema.statics.isProjectAdmin = async function(account, model, user) {
		const projection = { "permissions": { "$elemMatch": { user: user } }};
		const project = await Project.findOne({account}, {models: model}, projection);
		const hasProjectPermissions = project && project.permissions.length > 0;

		return hasProjectPermissions && project.permissions[0].permissions.includes(C.PERM_PROJECT_ADMIN);
	};

	schema.statics.setUserAsProjectAdmin = async function(teamspace, project, user) {
		const projectObj = await Project.findOne({ account: teamspace }, {name: project});
		const projectPermission = { user, permissions: ["admin_project"]};
		return await projectObj.updateAttrs({ permissions: projectObj.permissions.concat(projectPermission) });
	};

	schema.statics.setUserAsProjectAdminById = async function(teamspace, project, user) {
		const projectObj = await Project.findOne({ account: teamspace }, {_id: utils.stringToUUID(project)});
		const projectPermission = { user, permissions: ["admin_project"]};
		return await projectObj.updateAttrs({ permissions: projectObj.permissions.concat(projectPermission) });
	};

	schema.statics.listModels = async function(account, project, username, filters) {
		const User = require("./user");
		const ModelHelper = require("./helper/model");

		const [dbUser, projectObj] = await  Promise.all([
			await User.findByUserName(account),
			Project.findOne({ account }, {name: project})
		]);

		if (!projectObj) {
			throw responseCodes.INVALID_PROJECT_NAME;
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
			setting = await setting.clean();

			let settingsPermissions = [];

			if(template) {
				const permissionTemplate = dbUser.customData.permissionTemplates.findById(template.permission);

				if(permissionTemplate && permissionTemplate.permissions) {
					settingsPermissions = settingsPermissions.concat(ModelHelper.flattenPermissions(permissionTemplate.permissions, true));
				}
			}

			setting.permissions = permissions.concat(settingsPermissions);
			setting.model = setting._id;
			setting.account = account;
			setting.headRevisions = {};

			return setting;
		}));

		return modelsSettings;
	};

	const Project = ModelFactory.createClass(
		"Project",
		schema,
		() => {
			return "projects";
		}
	);

	Project.updateProject = async function(account, projectName, data) {
		const project = await this.findOne({ account }, { name: projectName });

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

			return project.updateAttrs(project);
		}
	};

	module.exports = Project;
})();
