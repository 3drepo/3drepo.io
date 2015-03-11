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

var hostname   = "example.org";
var http_port  = 80;
var https_port = 443;

module.exports = {
	apiServer: {
		hostname: "api." + hostname,
		http_port: http_port,
		https_port: https_port
	},
	vhost: true,
	defaultFormat: "html",
	servers: [
		{
			hostname:   hostname,
			http_port:  http_port,
			https_port: https_port,
			template:   "frontend.jade"
		}
	],
	logfile: {
		filename: '/var/log/3drepo.log',
		console_level: 'debug',
		file_level: 'debug'
	},
	db: {
		host: 'localhost',
		port: 27017,
		username: 'username',
		password: 'password'
	},
	ssl: {
		key: 'my_key.pem',
		cert:'my_server.crt'
	},
	external: {
		// 3DRepo
		repouicss : '../css/ui.css',
		repobasecss: '../css/base.css',
		dblistbasecss: '../css/dblist_base.css',

		// X3DOM
		x3domjs: 'http://x3dom.org/download/dev/x3dom.js',
		x3domcss : 'http://x3dom.org/download/dev/x3dom.css',
		ammojs: 'http://x3dom.org/download/dev/ammo.js',

		// JQuery
		jqueryjs : 'http://code.jquery.com/jquery-2.1.1.min.js',
		jqueryuijs : 'http://code.jquery.com/ui/1.11.4/jquery-ui.min.js',
		jqueryuicss: 'http://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css',

		// Angular
		angularjs: '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.20/angular.min.js',
		angularutilsjs: '//cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
		angularrouterjs: '//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.10/angular-ui-router.js',

		// Bootstrap
		bootstrapcss: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css',
		bootstrapjs: 'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js',
		bootstrapdialog: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap3-dialog/1.34.2/js/bootstrap-dialog.min.js',
		bootstrapselectjs: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.4/js/bootstrap-select.js',
		bootstrapselectcss: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.4/css/bootstrap-select.css',
		fontawesomecss: '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css',

		// Fancytree
		fancytreecss: 'https://cdnjs.cloudflare.com/ajax/libs/jquery.fancytree/2.8.1/skin-xp/ui.fancytree.min.css',
		jqueryfancytree: 'https://cdnjs.cloudflare.com/ajax/libs/jquery.fancytree/2.8.1/jquery.fancytree-all.js',

		// Typeahead
		typeaheadjs: '//cdnjs.cloudflare.com/ajax/libs/typescript/1.0.0/typescript.min.js',

		// Showdown
		showdownjs: '//cdnjs.cloudflare.com/ajax/libs/showdown/0.3.1/showdown.min.js'
	}
}

