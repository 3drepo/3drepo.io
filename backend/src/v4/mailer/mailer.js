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
	if (!config?.mail?.sender) {
		throw { message: "config.mail.sender is not set" };
	}

	if (!config?.mail?.smtpConfig) {
		if (config?.mail?.generateCredentials) {
			const { user, pass } = await createTestAccount();
			config.mail.smtpConfig = {
				host: "smtp.ethereal.email",
				port: 587,
				auth: { user, pass }
			};
		} else {
			throw { message: "config.mail.smtpConfig is not set" };
		}
	}

	const mailOptions = {
		from: config.mail.sender,
		to,
		subject: typeof template.subject === "function" ? template.subject(data) : template.subject,
		html: template.html(data)
	};

	if (attachments) {
		mailOptions.attachments = attachments;
	}

	transporter = transporter || nodemailer.createTransport(config.mail.smtpConfig);

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, function (err, info) {
			if (err) {
				systemLogger.logDebug(`Email error - ${err.message}`);
				reject(err);
			} else {
				resolve(info);
			}
		});
	});
}

function getURL(urlName, params) {

	if (!C.MAIL_URLS || !C.MAIL_URLS[urlName]) {
		return null;
	}

	return getBaseURL() + C.MAIL_URLS[urlName](params);
}

function sendTeamspaceInvitation(to, data) {
	data.url = `${getURL("signup")}?email=${to}`;

	const template = require("./templates/invitedToTeamspace");
	return sendEmail(template, to, data);
}

module.exports = {
	sendTeamspaceInvitation
};
