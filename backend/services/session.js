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

// This file contains the session shared between various services
// TODO: Currently this stores everything on the filesystem,
// but it needs to be changed.
(function(){
	"use strict";

	let expressSession = require("express-session");
	let FileStore = require("session-file-store")(expressSession);

	module.exports.session = function(config) {
		var sessionConfig = expressSession({
			secret: config.cookie.secret,
			resave: true,
			saveUninitialized: false,
			cookie: {
				domain: config.cookie.domain,
				path: "/",
				secure: config.using_ssl
			},
			store: new FileStore()
		});

		return sessionConfig;
	};

})();


