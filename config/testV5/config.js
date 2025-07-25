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

const hostname   = "127.0.0.1";
const http_port  = 8080;
const https_port = 443;

const tmpDir = require("os").tmpdir();
const {mkdirSync} = require("fs");
const Path = require("path");
const fileSharePath = Path.join(tmpDir, "v5FileShare");
const sharedDirPath = Path.join(tmpDir, "v5SharedDir");
try {
	mkdirSync(fileSharePath);
} catch(err) {
	if(err.code !== "EEXIST") throw err;
}

try {
	mkdirSync(sharedDirPath);
} catch(err) {
	if(err.code !== "EEXIST") throw err;
}


module.exports = {
	testEnv: true,
	host: hostname,
	port: 8080,
	cookie: {
		secret: "a",
		parser_secret : "b",
		maxAge: 1000 * 60 * 60
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
			public_port: http_port,
			http_port: http_port
		},
		{
			service: "frontend",
			subdomain: "test",
			public_port: http_port,
			http_port: http_port
		},
		{
			service: "chat",
			port: 3000,
			chatOnPublicPort: false,
			subdirectory: 'chat'
		}
	],
	customLogins: {
		test: {
			loginMessage: "Test",
			css: "custom/test/css/test.css",
			topLogo: "custom/test/images/test_logo.png",
			topLogoLink: "example.com",
			backgroundImage: "custom/test/images/test_background.png"
		}
	},
	js_debug_level: 'debug',
	logfile: {
		silent: true,
		filename: './3drepo.log',
		console_level: 'info',
		file_level: 'debug'
	},
	db: {
		host: "127.0.0.1",
		port: 27227
	},
	s3: {
		accessKey: process.env.S3_ACCESS_KEY,
		secretKey: process.env.S3_SECRET_KEY,
		region: "eu-west-2",
		bucketName: "3drepo-travis"
	},
	fs: {
		path: fileSharePath,
		levels: 2
	},
	defaultStorage: "fs",
	tokenExpiry: {
		emailVerify: 336,
		forgotPassword: 24
	},
	unitySettings: {
        	TOTAL_MEMORY: 2130706432 / 10,
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
		upload_dir: tmpDir,
		shared_storage: sharedDirPath,
		event_exchange: 'eventExchange'
	},
	subscriptions: {
		basic: {
			collaborators: 0,
			data: 1
		},
		plans: {
			hundredQuidPlan: {
				collaborators : 1,
				label: "100-QUID-PRO-PLAN",
				data: 1024* 10,
				available: false,
				price: 100
			},
			march2018: {
				collaborators: 1,
				label: "Advance License (from 2018)",
				data: 1024 * 2,
				available: true,
				price: 29

			}
		}
	},
	uploadSizeLimit: 8388608, // 8MB in test enviroment
	test_helper_api: false,
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
	legal: [
		{title: "Terms & Conditions", type: "agreeTo", page: "terms", fileName: "terms.html"},
		{title: "Privacy", type: "haveRead", page: "privacy", fileName: "privacy.html"},
		{title: "Cookies", type: "haveRead", page: "cookies", fileName: "cookies.html"}
	],
	userNotice: false,
	termsUpdatedAt: 12345678,

	mail: {
		smtpConfig: {
		    host: 'smtp.ethereal.email',
		    port: 587,
    		auth: {
	            user: 'scottie17@ethereal.email',
		        pass: 'hEzMEnr47CP6xKWvJj'
		    }
		},
		sender: '"3D Repo" <dummyEmail@3drepo.org>'
	},

	sso: {
	frontegg: {
			appUrl: "https://localhost",
			appId: "384eaa91-5d56-42bc-ad91-d27984a679a5",
			clientId: "d3cbc66a-33a4-4e5b-8c24-32331944b228",
			key: "bf8dfa6c-b2c1-4546-92ee-14999ddab6b1",
			vendorDomain: "https://localhost",
			userRole: "APP_USER",

		}

	}
}
