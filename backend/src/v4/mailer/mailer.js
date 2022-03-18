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

"use strict";
const { createTestAccount } = require("nodemailer");
const nodemailer = require("nodemailer");
const config = require("../config");
const C = require("../constants");
const { systemLogger } = require("../logger");
const getBaseURL = config.getBaseURL;
let transporter;

async function sendEmail(template, to, data, attachments) {
	if(!config?.mail?.sender) {
		throw { message: "config.mail.sender is not set"};
	}

	if(!config?.mail?.smtpConfig) {
		if(config?.mail?.generateCredentials) {
			const { user, pass } = await createTestAccount();
			config.mail.smtpConfig = {
				host: "smtp.ethereal.email",
				port: 587,
				auth: {	user, pass }
			};
		} else {
			throw { message: "config.mail.smtpConfig is not set"};
		}
	}

	const mailOptions = {
		from: config.mail.sender,
		to,
		subject: typeof template.subject === "function" ? template.subject(data) : template.subject,
		html: template.html(data)
	};

	if(attachments) {
		mailOptions.attachments = attachments;
	}

	transporter = transporter || nodemailer.createTransport(config.mail.smtpConfig);

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, function(err, info) {
			if(err) {
				systemLogger.logDebug(`Email error - ${err.message}`);
				reject(err);
			} else {
				resolve(info);
			}
		});
	});
}

function rejectNoUrl(name) {
	return Promise.reject({ message: `config.mails.urls[${name}] is not defined`});
}

function getURL(urlName, params) {

	if(!C.MAIL_URLS || !C.MAIL_URLS[urlName]) {
		return null;
	}

	return getBaseURL() + C.MAIL_URLS[urlName](params);
}

function sendQueueFailedEmail(err) {
	if(config.contact) {
		const template = require("./templates/queueFailed");
		return sendEmail(template, config.contact.email, {domain: config.host, err: JSON.stringify(err)});
	} else{
		return Promise.reject({ message: "config.contact is not set"});
	}
}

function sendVerifyUserEmail(to, data) {

	data.url = getURL("verify", {token: data.token, username: data.username, pay: data.pay});

	if(!data.url) {
		return rejectNoUrl("verify");
	}

	const template = require("./templates/verifyUser");
	return sendEmail(template, to, data);
}

function sendWelcomeUserEmail(to, data) {
	const template = require("./templates/uponVerified");
	return sendEmail(template, to, data);
}

function sendResetPasswordEmail(to, data) {

	data.url = getURL("forgotPassword", {token: data.token, username: data.username});

	if(!data.url) {
		return rejectNoUrl("forgotPassword");
	}
	const template = require("./templates/forgotPassword");
	return sendEmail(template, to, data);
}

function sendPaymentReceivedEmail(to, data, attachments) {

	const template = require("./templates/paymentReceived");

	return sendEmail(template, to, data, attachments);
}

function sendPaymentReceivedEmailToSales(data, attachments) {

	let template = require("./templates/paymentReceived");

	if(data.type === "refund") {
		template = require("./templates/paymentRefunded");
	}

	const salesTemplate = {
		html: template.html,
		subject: function(_data) {
			return `[${_data.type}] [${_data.invoiceNo}] ${_data.email}`;
		}
	};

	if(config.contact && config.contact.sales) {
		// console.log(config.contact.sales);
		return sendEmail(salesTemplate, config.contact.sales, data, attachments);
	} else {
		return Promise.resolve();
	}

}

function sendNewUser(data) {

	const template = require("./templates/newUser");

	data.url = getBaseURL();

	if(config.contact && config.contact.sales) {
		// console.log(config.contact.sales);
		return sendEmail(template, config.contact.sales, data);
	} else {
		return Promise.resolve();
	}
}

function sendPaymentFailedEmail(to, data) {

	const template = require("./templates/paymentFailed");
	return sendEmail(template, to, data);

}

function sendPaymentRefundedEmail(to, data, attachments) {

	const template = require("./templates/paymentRefunded");
	return sendEmail(template, to, data, attachments);

}

function sendSubscriptionSuspendedEmail(to, data) {

	const template = require("./templates/paymentSuspended");
	data.url = getBaseURL() + `/${data.billingUser}/?page=billing`;

	return sendEmail(template, to, data);

}

function sendPaymentErrorEmail(data) {
	const template = require("./templates/paymentError");
	return sendEmail(template, config.contact.email, data);
}

function sendTeamspaceInvitation(to, data) {
	data.url = `${getURL("signup")}?email=${to}`;

	const template = require("./templates/invitedToTeamspace");
	return sendEmail(template, to, data);
}

function sendModelInvitation(to, data) {

	data.url = getURL("model", { account: data.account, model: data.model });

	if(!data.url) {
		return rejectNoUrl("model");
	}

	const template = require("./templates/invitedToModel");
	return sendEmail(template, to, data);
}

function sendImportError(data) {

	if(config.contact) {
		const template = require("./templates/importError");
		data.domain = config.host;
		return sendEmail(template, config.contact.email, data, data.attachments);
	} else {
		return Promise.reject({ message: "config.mail.sender is not set"});
	}
}

function sendFileMissingError(data) {
	if(config.contact) {
		const template = require("./templates/fileMissingError");
		data.domain = config.host;
		return sendEmail(template, config.contact.email, data);
	} else {
		return Promise.reject({ message: "config.mail.sender is not set"});
	}
}

module.exports = {
	sendVerifyUserEmail,
	sendWelcomeUserEmail,
	sendResetPasswordEmail,
	sendPaymentReceivedEmail,
	sendPaymentFailedEmail,
	sendPaymentErrorEmail,
	sendModelInvitation,
	sendSubscriptionSuspendedEmail,
	sendPaymentReceivedEmailToSales,
	sendPaymentRefundedEmail,
	sendImportError,
	sendNewUser,
	sendQueueFailedEmail,
	sendFileMissingError,
	sendTeamspaceInvitation
};
