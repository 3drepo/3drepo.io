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

var Role = require('../role');
var ProjectSetting = require('../projectSetting');
var User = require('../user');
var responseCodes = require('../../response_codes');
var importQueue = require('../../services/queue');
var C = require('../../constants');

function createAndAssignRole(project, account, username, desc, type) {
	'use strict';


	if(!project.match(/^[a-zA-Z0-9_-]{3,20}$/)){
		return Promise.reject({ resCode: responseCodes.INVALID_PROJECT_NAME });
	}

	if(C.REPO_BLACKLIST_PROJECT.indexOf(project) !== -1){
		return Promise.reject({ resCode: responseCodes.BLACKLISTED_PROJECT_NAME });
	}

	return Role.findByRoleID(`${account}.${project}.viewer`).then(role =>{

		if(role){
			return Promise.resolve();
		} else {
			return Role.createViewerRole(account, project);
		}

	}).then(() => {

		return Role.findByRoleID(`${account}.${project}.collaborator`);

	}).then(role => {

		if(role){
			return Promise.resolve();
		} else {
			return Role.createCollaboratorRole(account, project);
		}

	}).then(() => {

		return User.grantRoleToUser(username, account, `${project}.collaborator`);

	}).then(() => {

		return ProjectSetting.findById({account, project}, project).then(setting => {

			if(setting){
				return Promise.reject({resCode: responseCodes.PROJECT_EXIST});
			}

			setting = ProjectSetting.createInstance({
				account: account, 
				project: project
			});
			
			setting._id = project;
			setting.owner = username;
			setting.desc = desc;
			setting.type = type;
			
			return setting.save();
		});

	});
}

function importToyProject(username){
	'use strict';

	let projectSetting;
	let project = 'sample_project';
	let account = username;
	let desc = '';
	let type = 'sample';
	
	//dun move the toy model instead make a copy of it
	let copy = true;

	return createAndAssignRole(project, account, username, desc, type).then(setting => {
		//console.log('setting', setting);
		return Promise.resolve(setting);

	}).then(setting => {

		projectSetting = setting;
		projectSetting.status = 'processing';

		return projectSetting.save();

	}).then(() => {

		//import to queue in background
		importQueue.importFile(
			__dirname + '/../../statics/3dmodels/toy.ifc', 
			'toy.ifc', 
			account,
			project,
			username,
			copy
		).then(corID => Promise.resolve(corID)
		).catch(errCode => {
			//catch here to provide custom error message
			console.log(errCode);

			if(projectSetting){
				projectSetting.errorReason = convertToErrorCode(errCode);
				projectSetting.markModified('errorReason');
			}

			return Promise.reject(convertToErrorCode(errCode));

		}).then(() => {

			//mark project ready

			projectSetting.status = 'ok';
			projectSetting.errorReason = undefined;
			projectSetting.markModified('errorReason');
			
			return projectSetting.save();

		}).catch(err => {
			// import failed for some reason(s)...
			console.log(err.stack);
			//mark project failed
			if(projectSetting){
				projectSetting.status = 'failed';
				projectSetting.save();
			}


		});

		//respond once project setting is created
		return Promise.resolve();

	});
}

module.exports = {
	createAndAssignRole,
	importToyProject
};