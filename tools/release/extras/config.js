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

/*
 * ===== MODIFY YOUR SETTINGS HERE! =====
 */
var dbAddress = "localhost";      //Hostname of your running mongo database
var dbPort    = 27017;            //Port of your running mongo database
var dbUser    = "adminUserName";  //Username of an existing user in mongo with admin rights
var dbPwd     = "adminPassword";  //Password of "dbUser" in mongo with admin rights

var hostname   = "example.org";   //The URL for your website
var http_port  = 80;              //port number for HTTP traffic
var https_port = 443;             //port number for HTTPS traffic

/*
 * ====================================== 
 */

module.exports = {
	host: hostname,
	cookie: {
		secret: "A secret",
		parser_secret : "Another secret",
		maxAge: 3600,
	},
	servers: [
		{
			service: "api",
			subdirectory: "api",
			public_port: http_port,
			public_protocol: "http"
		},
		{
			service: "frontend",
			template:   "frontend.jade"
		}
	],
	js_debug_level: 'debug',
	logfile: {
		filename: './3drepo.log',
		console_level: 'error',
		file_level: 'debug'
	},
	db: {
		host: dbAddress,
		port: dbPort,
		username: dbUser,
		password: dbPwd'
	},
/*	ssl: {
		key: "my_key.pem",
		cert:"my_server.crt",
		ca: "my_server.ca"
	},
	os: {
		keys: {
			'property': '<your key>',
			'place': '<your key>',
			'map': '<your key>'
		},
		endpoints:{
			bbox: 'https://api.ordnancesurvey.co.uk/places/v1/addresses/bbox',
			radius: 'https://api.ordnancesurvey.co.uk/places/v1/addresses/radius',
			dimensions: params => { return `https://api2.ordnancesurvey.co.uk/insights/beta/properties/${params.uprn}/dimensions` },
			map: params => { return `https://api2.ordnancesurvey.co.uk/mapping_api/v1/service/zxy/${params.tileMatrixSet}/${params.layer}/${params.z}/${params.x}/${params.y}.png` }
		}
	},
*/
	cn_queue: {
		host: "amqp://localhost:5672",
		worker_queue: "jobq",
		callback_queue: "callbackq",
		upload_dir: "uploads",
		shared_storage: "D:/sharedSpace/"
	},

	crossOrigin: true,
	test_helper_api: false
}
