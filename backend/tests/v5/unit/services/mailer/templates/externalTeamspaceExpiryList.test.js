const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const externalTeamspaceExpiryList = require(`${src}/services/mailer/templates/externalTeamspaceExpiryList`);

const testHtml = () => {
	describe('get externalTeamspaceExpiryList template html', () => {
		const standardData = {
			name: generateRandomString(),
			expiryDate: new Date(),
		};
		describe.each([
			['data is undefined', undefined],
			['teamspace_name is undefined', { ...standardData, name: undefined }],
		])(
			'Error checking ', (desc, data) => {
				test(`should throw an error if ${desc}`, async () => {
					await expect(externalTeamspaceExpiryList.html(data)).rejects.toThrow();
				});
			},
		);

		test('should get externalTeamspaceExpiryList template html', async () => {
			const res = await externalTeamspaceExpiryList.html(standardData);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe('Email subject', () => {
		test('Should return the subject title as expected', () => {
			const teamspace_name = generateRandomString();
			expect(externalTeamspaceExpiryList.subject({ teamspace_name })).toEqual(`Your teamspace ${teamspace_name} is about to expire`);
		});
	});
};

describe('services/mailer/templates/externalTeamspaceExpiryList', () => {
	testHtml();
	testSubject();
});
