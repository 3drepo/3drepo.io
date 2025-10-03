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

var hostname   = "www.example.org";
var http_port  = 80;
var https_port = 443;

module.exports = {
	host: hostname,
	cookie: {
		secret: "a",
		parser_secret : "b"
	},
	HTTPSredirect: false,
	servers: [
		{
			service: "api",
			subdirectory: "api",
			public_port: http_port,
			public_protocol: "http"
		},
		{
			service: "frontend",
			template:   "frontend.pug"
		},
		{
			service: "chat",
			http_port: 3000,
			https_port: 3000,
			subdirectory: 'chat'
		}
	],
	js_debug_level: 'debug',
	logfile: {
		filename: './3drepo.log',
		console_level: 'info',
		file_level: 'debug',
		noColors: false,
		jsonOutput: false // will not be colourised regardless of other options.
	},
	loginPolicy: {
		maxUnsuccessfulLoginAttempts: 10,
		remainingLoginAttemptsPromptThreshold: 5,
		lockoutDuration: 900000
	},
	db: {
		host: 'localhost',
		port: 27017,
		username: 'adminUser',
		password: 'some_secure_password'
	},
	fs: {
		path: '/path/to/repo/data/dir/'
	},
	// ssl: {
	// 	key: "my_key.pem",
	// 	cert:"my_server.crt",
	// 	ca: "my_server.ca"
	// },
	mail: {
        smtpConfig: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: 'someemail@example.org',
                pass: 'some_secure_password'
            }
        },

        sender: '"3D Repo" <no-reply@3drepo.org>',

        urls: {
            'forgotPassword': data => `/passwordChange?username=${data.username}&token=${data.token}`,
            'verify': data => `/registerVerify?username=${data.username}&token=${data.token}` + (data.pay ? '&pay=true' : '')
        }
	},

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
		model_queue: 'modelq',
		callback_queue: 'callbackq',
		upload_dir: '/tmp/uploads',
		shared_storage: '/tmp/uploads',
		event_exchange: 'eventExchange'
	},
	uploadSizeLimit: 8388608, // 8MB in test enviroment
	paypal:{
		validateIPN: false,
		ipnValidateUrl: 'https://www.sandbox.paypal.com/cgi-bin/webscr',
		mode: 'sandbox', //sandbox or live
		//for travis only
		client_id: 'AWog5lbf6LTb07XvRzvl4KAXVrmUyv4rEopFBNxHwO3nNieukILfTSxm8xCdsoAalrWTOPo9oQcrm3R-',
		client_secret: 'EGIwoNlM_vq6rYsmIF2gOGDs0h2uilsiXyKiWjHT3TCqJLrdRHpneFAt5TvVmzjYFvrdZpYF9-zrfNmQ',
		debug:{
			forceExecuteAgreementError: false,
			showFullAgreement: true
		}
	},
	vat: {
		checkUrl: 'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl',
		debug: {
			skipChecking: true
		}
	},
	intercom: {
		license: "",    // This is for identifying which app is yours in the intercom client
		secretKey: "",  // This is for validating the user identity in intercom
		accessToken: "" // This is for the api request to intercom in the backend
	},
    elastic: {
		/*
		 * Please refer to elastic documentation for configuration settings
		 * https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-configuration.html
		*/
	    namespace: "" // namespace of deployment
    },
	apryse: {
		licenseKey: "" // License key for the Apryse WebViewer SDK for the PDF drawings viewer
	},
	termsUpdatedAt: 1520592720000,
}
