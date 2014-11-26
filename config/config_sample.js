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

module.exports = {
    server:  {
        http_port: 8080,
		https_port: 3000
    },
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
        x3domjs: 'http://x3dom.org/download/dev/x3dom.js',
        x3domcss : 'http://x3dom.org/download/dev/x3dom.css',
        repouicss : '../css/ui.css',
		repobasecss: '../css/base.css',
		dblistbasecss: '../css/dblist_base.css',
		jqueryjs : '../jquery.min.js',
		jqueryuijs : '../jquery-ui.min.js',
		jqueryuicss: '//code.jquery.com/ui/1.11.1/themes/smoothness/jquery-ui.css',
		angularjs: '//cdnjs.cloudflare.com/ajax/libs/angular.js/1.2.20/angular.min.js',
		angularutilsjs: '//cdnjs.cloudflare.com/ajax/libs/angular-ui-utils/0.1.1/angular-ui-utils.min.js',
		angularrouterjs: '//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.10/angular-ui-router.js',
		bootstrapcss: '../bootstrap/dist/css/bootstrap.min.css',
		bootstrapjs: '../bootstrap/dist/js/bootstrap.min.js',
		bootstrapdialog: '../bootstrap3-dialog/dist/js/bootstrap-dialog.min.js',
		fancytreecss: '../fancytree/dist/skin-xp/ui.fancytree.min.css',
		jqueryfancytree: '../fancytree/dist/jquery.fancytree-all.js'
	}
}

