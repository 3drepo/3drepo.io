/**
 *  Copyright (C) 2023 3D Repo Ltd
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
const BaseTemplate = require('../../../../../src/v5/services/mailer/templates/baseTemplate');
const SystemTemplate = require('../../../../../src/v5/services/mailer/templates/systemTemplate');

const config = require(`${src}/utils/config`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);
const { templates } = require(`${src}/utils/responseCodes`);

const sendMailMock = jest.fn();
jest.mock('nodemailer');
const nodemailer = require('nodemailer');

nodemailer.createTransport.mockImplementation(() => ({ sendMail: sendMailMock }));
nodemailer.createTestAccount.mockImplementation(() => ({ user: generateRandomString(), pass: generateRandomString() }));
const Mailer = require(`${src}/services/mailer`);

const testSendEmail = () => {
	describe('send email', () => {
		const recipient = 'example@email.com';
		const attachments = { attachment: generateRandomString() };
		const data = {
			firstName: generateRandomString(),
			err: new Error(generateRandomString()),
		};

		const mailerConfig = { ...config.mail };

		beforeEach(() => {
			config.mail = { ...mailerConfig };
		});

		test('should fail if config.mail.sender is not set', async () => {
			Mailer.reset();
			config.mail.sender = undefined;

			await expect(Mailer.sendEmail(emailTemplates.ERROR_NOTIFICATION.name, recipient, data, attachments))
				.rejects.toThrow('config.mail.sender is not set');
			Mailer.reset();
		});

		test('should fail if config.mail.smtpConfig is not set and config.mail.generateCredentials is false', async () => {
			Mailer.reset();
			config.mail.generateCredentials = false;
			delete config.mail.smtpConfig;
			await expect(Mailer.sendEmail(emailTemplates.ERROR_NOTIFICATION.name, recipient, data, attachments))
				.rejects.toThrow('config.mail.smtpConfig is not set');
			Mailer.reset();
		});

		test('should pass if config.mail.smtpConfig is not set and config.mail.generateCredentials is true', async () => {
			Mailer.reset();
			config.mail.generateCredentials = true;
			delete config.mail.smtpConfig;
			await Mailer.sendEmail(emailTemplates.ERROR_NOTIFICATION.name, recipient, data, attachments);
			expect(sendMailMock).toHaveBeenCalledTimes(1);
			expect(sendMailMock).toHaveBeenCalledWith({
				from: config.mail.sender,
				to: recipient,
				subject: emailTemplates.ERROR_NOTIFICATION.subject(),
				html: await BaseTemplate.html({
					...data,
					emailContent: await emailTemplates.ERROR_NOTIFICATION.html(data),
				}),
				attachments,
			});
			Mailer.reset();
		});

		test('should send email if attachments are provided', async () => {
			await Mailer.sendEmail(emailTemplates.ERROR_NOTIFICATION.name, recipient, data, attachments);
			expect(sendMailMock).toHaveBeenCalledTimes(1);
			expect(sendMailMock).toHaveBeenCalledWith({
				from: config.mail.sender,
				to: recipient,
				subject: emailTemplates.ERROR_NOTIFICATION.subject(),
				html: await BaseTemplate.html({
					...data,
					emailContent: await emailTemplates.ERROR_NOTIFICATION.html(data),
				}),
				attachments,
			});
		});

		test('should send email if attachments are not provided', async () => {
			await Mailer.sendEmail(emailTemplates.ERROR_NOTIFICATION.name, recipient, data);
			expect(sendMailMock).toHaveBeenCalledTimes(1);
			expect(sendMailMock).toHaveBeenCalledWith({
				from: config.mail.sender,
				to: recipient,
				subject: emailTemplates.ERROR_NOTIFICATION.subject(),
				html: await BaseTemplate.html({ ...data,
					emailContent: await emailTemplates.ERROR_NOTIFICATION.html(data) }),
			});
		});

		test('should log the error and throw it back if sendMail fails', async () => {
			sendMailMock.mockImplementationOnce(() => { throw templates.unknown; });

			await expect(Mailer.sendEmail(emailTemplates.ERROR_NOTIFICATION.name, recipient, data, attachments))
				.rejects.toEqual(templates.unknown);
		});

		test('should throw error if the template name is not recognised', async () => {
			await expect(Mailer.sendEmail(generateRandomString(), recipient, data, attachments))
				.rejects.toEqual(templates.unknown);
		});

		test('should throw error if the data does not provide sufficient info for the template', async () => {
			await expect(Mailer.sendEmail(emailTemplates.ERROR_NOTIFICATION.name, recipient, undefined, attachments))
				.rejects.toThrow();
		});
	});
};

const testSendSystemEmail = () => {
	describe('send system email', () => {
		const attachments = { attachment: generateRandomString() };
		const data = {
			username: generateRandomString(),
			token: generateRandomString(),
			firstName: generateRandomString(),
		};

		const mailerConfig = { ...config.mail };

		beforeEach(() => {
			Mailer.reset();
			config.mail = { ...mailerConfig };
		});
		test('should fail if config.mail.sender is not set', async () => {
			Mailer.reset();
			config.mail.sender = undefined;

			await expect(Mailer.sendSystemEmail(emailTemplates.ERROR_NOTIFICATION.name, data, attachments))
				.rejects.toThrow('config.mail.sender is not set');
			Mailer.reset();
		});

		test('should fail if config.mail.smtpConfig is not set and config.mail.generateCredentials is false', async () => {
			Mailer.reset();
			config.mail.generateCredentials = false;
			delete config.mail.smtpConfig;
			await expect(Mailer.sendSystemEmail(emailTemplates.ERROR_NOTIFICATION.name, data, attachments))
				.rejects.toThrow('config.mail.smtpConfig is not set');
			Mailer.reset();
		});

		test('should pass if config.mail.smtpConfig is not set and config.mail.generateCredentials is true', async () => {
			Mailer.reset();
			config.mail.generateCredentials = true;
			delete config.mail.smtpConfig;
			await Mailer.sendSystemEmail(emailTemplates.ERROR_NOTIFICATION.name, data, attachments);
			expect(sendMailMock).toHaveBeenCalledTimes(1);
			expect(sendMailMock).toHaveBeenCalledWith({
				from: config.mail.sender,
				to: config.contact.mail,
				subject: emailTemplates.ERROR_NOTIFICATION.subject(),
				html: await SystemTemplate.html({
					...data,
					emailContent: await emailTemplates.ERROR_NOTIFICATION.html(data),
				}),
				attachments,
			});
			Mailer.reset();
		});

		test('should send email if attachments are provided', async () => {
			await Mailer.sendSystemEmail(emailTemplates.ERROR_NOTIFICATION.name, data, attachments);
			expect(sendMailMock).toHaveBeenCalledTimes(1);
			expect(sendMailMock).toHaveBeenCalledWith({
				from: config.mail.sender,
				to: config.contact.mail,
				subject: emailTemplates.ERROR_NOTIFICATION.subject(),
				html: await SystemTemplate.html({
					...data,
					emailContent: await emailTemplates.ERROR_NOTIFICATION.html(data),
				}),
				attachments,
			});
		});

		test('should send email if attachments are not provided', async () => {
			await Mailer.sendSystemEmail(emailTemplates.ERROR_NOTIFICATION.name, data);
			expect(sendMailMock).toHaveBeenCalledTimes(1);
			expect(sendMailMock).toHaveBeenCalledWith({
				from: config.mail.sender,
				to: config.contact.mail,
				subject: emailTemplates.ERROR_NOTIFICATION.subject(),
				html: await SystemTemplate.html({ ...data,
					emailContent: await emailTemplates.ERROR_NOTIFICATION.html(data) }),
			});
		});

		test('should log the error and throw it back if sendSystemMail fails', async () => {
			sendMailMock.mockRejectedValueOnce(templates.unknown);

			await expect(Mailer.sendSystemEmail(emailTemplates.ERROR_NOTIFICATION.name, data, attachments))
				.rejects.toEqual(templates.unknown);
		});

		test('should throw error if the template name is not recognised', async () => {
			await expect(Mailer.sendSystemEmail(generateRandomString(), data, attachments))
				.rejects.toEqual(templates.unknown);
		});
		test('should throw error if the data does not provide sufficient info for the template', async () => {
			await expect(Mailer.sendSystemEmail(emailTemplates.MODEL_IMPORT_ERROR.name,
				{ }, attachments))
				.rejects.toThrow();
		});
	});
};

describe('services/mailer/index', () => {
	testSendEmail();
	testSendSystemEmail();
});
