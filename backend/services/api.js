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


module.exports.createApp = function (serverConfig) {
	"use strict";

	let sharedSession = serverConfig.session;

	let log_iface = require("../logger.js");

	let express = require("express");
	let routes = require("../routes/routes.js")();
	let config = require("../config.js");
	let compress = require("compression");
	let responseCodes = require("../response_codes");

	let C = require("../constants");

	let cors = require("cors");

	//let systemLogger = log_iface.systemLogger;
	// Attach the encoders to the router
	require("../encoders/x3dom_encoder.js").route(routes);
	require("../encoders/json_encoder.js").route(routes);
	//require("../encoders/html_encoder.js").route(routes);
	//require("../encoders/src_encoder.js").route(routes);
	require("../encoders/img_encoder.js").route(routes);
    require("../encoders/bin_encoder.js").route(routes);
    require("../encoders/gltf_encoder.js").route(routes);

	let bodyParser = require("body-parser");
	let app = express();

	app.use(sharedSession);

	app.use(cors({origin:true, credentials: true}));

	// put logger in req object
	app.use(log_iface.startRequest);

	// init the singleton db connection for modelFactory
	app.use((req, res, next) => {
		// init the singleton db connection
		let DB = require("../db/db")(req[C.REQ_REPO].logger);
		DB.getDB("admin").then( db => {
			// set db to singleton modelFactory class
			require("../models/factory/modelFactory").setDB(db);
			next();
		}).catch( err => {
			responseCodes.respond("Express Middleware", req, res, next, responseCodes.DB_ERROR(err), err);
		});
	});


	app.use(bodyParser.urlencoded({
		extended: true
	}));

	app.set("views", "./jade");
	app.set("view_engine", "jade");

	app.use(bodyParser.json({ limit: '2mb'}));

	app.use(function (req, res, next) {
		//if (req.session || (req.path === "/login" && req.method === "POST"))
		//{
		//	console.log("Using session");
			sharedSession(req, res, next);
		//} else {
		//	next();
		//}
	});

	app.use(compress());

	/*
	// Allow cross origin requests to the API server
	if (serverConfig.allowedOrigins)
	{
		let allowCrossDomain = function(req, res, next) {

			var origin = req.headers.origin;

			if ((serverConfig.allowedOrigins.indexOf("*") > -1) || (serverConfig.allowedOrigins.indexOf(origin) > -1)) {
				res.header("Access-Control-Allow-Origin", origin);
				res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
				res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
				res.header("Access-Control-Allow-Credentials", true);
				//res.header("Cache-Control", "public, max-age=3600");
			}

			next();
		};

		app.use(allowCrossDomain);
	}
	*/

	app.use(function(req, res, next) {
		// intercept OPTIONS method
		if ("OPTIONS" === req.method) {
			res.sendStatus(200);
		} else {
			next();
		}
	});

	//info handler
	app.get('/info', (req, res) => {
		require('child_process').exec('git rev-parse --short HEAD', { 
			cwd: __dirname 
		}, function (err, stdout) {
			res.status(200).json({ status: 'OK', version: stdout.split('\n')[0]});
		});
	});

	app.use('/', require('../routes/plan'));
	//auth handler
	app.use('/', require('../routes/auth'));
	// os api handler
	app.use('/os',require('../routes/osBuilding'));
	// payment api header
	app.use('/payment', require('../routes/payment'));

	if(config.test_helper_api){
		// test helpers
		app.use("/tests", require("../js/core/handlers/testHelper"));
		// api doc console
		app.use(express.static("doc"));
	}

	//project handlers
	app.use("/:account", require("../routes/project"));
	// project package handlers
	app.use("/:account/:project", require("../routes/projectPackage"));
	// bid hanlders
	app.use('/:account/:project/packages/:packageName', require('../routes/bid'));
	//groups handler
	app.use('/:account/:project/groups', require('../routes/group'));

	//issues handler
	app.use("/:account/:project", require("../routes/issue"));
	//mesh handler
	app.use("/:account/:project", require("../routes/mesh"));
	//texture handler
	app.use("/:account/:project", require("../routes/texture"));
	
	//history handler
	app.use("/:account/:project", require("../routes/history"));

	app.use("/", routes.router);

	return app;
};
