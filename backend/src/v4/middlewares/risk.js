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
	const checkPermissions = require("./checkPermissions").checkPermissions;
	const C	= require("../constants");
	const { v5Path } = require("../../interop");
	const { validateMany } = require(`${v5Path}/middleware/common`);
	const { isAddOnModuleEnabled } = require(`${v5Path}/middleware/permissions/components/teamspaces`);
	const { ADD_ONS_MODULES } = require(`${v5Path}/models/teamspaces.constants`);
	const { formatV5NewModelRevisionsData } = require("./middlewares");

	module.exports = {
		canView: validateMany([formatV5NewModelRevisionsData, isAddOnModuleEnabled(ADD_ONS_MODULES.RISKS), checkPermissions([C.PERM_VIEW_ISSUE])]),
		canCreate: validateMany([formatV5NewModelRevisionsData, isAddOnModuleEnabled(ADD_ONS_MODULES.RISKS), checkPermissions([C.PERM_CREATE_ISSUE])]),
		canComment: validateMany([formatV5NewModelRevisionsData, isAddOnModuleEnabled(ADD_ONS_MODULES.RISKS), checkPermissions([C.PERM_COMMENT_ISSUE])])
	};

})();
