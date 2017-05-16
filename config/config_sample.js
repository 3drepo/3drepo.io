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
var chat_port = 3000;

module.exports = {
	port: http_port,
	host: hostname,
	http_port: http_port,
	https_port: https_port,
	cookie: {
	    secret: "a",
	    parser_secret: "b"
	},
	default_format: "html",
	servers: [
		{
			service: "api",
			subdirectory: "api",
			public_port: http_port,
			public_protocol: "http",
			http_port: http_port,
			https_port: https_port,

		},
		{
			service: "frontend",
			template:   "frontend.jade",
			public_port: http_port,
		},
		{
			service: "chat",
			http_port: chat_port,
			https_port: chat_port,
			subdirectory: 'chat',
			reconnection_attempts: 2
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
		username: '',
		password: ''
	},
	ssl: {
		default: {
			key: 'my_key.pem',
			cert:'my_server.crt',
			ca: 'my_server.ca'
		}
	},
	cn_queue: {
		host: 'amqp://localhost:5672',
		worker_queue: 'jobq',
		callback_queue: 'callbackq',
		upload_dir: 'uploads',
		shared_storage: 'D:/sharedSpace/'
	},
	os: {
		keys: {
			'property': '',
			'place': '',
			'map': ''
		},
		endpoints:{
			bbox: 'https://api.ordnancesurvey.co.uk/places/v1/addresses/bbox',
			radius: 'https://api.ordnancesurvey.co.uk/places/v1/addresses/radius',
			uprn: 'https://api.ordnancesurvey.co.uk/places/v1/addresses/uprn',
			dimensions: params => { return `https://api2.ordnancesurvey.co.uk/insights/beta/properties/${params.uprn}/dimensions` },
			map: params => { return `https://api2.ordnancesurvey.co.uk/mapping_api/v1/service/zxy/${params.tileMatrixSet}/${params.layer}/${params.z}/${params.x}/${params.y}.png` }
		}
	},

	crossOrigin: true,
	test_helper_api: false,
	disableCache: true,

	tokenExpiry: {
		emailVerify: 336,
		forgotPassword: 24
	},

	mail: {
		smtpConfig: {
			host: '',
			port: 465,
			secure: true, // use SSL
			auth: {
				user: '',
				pass: ''
			}
		},

		sender: '"3D Repo" <support@3drepo.org>',

		urls: {
			'forgotPassword': data => `/passwordChange?username=${data.username}&token=${data.token}`,
			'verify': data => `/registerVerify?username=${data.username}&token=${data.token}` + (data.pay ? '&pay=true' : ''),
			'project': data => `/${data.account}/${data.project}`
		}
	},
	
	captcha: {
		'validateUrl': 'https://www.google.com/recaptcha/api/siteverify',
		'secretKey': '',
		'clientKey': ''
	},

	auth: {
		captcha: true,
		register: true,
		allowPlusSignInEmail: false 
	},

	contact:{
		email: 'support@3drepo.org'
	},

	paypal:{
		
		validateIPN: true,
		ipnValidateUrl: 'https://www.paypal.com/cgi-bin/webscr',
		mode: 'live', //sandbox or live
		client_id: '',
		client_secret: '',
		debug:{
			forceExecuteAgreementError: false,
		}
	},

	uploadSizeLimit: 209715200,
	gaTrackId: '',
	invoice_dir: '/tmp',
	bcf_dir: '/tmp',
	pdf: {
		debug: {
			allowRegenerate: false
		}
	},

	vat: {
		checkUrl: 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl',
		debug: {
			skipNonGBChecking: false
		}
	},
}
