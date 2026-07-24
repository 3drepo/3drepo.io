const { determineTestGroup } = require('../../../../helper/utils');
const { src } = require('../../../../helper/path');
const { generateRandomString } = require('../../../../helper/services');
const isHtml = require('is-html-content');

const ListenerErrorNotification = require(`${src}/services/mailer/templates/listenerErrorNotification`);

const testHtml = () => {
	describe('get template html', () => {
		test('should get listenerErrorNotification template html', async () => {
			const res = await ListenerErrorNotification.html({
				eventName: generateRandomString(),
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
				error: new Error(generateRandomString()),
			});
			expect(isHtml(res)).toEqual(true);
		});

		test('should get listenerErrorNotification template html if payload is undefined', async () => {
			const res = await ListenerErrorNotification.html({
				eventName: generateRandomString(),
				listenerName: generateRandomString(),
				component: generateRandomString(),
				error: new Error(generateRandomString()),
			});
			expect(isHtml(res)).toEqual(true);
		});

		test('should get listenerErrorNotification template html if error object is just a string', async () => {
			const res = await ListenerErrorNotification.html({
				eventName: generateRandomString(),
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
				error: generateRandomString(),
			});
			expect(isHtml(res)).toEqual(true);
		});

		test('should get listenerErrorNotification template html if error object is null', async () => {
			const res = await ListenerErrorNotification.html({
				eventName: generateRandomString(),
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
				error: null,
			});
			expect(isHtml(res)).toEqual(true);
		});

		test('should get listenerErrorNotification template html if payload object is not an object', async () => {
			const res = await ListenerErrorNotification.html({
				eventName: generateRandomString(),
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: generateRandomString(),
				error: generateRandomString(),
			});
			expect(isHtml(res)).toEqual(true);
		});

		test('should get listenerErrorNotification template html if error object is undefined', async () => {
			const res = await ListenerErrorNotification.html({
				eventName: generateRandomString(),
				listenerName: generateRandomString(),
				component: generateRandomString(),
				payload: { data: generateRandomString() },
			});
			expect(isHtml(res)).toEqual(true);
		});
	});
};

const testSubject = () => {
	describe.each([
		['data object is empty', {}],
		['data object is not empty', { eventName: generateRandomString(), listenerName: generateRandomString(), component: generateRandomString() }],
	])('get subject', (desc, data) => {
		test(`should succeed if ${desc}`, () => {
			expect(ListenerErrorNotification.subject(data).length).not.toEqual(0);
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testHtml();
	testSubject();
});
