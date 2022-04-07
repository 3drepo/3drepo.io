

const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const config = require(`${src}/utils/config`);
const { templates } = require(`${src}/utils/responseCodes`);
const { FORGOT_PASSWORD } = require(`${src}/services/mailer/templateNames`);


const Mailer = require(`${src}/services/mailer/mailer`);

const testSendEmail = () => {
	describe('send email', () => {
        const recipient = 'example@email.com';
        const data = {};

		test('should fail if config.mail.sender is not set', async () => {
			await Mailer.sendEmail(FORGOT_PASSWORD, recipient, data);
		});		
	});
};

describe('services/mailer/mailer', () => {
	testSendEmail();
});
