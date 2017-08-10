/**
 *	Copyright (C) 2014 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(() => {
	"use strict";

	/**
	 * Creates frontend API Express app 
	 * 
	 * @param {Object} serverConfig - Config for server instance
	 * @returns
	 */
	module.exports.createApp = function (serverConfig) {

		const express = require("express");
		const bodyParser = require("body-parser");
		const compress = require("compression");
		const path = require("path");
		const favicon = require("serve-favicon");
		const serialize = require("serialize-javascript");
		const app = express();
		const _ = require("lodash");
		const createClientConfig = require("./clientConfig.js").createClientConfig;

		app.use(compress({ level: 9 }));

		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json());

		app.set("views", "./pug");
		app.set("view_engine", "pug");
		app.locals.pretty = true;

		app.use(favicon("./public/images/favicon.ico"));

		// Static file serving
		const publicDir = __dirname + "/../../public";
		app.use("/public", express.static(publicDir));
		app.get("/public/*", function (req, res) {
			res.status(404).send("File not found");
		});
		
		// TODO: This is a horrible hack, we should move to a static file server :/
		app.get("/manifest.json", function (req, res) {
			res.sendFile(path.resolve(publicDir + "/manifest.json"));
		});

		app.get("/precache.js", function (req, res) {
			res.sendFile(path.resolve(publicDir + "/service-workers/precache.js"));
		});


		const clientConfig = createClientConfig(serverConfig);

		app.get("/version.json", function (req, res) {
			return res.json({"VERSION": clientConfig.VERSION });
		});

		app.get("/config.js", function (req, res) {

			// Only need to set the userId the rest is static
			clientConfig.userId = _.get(req, "session.user.username");

			// TODO: This used to be a long string concat, 
			// this is marginally better but still a complete hack. 
			// There is definitely a better way to do this
			const serializedConfig = serialize(clientConfig); 

			res.header("Content-Type", "text/javascript");
			res.render("config.pug", {config: serializedConfig});
		});


		app.get("*", function (req, res) {
			// Only need to set the userId the rest is static
			clientConfig.userId = _.get(req, "session.user.username");
			res.render(serverConfig.template, clientConfig);
		});


		return app;
	};

})();
