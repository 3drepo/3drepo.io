/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const baseTemplate = require('./templates/baseTemplate');
const config = require('../../utils/config');
const { createTestAccount } = require('nodemailer');
const { logger } = require('../../utils/logger');
const nodemailer = require('nodemailer');

let transporter;

const Mailer = {};

Mailer.sendEmail = async (templateName, to, data, attachments) => {
	if (!config?.mail?.sender) {
		throw { message: 'config.mail.sender is not set' };
	}

	if (!config?.mail?.smtpConfig) {
		if (config?.mail?.generateCredentials) {
			const { user, pass } = await createTestAccount();
			config.mail.smtpConfig = {
				host: 'smtp.ethereal.email',
				port: 587,
				auth: { user, pass },
			};
		} else {
			throw { message: 'config.mail.smtpConfig is not set' };
		}
	}

	// eslint-disable-next-line global-require, import/no-dynamic-require, security/detect-non-literal-require
	const template = require(`./templates/${templateName}`);
	const templateHtml = template.html(data);

	const mailOptions = {
		from: config.mail.sender,
		to,
		subject: typeof template.subject === 'function' ? template.subject(data) : template.subject,
		html: baseTemplate.html({ ...data, emailContent: templateHtml }),
	};

	if (attachments) {
		mailOptions.attachments = attachments;
	}

	transporter = transporter || nodemailer.createTransport(config.mail.smtpConfig);

	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				logger.logDebug(`Email error - ${err.message}`);
				reject(err);
			} else {
				resolve(info);
			}
		});
	});
};

module.exports = Mailer;
