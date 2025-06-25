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
const { v5Path } = require("../../interop");
const checkPermissions = require("./checkPermissions").checkPermissions;
const C	= require("../constants");
const { notUserProvisioned } = require(`${v5Path}/middleware/permissions/components/teamspaces`);

module.exports = {
	canCreate: [checkPermissions([C.PERM_CREATE_JOB]), notUserProvisioned],
	canView: checkPermissions([C.PERM_ASSIGN_JOB]),
	canDelete: [checkPermissions([C.PERM_DELETE_JOB]), notUserProvisioned]
};
