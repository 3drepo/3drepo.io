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

		// TODO: This is better than before
		// but still not great, we could just use nginx or 
		// a static file server for all of this stuff and 
		// use Node for the API

		// Static file serving
		const publicDir = __dirname + "/../../public";
		const statics = [
			"/images",
			"/dist",
			"/icons",
			"/fonts",
			"/manifest-icons",
			"/templates",
			"/unity"
		];

		statics.forEach((folder) => {
			const staticPath = path.resolve(publicDir + folder);
			app.use(folder, express.static(staticPath));
		});


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

		// app.get('/*.html', function(req, res){
		// 	res.status(404).send("File not found");
		// });

		// app.get('/*.js', function(req, res){
		// 	res.status(404).send("File not found");
		// });
		
		app.get('*', function(req,res){
			res.sendFile(path.resolve(publicDir + "/index.html"));
		});

		return app;
	};

})();
