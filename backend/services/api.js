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

(() => {
	"use strict";

	/**
	 * Create API Express app
	 * 
	 * @param {Object} serverConfig - Configuration for server
	 * @returns
	 */
	module.exports.createApp = function (serverConfig) {

		const sharedSession = serverConfig.session;
		const log_iface = require("../logger.js");
		const express = require("express");
		//const routes = require("../routes/routes.js")();
		const compress = require("compression");
		const responseCodes = require("../response_codes");
		const C = require("../constants");
		const cors = require("cors");
		const bodyParser = require("body-parser");
		const utils = require("../utils");
		// Express app
		let app = express();

		// Attach the encoders to the router
		// require("../encoders/x3dom_encoder.js")
		// 	.route(routes);
		// require("../encoders/json_encoder.js")
		// 	.route(routes);

		app.disable('etag');

		// put logger in req object
		app.use(log_iface.startRequest);

		// Configure various middleware
		app.use(sharedSession);
		app.use(cors({ origin: true, credentials: true }));

		// init the singleton db connection for modelFactory
		app.use((req, res, next) => {
			// init the singleton db connection
			let DB = require("../db/db")(req[C.REQ_REPO].logger);
			DB.getDB("admin")
				.then(db => {
					// set db to singleton modelFactory class
					require("../models/factory/modelFactory")
						.setDB(db);
					next();
				})
				.catch(err => {
					responseCodes.respond("Express Middleware", req, res, next, responseCodes.DB_ERROR(err), err);
				});
		});

		app.use(bodyParser.urlencoded({
			extended: true
		}));

		app.set("views", "./jade");
		app.set("view_engine", "jade");

		app.use(bodyParser.json({ limit: "2mb" }));

		app.use(compress());

		app.use(function (req, res, next) {
			// intercept OPTIONS method
			if ("OPTIONS" === req.method) {
				res.sendStatus(200);
			} else {
				next();
			}
		});



		app.use("/", require("../routes/plan"));
		//auth handler
		app.use("/", require("../routes/auth"));
		// subscriptions handler
		app.use("/:account", require("../routes/subscriptions"));
		// invoices handler
		app.use("/:account", require("../routes/invoice"));
		// os api handler
		app.use("/os", require("../routes/osBuilding"));
		// payment api header
		app.use("/payment", require("../routes/payment"));

		app.use("/:account", require("../routes/job"));
		app.use("/:account", require("../routes/permissionTemplate"));
		app.use("/:account", require("../routes/accountPermission"));
		
		// projects handlers
		app.use("/:account", require("../routes/project"));

		//models handlers
		app.use("/:account", require("../routes/model"));

		//metadata handler
		app.use("/:account/:model", require("../routes/meta"));

		//groups handler
		app.use("/:account/:model/groups", require("../routes/group"));
		
		//issues handler
		app.use("/:account/:model", require("../routes/issueAnalytic"));
		app.use("/:account/:model", require("../routes/issue"));

		//mesh handler
		app.use("/:account/:model", require("../routes/mesh"));
		//texture handler
		app.use("/:account/:model", require("../routes/texture"));

		//history handler
		app.use("/:account/:model", require("../routes/history"));

		//app.use("/", routes.router);

		app.use(function(err, req, res, next) {
			if(err){
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			}
			next(err);
		});

		return app;
	};
})();