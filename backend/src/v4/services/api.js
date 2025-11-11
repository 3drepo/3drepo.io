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

const { v5Path } = require("../../interop");
const express = require("express");
const compress = require("compression");
const responseCodes = require("../response_codes");
const cookieParser = require("cookie-parser");
const { systemLogger, logLabels } = require("../logger");
const cors = require("cors");
const bodyParser = require("body-parser");
const bodyParserErrorHandler = require("express-body-parser-error-handler");
const utils = require("../utils");
const keyAuthentication =  require("../middlewares/keyAuthentication");
const { respond } = require(`${v5Path}/utils/responder`);
const { templates } = require(`${v5Path}/utils/responseCodes`);
const { initialiseSystem } = require(`${v5Path}/services/initialiser`);
const { BYPASS_AUTH } = require(`${v5Path}/utils/config.constants`);

const APIService = {};

const addV4Routes = (app) => {
	app.use("/", require("../routes/user"));

	app.use("/:account", require("../routes/job"));

	app.use("/", require("../routes/plan"));

	app.use("/", require("../routes/auth"));

	// notifications handler
	app.use("/notifications", require("../routes/notification"));

	// subscriptions handler
	app.use("/:account", require("../routes/subscriptions"));
	// maps handler
	app.use("/:account", require("../routes/maps"));

	app.use("/:account", require("../routes/teamspace"));
	app.use("/:account", require("../routes/permissionTemplate"));
	app.use("/:account", require("../routes/accountPermission"));

	app.use("/:account", require("../routes/invitations"));

	// projects handlers
	app.use("/:account", require("../routes/project"));

	// models handlers
	app.use("/:account", require("../routes/model"));

	// risk mitigation handlers
	app.use("/:account", require("../routes/mitigation"));

	// metadata handler
	app.use("/:account/:model", require("../routes/meta"));

	// groups handler
	app.use("/:account/:model", require("../routes/group"));

	// views handler
	app.use("/:account/:model", require("../routes/view"));

	// issues handler
	app.use("/:account/:model", require("../routes/issue"));

	// resources handler
	app.use("/:account/:model", require("../routes/resources"));

	// risks handler
	app.use("/:account/:model", require("../routes/risk"));

	// sequences handler
	app.use("/:account/:model", require("../routes/sequence"));

	// history handler
	app.use("/:account/:model", require("../routes/history"));

	// presentation handler
	app.use("/:account/:model", require("../routes/presentation"));

	// If the route is not matched by any of the endpoints
	app.use((req, res) => {
		respond(req, res, templates.pageNotFound);
	});
};

APIService.createAppAsync = async (config, v5Init = true) => {
	const { manageSessions } = require(`${v5Path}/middleware/sessions`);
	// Express app
	const app = express();
	app.use(cookieParser());

	if (!config?.using_ssl && config?.public_protocol === "https") {
		app.set("trust proxy", 1);
	}
	app.set(BYPASS_AUTH, !!config[BYPASS_AUTH]);

	app.disable("etag");

	// Session middlewares
	app.use(keyAuthentication, manageSessions);

	app.use(cors({ origin: true, credentials: true }));

	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.set("views", "./resources/pug");
	app.set("view_engine", "pug");

	app.use(bodyParser.json({ limit: "50mb" }));
	app.use(bodyParserErrorHandler());
	app.use(compress({ level: 9 }));

	app.use(function (req, res, next) {
		// record start time of the request
		req.startTime = Date.now();
		// intercept OPTIONS method
		if ("OPTIONS" === req.method) {
			res.sendStatus(200);
		} else {
			next();
		}
	});

	if(v5Init) {
		await Promise.all([
			require(`${v5Path}/services/eventsListener/eventsListener`).init(),
			require("../models/chatEvent").subscribeToV5Events(),
			require("../models/intercom").subscribeToV5Events(),
			require("../handler/elastic").subscribeToV5Events(),
			require(`${v5Path}/services/modelProcessing`).init(),
			initialiseSystem()
		]);
	}
	require(`${v5Path}/routes/routesManager`).init(app);
	addV4Routes(app);

	app.use(function(err, req, res, next) {
		if(err) {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		}

		err.stack && systemLogger.logError(err.stack);
		// next(err);
	});

	return app;
};

APIService.createApp = (config, v5Init = true) => {
	const { manageSessions } = require(`${v5Path}/middleware/sessions`);
	// Express app
	const app = express();
	app.use(cookieParser());

	if (!config?.using_ssl && config?.public_protocol === "https") {
		app.set("trust proxy", 1);
	}
	app.set(BYPASS_AUTH, !!config[BYPASS_AUTH]);
	app.disable("etag");

	// Session middlewares
	app.use(keyAuthentication, manageSessions);

	app.use(cors({ origin: true, credentials: true }));

	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.set("views", "./resources/pug");
	app.set("view_engine", "pug");

	app.use(bodyParser.json({ limit: "50mb" }));
	app.use(bodyParserErrorHandler());
	app.use(compress({ level: 9 }));

	app.use(function (req, res, next) {
		// record start time of the request
		req.startTime = Date.now();
		systemLogger.logInfo(`[IN] ${req.method} ${req.originalUrl}`, undefined, logLabels.network);
		// intercept OPTIONS method
		if ("OPTIONS" === req.method) {
			res.sendStatus(200);
		} else {
			next();
		}
	});

	if(v5Init) {
		require(`${v5Path}/services/eventsListener/eventsListener`).init();
		require("../models/chatEvent").subscribeToV5Events();
		require("../models/intercom").subscribeToV5Events();
		require("../handler/elastic").subscribeToV5Events();
		require(`${v5Path}/services/modelProcessing`).init();
		initialiseSystem();
	}
	require(`${v5Path}/routes/routesManager`).init(app);
	addV4Routes(app);

	app.use(function(err, req, res, next) {
		if(err) {
			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		}

		err.stack && systemLogger.logError(err.stack);
		// next(err);
	});

	return app;
};

module.exports = APIService;
