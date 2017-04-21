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
	
	function checkPermissions(username, account, projectGroup, project, permsRequest, getPermissions){

		let getPermPromises = [];

		// check what kind of permissions is requested before making db calls to save unnecessary db calls

		if(_.intersection(C.ACCOUNT_PERM_LIST, permsRequest).length > 0){
			getPermPromises.push(getPermissions(account).accountLevel(username));
		}

		if(_.intersection(C.PROJECT_PERM_LIST, permsRequest).length > 0){
			getPermPromises.push(getPermissions(account).projectLevel(username, projectGroup));
		}

		if(_.intersection(C.MODEL_PERM_LIST, permsRequest).length > 0){
			getPermPromises.push(getPermissions(account).modelLevel(username, project));

		}

		return Promise.all(getPermPromises).then(permissions => {
			permissions = _.flatten(permissions);
			//return true if user has the requested permissions
			return _.difference(permsRequest, permissions).length === 0;
		});
	}

	module.exports = checkPermissions;

})();
