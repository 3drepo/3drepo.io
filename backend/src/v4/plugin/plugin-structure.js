/**
 *  Copyright (C) 2021 3D Repo Ltd
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
module.exports.DEFAULT_PLUGIN_STRUCTURE = {
	"plugin": "home",
	"friends": [
		"login"
	],
	"functions": [
		"register-request",
		"register-verify",
		"password-forgot",
		"password-change",
		"pricing",
		"sign-up",
		"contact",
		"payment",
		"billing"
	],
	"children": [{
		"plugin": "account",
		"url": ":account",
		"children": [{
			"plugin": "model",
			"url": "/:model/:revision",
			"params": {
				"revision": {
					value: null,
					squash: true
				},
				"noSet":{
					value: false
				}
			},
			"children":[{
				"plugin": "issue",
				"url": "/issues/:issue"
			},{
				"plugin": "risk",
				"url": "/risks/:risk"
			}],
			"friends": [
				"panel",
				"filter",
				"tree",
				"viewpoints",
				"issues",
				"risks",
				"clip",
				"docs",
				"utils",
				"groups",
				"measure",
				"right-panel",
				"building",
				"revisions"
			]
		}]
	}]
};
