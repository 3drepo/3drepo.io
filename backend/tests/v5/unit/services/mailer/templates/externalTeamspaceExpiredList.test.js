const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const ExternalTeamspaceExpiredList = require(`${src}/services/mailer/templates/externalTeamspaceExpiredList`);

const testHtml = () => {
	describe('get externalTeamspaceExpiredList template html', () => {
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
					await expect(ExternalTeamspaceExpiredList.html(data)).rejects.toThrow();
				});
			},
		);

		test('should get externalTeamspaceExpiredList template html', async () => {
			const res = await ExternalTeamspaceExpiredList.html(standardData);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe('Email subject', () => {
		test('Should return the subject title as expected', () => {
			const name = generateRandomString();
			expect(ExternalTeamspaceExpiredList.subject({ name })).toEqual(`Your teamspace ${name} has expired`);
		});
	});
};

describe('services/mailer/templates/externalTeamspaceExpiredList', () => {
	testHtml();
	testSubject();
});
