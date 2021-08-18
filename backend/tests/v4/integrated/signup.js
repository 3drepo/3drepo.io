/**
 *  Copyright (C) 2021 3D Repo Ltd
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

'use strict';

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

const { expect } = require('chai');
const app = require('../../../src/v4/services/api.js').createApp();

const request = require('supertest');
const C = require('../../../src/v4/constants');
const responseCodes = require('../../../src/v4/response_codes.js');

describe('Sign up', () => {
	let server;

	before((done) => {
		server = app.listen(8080, () => {
			console.log('API test server is listening on port 8080!');
			done();
		});
	});

	after((done) => {
		server.close(() => {
			console.log('API test server is closed');
			done();
		});
	});

	const username = 'signup_helloworld';
	const uppercase_username = 'Signup_helloworld';
	const password = 'Str0ngPassword!';
	const email = 'test3drepo_signup@mailinator.com';
	const firstName = 'Hello';
	const lastName = 'World';
	const countryCode = 'GB';
	const company = 'company';
	// const jobTitle = "someJobTitle";
	// const industry = "Architecture";
	// const howDidYouFindUs = "Facebook";
	// const phoneNumber = "0123456789";

	const mailListAgreed = true;

	const usernameNoSpam = 'signup_nospam';
	const emailNoSpam = 'test3drepo_signup_nospam@mailinator.com';
	const noMailListAgreed = false;

	const User = require('../../../src/v4/models/user');

	it('with available username should return success', async () => {
		const { body } = await request(server)
			.post(`/${username}`)
			.send({

				email,
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(200);

		expect(body.account).to.equal(username);
	});

	it('with short password should fail', async () => {
		const { body } = await request(server)
			.post(`/${username}`)
			.send({

				email,
				password: 'Sh0rt!',
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400);

		expect(body.value).to.equal(responseCodes.PASSWORD_TOO_SHORT.value);
	});

	it('with weak password should fail', async () => {
		const { body } = await request(server)
			.post(`/${username}`)
			.send({

				email,
				password: 'password',
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400);

		expect(body.value).to.equal(responseCodes.PASSWORD_TOO_WEAK.value);
	});

	it('with same username but different case should fail', async () => {
		const { body } = await request(server)
			.post(`/${uppercase_username}`)
			.send({

				email: 'test3drepo2_signup@mailinator.com',
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400);

		expect(body.value).to.equal(responseCodes.USER_EXISTS.value);
	});

	it('with mailing list opt-out selected should return success', async () => {
		const { body } = await request(server)
			.post(`/${usernameNoSpam}`)
			.send({

				email: emailNoSpam,
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed: noMailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(200);

		expect(body.account).to.equal(usernameNoSpam);
	});

	it('should have user created in database after sign up', async () => {
		const user = await User.findByUserName(username);

		expect(user).to.not.be.null;
		expect(user.user).to.equal(username);
		expect(user.customData.billing.billingInfo.firstName).to.equal(firstName);
		expect(user.customData.billing.billingInfo.lastName).to.equal(lastName);
		expect(user.customData.billing.billingInfo.countryCode).to.equal(countryCode);
		expect(user.customData.billing.billingInfo.company).to.equal(company);
		expect(user.customData.mailListOptOut).to.be.undefined;
		// expect(user.customData.extras.jobTitle).to.equal(jobTitle);
		// expect(user.customData.extras.industry).to.equal(industry);
		// expect(user.customData.extras.howDidYouFindUs).to.equal(howDidYouFindUs);
		// expect(user.customData.extras.phoneNumber).to.equal(phoneNumber);
	});

	it('with mailing list opt-out should have flag set', async () => {
		const user = await User.findByUserName(usernameNoSpam);

		expect(user).to.not.be.null;
		expect(user.user).to.equal(usernameNoSpam);
		expect(user.customData.billing.billingInfo.firstName).to.equal(firstName);
		expect(user.customData.billing.billingInfo.lastName).to.equal(lastName);
		expect(user.customData.billing.billingInfo.countryCode).to.equal(countryCode);
		expect(user.customData.billing.billingInfo.company).to.equal(company);
		expect(user.customData.mailListOptOut).to.equal(true);
		// expect(user.customData.extras.jobTitle).to.equal(jobTitle);
		// expect(user.customData.extras.industry).to.equal(industry);
		// expect(user.customData.extras.howDidYouFindUs).to.equal(howDidYouFindUs);
		// expect(user.customData.extras.phoneNumber).to.equal(phoneNumber);
	});

	it('with username that already exists should fail', async () => {
		const { body } = await request(server)
			.post(`/${username}`)
			.send({
				email: 'test3drepo3_signup@mailinator.com',
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400);

		expect(body.value).to.equal(responseCodes.USER_EXISTS.value);
	});

	C.REPO_BLACKLIST_USERNAME.forEach((username) => {
		it(`with blacklisted username - ${username} should fail`, async () => {
			// POST /contact is another API so skip checking
			if (username === 'contact') {
				return;
			}

			request(server)
				.post(`/${username}`)
				.send({

					email,
					password,
					firstName,
					lastName,
					countryCode,
					company,
					mailListAgreed,
					// "jobTitle": jobTitle,
					// "industry": industry,
					// "howDidYouFindUs": howDidYouFindUs,
					// "phoneNumber": phoneNumber

				}).expect(400);
		});
	});

	it('with invalid email address - abc@b should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email: 'abc@b',
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.EMAIL_INVALID.value);
				done(err);
			});
	});

	it('with invalid email address - abc should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email: 'abc',
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.EMAIL_INVALID.value);
				done(err);
			});
	});

	it('without email should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email: '',
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.EMAIL_INVALID.value);
				done(err);
			});
	});

	it('without password should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password: '',
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.SIGN_UP_PASSWORD_MISSING.value);
				done(err);
			});
	});

	it('non string password should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password: true,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('without firstname should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('non string first name should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({
				email,
				password,
				firstName: true,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber
			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('without lastname should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password,
				firstName,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('non string last name should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({
				email,
				password,
				firstName,
				lastName: true,
				countryCode,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber
			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('without country code should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password,
				firstName,
				lastName,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('non string countryCode should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({
				email,
				password,
				firstName,
				lastName,
				countryCode: 44,
				company,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber
			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('without company name should pass', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password,
				firstName,
				lastName,
				countryCode,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber

			}).expect(200, (err, res) => {
				done();
			});
	});

	it('non string company name should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({
				email,
				password,
				firstName,
				lastName,
				countryCode,
				company: 123,
				mailListAgreed,
				// "jobTitle": jobTitle,
				// "industry": industry,
				// "howDidYouFindUs": howDidYouFindUs,
				// "phoneNumber": phoneNumber
			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});
	/*
	it('without jobTitle should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				industry,
				howDidYouFindUs,
				phoneNumber,

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('without industry should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				jobTitle,
				howDidYouFindUs,
				phoneNumber,

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});

	it('without howDidYouFindUs should fail', (done) => {
		request(server)
			.post('/signup_somebaduser')
			.send({

				email,
				password,
				firstName,
				lastName,
				countryCode,
				company,
				mailListAgreed,
				jobTitle,
				industry,
				phoneNumber,

			}).expect(400, (err, res) => {
				expect(res.body.value).to.equal(responseCodes.INVALID_ARGUMENTS.value);
				done(err);
			});
	});
*/
});
