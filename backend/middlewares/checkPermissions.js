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

	const _ = require('lodash');
	const C	= require("../constants");
	const getPermissionsAdapter = require('./getPermissionsAdapter');
	const responseCodes = require('../response_codes');

	//logic to check permissions
	function checkPermissionsHelper(username, account, project, model, requiredPerms, getPermissions){

		let getPermPromises = [];

		getPermPromises.push(getPermissions(account).accountLevel(username));

		// check what kind of permissions is requested before making db calls to save unnecessary db calls

		const flattenRequiredPerms = requiredPerms['$or'] ? _.flatten(requiredPerms['$or']) : _.flatten(requiredPerms);

		if(_.intersection(C.PROJECT_PERM_LIST, flattenRequiredPerms).length > 0){
			getPermPromises.push(getPermissions(account).projectLevel(username, project));
		}

		if(_.intersection(C.MODEL_PERM_LIST, flattenRequiredPerms).length > 0){

			getPermPromises.push(getPermissions(account).modelLevel(username, model));

		}

		return Promise.all(getPermPromises).then(userPermissions => {
			
			userPermissions = _.flatten(userPermissions);

			//add implied and inherited permissions
			let impliedPerms = [];

			['account', 'project', 'model'].forEach(
				level => {
					impliedPerms = impliedPerms.concat(_.flatten(userPermissions.map(p => _.get(C.IMPLIED_PERM, `${p}.${level}`) || p)));
				}
			);

			userPermissions = _.unique(impliedPerms);

			//god permission
			if(userPermissions.indexOf(C.PERM_TEAMSPACE_ADMIN) !== -1){
				return { granted: true, userPermissions };
			}

			function hasRequiredPermissions(perms) {
				return _.difference(perms, userPermissions).length === 0;
			}

			//if it contains or relationship
			if(Array.isArray(requiredPerms['$or'])){
				return { granted: requiredPerms['$or'].some(hasRequiredPermissions), userPermissions };
			}

			//return true if user has the requested permissions
			return { granted: hasRequiredPermissions(requiredPerms), userPermissions };
		});
	}

	//function that returns a middleware function for checking permissions
	function checkPermissions(permsRequest){

		return function(req, res, next){
			let checkLogin = Promise.resolve();

			if (!req.session || !req.session.hasOwnProperty(C.REPO_SESSION_USER)) {
				checkLogin = Promise.reject(responseCodes.NOT_LOGGED_IN);
			}

			checkLogin.then(() => {

				const username = req.session.user.username;
				const account = req.params.account;
				const model = req.params.model;
				const project = req.params.project;

				return checkPermissionsHelper(username, account, project, model, permsRequest, getPermissionsAdapter);

			}).then(data => {

				if (data.userPermissions) {
					req.session.user.permissions = data.userPermissions;
				}

				if(data.granted){
					next();
				} else {
					return Promise.reject(responseCodes.NOT_AUTHORIZED);
				}

			}).catch(err => {
				next(err);
			});
		};

	}
	module.exports = { checkPermissions, checkPermissionsHelper};

})();
