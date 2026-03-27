const { src } = require('../../../../helper/path');

const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const InternalTeamspaceExpiryList = require(`${src}/services/mailer/templates/internalTeamspaceExpiryList`);

const testHtml = () => {
	describe('get internalTeamspaceExpiryList template html', () => {
		const standardData = {
			teamspaces: [{
				name: generateRandomString(),
				expiryDate: new Date(),
			}],
		};
		describe.each([
			['data is undefined', undefined],
			['teamspaces is empty', { teamspaces: [] }],
		])(
			'Error checking ', (desc, data) => {
				test(`should throw an error if ${desc}`, async () => {
					await expect(InternalTeamspaceExpiryList.html(data)).rejects.toThrow();
				});
			},
		);

		test('should get internalTeamspaceExpiryList template html', async () => {
			const res = await InternalTeamspaceExpiryList.html(standardData);
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe('Email subject', () => {
		test('Should return the subject title as expected', () => {
			expect(InternalTeamspaceExpiryList.subject()).toEqual('Teamspaces with upcoming expiry');
		});
	});
};

describe('services/mailer/templates/internalTeamspaceExpiryList', () => {
	testHtml();
	testSubject();
});
