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

const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/services/mailer/mailer.constants`);

const Mailer = require(`${src}/services/mailer`);

const testSendEmail = () => {
	describe('send email', () => {
		const recipient = 'example@email.com';
		const attachments = { attachment: generateRandomString() };
		const data = {};

		test('should fail if config.mail.sender is not set', async () => {
			const { sender } = config.mail;
			config.mail.sender = undefined;
			await expect(Mailer.sendEmail(templates.FORGOT_PASSWORD.name, recipient, data, attachments))
				.rejects.toEqual({ message: 'config.mail.sender is not set' });
			config.mail.sender = sender;
		});

		test('should fail if config.mail.smtpConfig is not set and config.mail.generateCredentials is false', async () => {
			config.mail.generateCredentials = false;
			await expect(Mailer.sendEmail(templates.FORGOT_PASSWORD.name, recipient, data, attachments))
				.rejects.toEqual({ message: 'config.mail.smtpConfig is not set' });
			config.mail.generateCredentials = true;
		});

		test('should send email if attachments are provided', async () => {
			await Mailer.sendEmail(templates.FORGOT_PASSWORD.name, recipient, data, attachments);
		});

		test('should send email if attachments are not provided', async () => {
			await Mailer.sendEmail(templates.FORGOT_PASSWORD.name, recipient, data);
		});

		test('should send email if the subject of template is a function', async () => {
			await Mailer.sendEmail(templates.FILE_MISSING.name, recipient, data, attachments);
		});
	});
};

describe('services/mailer', () => {
	testSendEmail();
});
