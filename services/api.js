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


module.exports.app = function (sharedSession) {
	"use strict";

	let log_iface = require("../js/core/logger.js");

	let express = require("express");
	let routes = require("../routes.js")();
	let config = require("../js/core/config.js");
	let compress = require("compression");

	let systemLogger = log_iface.systemLogger;
	// Attach the encoders to the router
	require("../js/core/encoders/x3dom_encoder.js").route(routes);
	require("../js/core/encoders/json_encoder.js").route(routes);
	require("../js/core/encoders/html_encoder.js").route(routes);
	require("../js/core/encoders/src_encoder.js").route(routes);
	require("../js/core/encoders/img_encoder.js").route(routes);
	require("../js/core/encoders/bin_encoder.js").route(routes);

	var C = require("../js/core/constants");

	let bodyParser = require("body-parser");
	let responseCodes = require('../js/core/response_codes');
	let app = express();
	
	// put logger in req object
	app.use(log_iface.startRequest);

	// init the singleton db connection for modelFactory
	app.use((req, res, next) => {
		// init the singleton db connection
		let DB = require('../js/core/db')(req[C.REQ_REPO].logger);

		DB.getDB('default').then( db => {
			// set db to singleton modelFactory class
			require('../js/core/models/factory/modelFactory').setDB(db);
			next();
		}).catch( err => {
			console.log(err);
			responseCodes.respond('Express Middleware', req, res, next, responseCodes.PROCESS_ERROR(err), err);
		});
	});

	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.set('views', './jade');
	app.set('view_engine', 'jade');
	app.use(bodyParser.json());

	app.use(compress());

	// Allow cross origin requests to the API server
	if (config.crossOrigin)
	{
		let allowCrossDomain = function(req, res, next) {
			res.header("Access-Control-Allow-Origin", req.get("origin"));
			res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
			res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
			res.header("Access-Control-Allow-Credentials", true);
			//res.header("Cache-Control", "public, max-age=3600");

			// intercept OPTIONS method
			if ("OPTIONS" === req.method) {
				res.sendStatus(200);
			} else {
				next();
			}
		};

		app.use(allowCrossDomain);
	} else {
		app.use(function(req, res, next) {
			// intercept OPTIONS method
			if ("OPTIONS" === req.method) {
				res.sendStatus(200);
			} else {
				next();
			}
		});
	}

	app.use(sharedSession);
	// test helpers
	if(config.test_helper_api){
		systemLogger.logDebug("Adding Test helper API");
		app.use('/tests', require('../js/core/handlers/testHelper'));
	}
	
	//project handlers
	app.use('/:account/:project', require('../js/core/handlers/project'));
	// project package handlers
	app.use('/:account/:project', require('../js/core/handlers/projectPackage'));
	// bid hanlders
	app.use('/:account/:project/packages/:packageName', require('../js/core/handlers/bid'));

	app.use("/", routes.router);


	return app;
};
