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

var log_iface = require("../logger.js");
var logger = log_iface.logger;

var _ = require("underscore");
var dbInterface = require("../db_interface.js");

var C = require("../constants.js");

var responseCodes = require("../response_codes.js");

exports.route = function(router)
{
	"use strict";

	router.get("html", "/:account/:project/issues", function(req, res, params, err_callback) {
		dbInterface(req[C.REQ_REPO].logger).getIssues(params.account, params.project, "master", null, true, function(err, issueList) {
			let issues = issueList;

			// Split issues by type
			let splitIssues   = {open : [], closed: []};

			for (var i = 0; i < issues.length; i++)
			{
				if(issues[i].closed)
				{
					issues[i].created = new Date(issues[i].created).toString();
					splitIssues.closed.push(issues[i]);
				} else {
					issues[i].created = new Date(issues[i].created).toString();
					splitIssues.open.push(issues[i]);
				}
			}

			res.render("issues.jade", {issues : splitIssues});
		});
	});
};


