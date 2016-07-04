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

var hostname   = "127.0.0.1";
var http_port  = 80;
var https_port = 443;

module.exports = {
	host: hostname,
	cookie: {
		secret: "a",
		parser_secret : "b"
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
		console_level: 'info',
		file_level: 'debug'
	},
	db: {
		host: 'localhost',
		port: 27017,
		username: 'admintesting',
		password: 'admintesting'
	},
	// ssl: {
	// 	key: "my_key.pem",
	// 	cert:"my_server.crt",
	// 	ca: "my_server.ca"
	// },
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
	// cn_queue: {
	// 	host: "amqp://localhost:5672",
	// 	worker_queue: "jobq",
	// 	callback_queue: "callbackq",
	// 	upload_dir: "uploads",
	// 	shared_storage: "D:/sharedSpace/"
	// },
	tokenExpiry: {
		emailVerify: 336,
		forgotPassword: 24
	},
	auth: {
		captcha: false,
		register: true
	},	crossOrigin: true,
	cn_queue: {
		host: 'amqp://localhost:5672',
		worker_queue: 'jobq',
		callback_queue: 'callbackq',
		upload_dir: 'uploads',
		shared_storage: 'uploads'
	},
	uploadSizeLimit: 8388608, // 8MB in test enviroment
	test_helper_api: false,
	paypal:{
		validateIPN: false,
		ipnValidateUrl: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
		mode: 'sandbox', //sandbox or live
		//for travis only
		client_id: 'AWog5lbf6LTb07XvRzvl4KAXVrmUyv4rEopFBNxHwO3nNieukILfTSxm8xCdsoAalrWTOPo9oQcrm3R-',
		client_secret: 'EGIwoNlM_vq6rYsmIF2gOGDs0h2uilsiXyKiWjHT3TCqJLrdRHpneFAt5TvVmzjYFvrdZpYF9-zrfNmQ'
	}
}
