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
"use strict";

/**
 * Create API Express app
 *
 * @returns
 */
module.exports.createApp = function () {
	const logger = require("../logger.js");
	const express = require("express");
	const compress = require("compression");
	const responseCodes = require("../response_codes");
	const C = require("../constants");
	const cors = require("cors");
	const bodyParser = require("body-parser");
	const utils = require("../utils");
	const keyAuthentication =  require("../middlewares/keyAuthentication");
	const sessionManager = require("../middlewares/sessionManager");

	// Express app
	const app = express();

	app.disable("etag");

	// put logger in req object
	app.use(logger.startRequest);

	// Session middlewares
	app.use(keyAuthentication, sessionManager);

	app.use(cors({ origin: true, credentials: true }));

	// init the singleton db connection for modelFactory
	app.use((req, res, next) => {
		// init the singleton db connection
		const DB = require("../handler/db");
		DB.getDB("admin")
			.then(() => {
				// set db to singleton modelFactory class
				require("../models/factory/modelFactory")
					.setDB(DB);
				next();
			})
			.catch(err => {
				responseCodes.respond("Express Middleware", req, res, next, responseCodes.DB_ERROR(err), err);
			});
	});

	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.set("views", "./resources/pug");
	app.set("view_engine", "pug");

	app.use(bodyParser.json({ limit: "50mb" }));
	app.use(compress());

	app.use(function (req, res, next) {
		// intercept OPTIONS method
		if ("OPTIONS" === req.method) {
			res.sendStatus(200);
		} else {
			next();
		}
	});

	app.use("/", require("../routes/user"));

	app.use("/:account", require("../routes/job"));

	app.use("/", require("../routes/plan"));

	app.use("/", require("../routes/auth"));

	// notifications handler
	app.use("/notifications", require("../routes/notification"));

	// subscriptions handler
	app.use("/:account", require("../routes/subscriptions"));
	// invoices handler
	app.use("/:account", require("../routes/invoice"));
	// maps handler
	app.use("/:account", require("../routes/maps"));
	// payment api header
	app.use("/payment", require("../routes/payment"));

	app.use("/:account", require("../routes/teamspace"));
	app.use("/:account", require("../routes/permissionTemplate"));
	app.use("/:account", require("../routes/accountPermission"));

	// projects handlers
	app.use("/:account", require("../routes/project"));

	// models handlers
	app.use("/:account", require("../routes/model"));

	// metadata handler
	app.use("/:account/:model", require("../routes/meta"));

	// groups handler
	app.use("/:account/:model", require("../routes/group"));

	// viewpoints handler
	app.use("/:account/:model", require("../routes/viewpoint"));

	// issues handler
	app.use("/:account/:model", require("../routes/issueAnalytic"));
	app.use("/:account/:model", require("../routes/issue"));

	// risks handler
	app.use("/:account/:model", require("../routes/risk"));

	// history handler
	app.use("/:account/:model", require("../routes/history"));

	app.use(function(err, req, res, next) {
		if(err) {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		}

		err.stack && req[C.REQ_REPO].logger.logError(err.stack);
		// next(err);
	});

	return app;
};
