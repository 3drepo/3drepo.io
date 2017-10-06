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

"use strict";

/**
 * Creates frontend API Express app 
 * 
 * @param {Object} serverConfig - Config for server instance
 * @returns
 */
module.exports.createApp = function () {

	const express = require("express");
	const bodyParser = require("body-parser");
	const compress = require("compression");
	const favicon = require("serve-favicon");
	const app = express();
	const path = require("path");
	
	const publicDir = __dirname + "/../../public";

	app.use(compress({ level: 9 }));
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(favicon("./public/images/favicon.ico"));

	app.locals.pretty = true;


	app.use(express.static(publicDir));


	app.use(function(req, res, next) {

		if (req.path.indexOf(".") !== -1) {
			next();
		}
		res.sendFile(path.resolve(publicDir + "/index.html"));
		
	});

	return app;
};
