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
const { templates } = require('./mailer.constants');

const Mailer = {};

const checkMailerConfig = async () => {
	if (!config?.mail?.sender) {
		throw new Error('config.mail.sender is not set');
	}

	if (!config?.mail?.smtpConfig) {
		if (config?.mail?.generateCredentials) {
			const { user, pass } = await createTestAccount();			

			config.mail.smtpConfig = {
				host: 'smtp.ethereal.email',
				port: 587,
				auth: { user, pass },
			};

			transporter = nodemailer.createTransport(config.mail.smtpConfig);
		} else {
			throw new Error('config.mail.smtpConfig is not set');
		}
	}
}

let transporter;
checkMailerConfig();

Mailer.sendEmail = async (templateName, to, data, attachments) => {
	const template = templates[templateName];
	const templateHtml = template.html(data);

	const mailOptions = {
		from: config.mail.sender,
		to,
		subject: template.subject(data),
		html: baseTemplate.html({ ...data, emailContent: templateHtml }),
	};

	if (attachments) {
		mailOptions.attachments = attachments;
	}

	try {
		await transporter.sendMail(mailOptions);
	} catch (err) {
		logger.logDebug(`Email error - ${err.message}`);
		throw err;		
	}
};

module.exports = Mailer;
