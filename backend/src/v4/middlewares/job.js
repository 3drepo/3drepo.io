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
const { ADD_ONS: { USERS_PROVISIONED } } = require(`${v5Path}/models/teamspaces.constants`);
const {getAddOns} = require(`${v5Path}/models/teamspaceSettings`);
const checkPermissions = require("./checkPermissions").checkPermissions;
const responseCodes = require("../response_codes");
const C	= require("../constants");
const utils = require("../utils");

const notUserProvisioned = async (req,res,next) => {
	const { account } = req.params;

	const addOns = await getAddOns(account);
	if (addOns?.[USERS_PROVISIONED]) {
		const place = utils.APIInfo(req);
		responseCodes.respond(place,req, res, next, responseCodes.NOT_AUTHORIZED);
		return ;
	}
	next();
};

module.exports = {
	canCreate: [checkPermissions([C.PERM_CREATE_JOB]), notUserProvisioned],
	canView: checkPermissions([C.PERM_ASSIGN_JOB]),
	canDelete: [checkPermissions([C.PERM_DELETE_JOB]), notUserProvisioned],
	notUserProvisioned
};
