var nodemailer = require('nodemailer');
var config = require('../config');

var transporter;

function sendEmail(template, to, data){
	'use strict';


	if(!config.mail || !config.mail.smtpConfig){
		return Promise.reject({ message: 'config.mail.smtpConfig is not set'});
	}

	if(!config.mail || !config.mail.smtpConfig){
		return Promise.reject({ message: 'config.mail.sender is not set'});
	}

	let mailOptions = {
		from: config.mail.sender,
		to: to,
		subject: template.subject,
		html: template.html(data)
	};

	transporter = transporter || nodemailer.createTransport(config.mail.smtpConfig);

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, function(err, info){
			if(err){
				reject(err);
			} else {
				resolve(info);
			}
		});
	});
}

function rejectNoUrl(name){
	return Promise.reject({ message: `config.mails.urls[${name}] is not defined`})
}

function getURL(urlName, params){

	if(!config.mail || !config.mail.urls || !config.mail.urls[urlName]){
		return null;
	}

	return config.mail.urls[urlName](params);
}

function sendVerifyUserEmail(to, data){
	'use strict';

	data.url = getURL('verify', data.token);

	if(!data.url){
		return rejectNoUrl('verify');
	}

	let template = require('./templates/verifyUser');
	return sendEmail(template, to, data);
}


function sendResetPasswordEmail(to, data){
	'use strict';

	data.url = getURL('forgotPassword', data.token);

	if(!data.url){
		return rejectNoUrl('forgotPassword');
	}

	let template = require('./templates/forgotPassword');
	return sendEmail(template, to, data);
}

module.exports = {
	sendVerifyUserEmail,
	sendResetPasswordEmail
}