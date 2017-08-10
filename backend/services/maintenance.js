/**
 *	Copyright (C) 2017 3D Repo Ltd
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
		const config = require("../config.js");
		const pug = require("pug");

		const app = express();

		const publicDir = __dirname + "/../../public";
		app.use("/public", express.static(publicDir));
		app.get("/public/*", function (req, res) {
			res.status(404).send('File not found');
		});
		
		app.set("views", "./pug/");
		app.set("view_engine", "pug");
		app.locals.pretty = true;

		//app.use(favicon("./public/images/favicon.ico"));

		app.get("*", function (req, res) {
			// Generate the list of files to load for the plugins
			//const clientConfig = createClientConfig(req);
			res.render("maintenance.pug", {});
		});

		return app;
	};
})();
