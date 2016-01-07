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
var http_port  = 8000;
var https_port = 443;

module.exports = {
	host: hostname,
	api_server: {
		name: "api",
		subdomain_or_subdir : 1,
		http_port: http_port,
		https_port: https_port,
		public_port: http_port,
		public_protocol: "http"
	},
	cookie_secret: "A secret",
	cookie_parser_secret : "Another secret",
	default_format: "html",
	servers: [
		{
			hostname:   hostname,
			http_port:  http_port,
			https_port: https_port,
			template:   "frontend.jade"
		}
	],
	js_debug_level: 'debug',
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
		cert:'my_server.crt',
		ca: 'my_server.ca'
	},
	cn_queue: {
		host: 'amqp://localhost:5672',
		worker_queue: 'jobq',
		callback_queue: 'callbackq',
		upload_dir: 'uploads',
		shared_storage: 'D:/sharedSpace/'
	}
}

