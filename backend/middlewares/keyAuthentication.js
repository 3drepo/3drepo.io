/**
 *  Copyright (C) 2019 3D Repo Ltd
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

const User = require("../models/user");
const getPath = require("../utils").APIInfo;

const matchPath = (path1, path2) => {
	path1 = path1.split("/");
	path2 = path2.split("/");

	return path1.length === path2.length &&
		path1.every((p, i) => path2[i].trim() === "*" || p.trim() === "*" || p === path2[i]);
};

const matchPaths = (path, listOfPaths) => listOfPaths.some(p => matchPath(p, path));

const BLACK_LIST = [
	"* /apikey",
	"* /login",
	"* /logout",
	"PUT /*",
	"PUT /*/password",
	"POS /*/verify",
	"POST /forgot-password",
	"POST /*/avatar",
	"GET /*/invoices",
	"GET /*/invoices/*",
	"* /*/jobs",
	"* /*/jobs/*",
	"* /*/jobs/*/*",
	"GET /*/myJob",
	"* /*/subscriptions",
	"GET /*/quota"
];

async function apiKeyCheck(req, res, next) {
	if (req.query.key) {
		const path = getPath(req);

		if  (matchPaths(path, BLACK_LIST)) {
			next();
			return;
		}

		const user = await User.findByAPIKey(req.query.key);
		if (user) {
			req.session = {};
			req.session.user = { username: user.user, roles: user.roles };
		}
	}

	next();
}

module.exports = apiKeyCheck;
