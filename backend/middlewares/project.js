/**
 *	Copyright (C) 2017 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(() => {
	"use strict";

	const checkPermissions = require('./checkPermissions').checkPermissions;
	const C	= require("../constants");
	
	function canUpdate(req, res, next){
		if(req.body.permissions){
			checkPermissions([C.PERM_PROJECT_ADMIN])(req, res, next);
		} else {
			checkPermissions([C.PERM_EDIT_PROJECT])(req, res, next);
		}
	}

	module.exports = {
		canCreate: checkPermissions([C.PERM_CREATE_PROJECT]),
		canUpdate: canUpdate,
		canView: checkPermissions([C.PERM_PROJECT_ADMIN]),
		canList: checkPermissions([C.PERM_VIEW_PROJECTS]),
		canDelete: checkPermissions([C.PERM_DELETE_PROJECT])
	}

})();

