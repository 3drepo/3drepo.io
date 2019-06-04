/**
 *  Copyright (C) 2019 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.ap
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
"use strict";

const express = require("express");
const router = express.Router({ mergeParams: true });
const middlewares = require("../middlewares/middlewares");
const FileRef = require("../models/fileRef");
const utils = require("../utils");
const responseCodes = require("../response_codes");

router.get("/resources/:resourceId",middlewares.issue.canView,  downloadResource);

function downloadResource(req, res, next) {
	const {account, model, resourceId } = req.params;

	FileRef.getResourceFile(account, model, resourceId).then(resource => {
		res.set("Content-Length", resource.size);
		res.set("Content-Type", "application/" + resource.type);
		res.set("Content-Disposition","attachment;filename=" + resource.name);
		console.log("im ok here");
		

		res.send(resource.file);

	}).catch(err => {
		responseCodes.respond(utils.APIInfo(req), req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});

}

module.exports = router;