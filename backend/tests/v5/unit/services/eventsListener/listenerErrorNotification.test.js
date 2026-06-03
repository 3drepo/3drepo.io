/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup } = require('../../../helper/utils');
const { src } = require('../../../helper/path');
const { generateRandomString } = require('../../../helper/services');
const { templates } = require('../../../../../src/v5/utils/responseCodes');

jest.mock('../../../../../src/v5/services/mailer');
jest.mock('../../../../../src/v5/utils/logger', () => ({
	labels: {
		event: 'EVENT',
	},
	logWithLabel: () => ({
		logError: jest.fn(),
		logDebug: jest.fn(),
	}),
	logger: {
		logDebug: jest.fn(),
		logError: jest.fn(),
	},
}));

const Mailer = require(`${src}/services/mailer`);
const { logger } = require(`${src}/utils/logger`);
const { templates: mailTemplates } = require(`${src}/services/mailer/mailer.constants`);

const {
	notifyListenerFailure,
	shouldSuppressListenerError,
	serialisePayload,
} = require(`${src}/services/eventsListener/components/listenerErrorNotification`);

describe(determineTestGroup(__filename), () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('shouldSuppressListenerError', () => {
		test('Should suppress not-found model race conditions', () => {
			expect(shouldSuppressListenerError(templates.modelNotFound)).toEqual(true);
			expect(shouldSuppressListenerError({ message: 'Container deleted while queue was processing' })).toEqual(true);
		});

		test('Should suppress on 404 model missing context', () => {
			expect(shouldSuppressListenerError({ status: 404, message: 'Model not found in project' })).toEqual(true);
		});

		test('Should suppress when code is provided through errorCode', () => {
			expect(shouldSuppressListenerError({ errorCode: templates.projectNotFound.code })).toEqual(true);
		});

		test('Should suppress when code comes from errorReason', () => {
			expect(shouldSuppressListenerError({
				errorReason: { errorCode: templates.revisionNotFound.code },
			})).toEqual(true);
		});

		test('Should not suppress unrelated errors', () => {
			expect(shouldSuppressListenerError(templates.userNotFound)).toEqual(false);
			expect(shouldSuppressListenerError(new Error(generateRandomString()))).toEqual(false);
		});

		test('Should not suppress empty or undefined error', () => {
			expect(shouldSuppressListenerError()).toEqual(false);
			expect(shouldSuppressListenerError(null)).toEqual(false);
		});

		test('Should not suppress unrelated 404 messages', () => {
			expect(shouldSuppressListenerError({ statusCode: 404, message: 'User not found in teamspace' })).toEqual(false);
		});
	});

	describe('serialisePayload', () => {
		test('Should redact sensitive payload values and truncate oversized output', () => {
			const payload = {
				password: generateRandomString(),
				nested: {
					token: generateRandomString(),
					authorization: generateRandomString(),
					normal: generateRandomString(),
				},
				list: new Array(100).fill(generateRandomString()),
			};

			const serialised = serialisePayload(payload);
			expect(serialised).toContain('[REDACTED]');
			expect(serialised).not.toContain(payload.password);
			expect(serialised).not.toContain(payload.nested.token);
			expect(serialised.length).toBeLessThanOrEqual(4015);
		});

		test('Should serialise circular payloads safely', () => {
			const payload = { a: generateRandomString() };
			payload.self = payload;

			const serialised = serialisePayload(payload);
			expect(serialised).toContain('[Circular]');
		});

		test('Should limit payload depth and support date/function/buffer values', () => {
			const payload = {
				date: new Date('2024-01-01T00:00:00.000Z'),
				fn: () => true,
				buffer: Buffer.from('abc'),
				nested: {
					level2: {
						level3: {
							level4: {
								level5: 'too-deep',
							},
						},
					},
				},
			};

			const serialised = serialisePayload(payload);
			expect(serialised).toContain('[Function]');
			expect(serialised).toContain('[Buffer length=3]');
			expect(serialised).toContain('[Max depth reached]');
			expect(serialised).toContain('2024-01-01T00:00:00.000Z');
		});

		test('Should return serialisation error when payload contains bigint', () => {
			const serialised = serialisePayload({ value: BigInt(10) });
			expect(serialised).toContain('Failed to serialise payload:');
		});
	});

	describe('notifyListenerFailure', () => {
		test('Should send ERROR_NOTIFICATION when error is unexpected', async () => {
			const err = new Error(generateRandomString());
			await notifyListenerFailure({
				eventName: 'NEW_EVENT',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { message: generateRandomString() },
				error: err,
			});

			expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
				mailTemplates.ERROR_NOTIFICATION.name,
				expect.objectContaining({
					title: 'Event listener failure: NEW_EVENT',
					scope: 'eventsListener',
				}),
			);
		});

		test('Should include fallback stack text when error has no stack', async () => {
			await notifyListenerFailure({
				eventName: 'NO_STACK_EVENT',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { message: generateRandomString() },
				error: generateRandomString(),
			});

			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
				mailTemplates.ERROR_NOTIFICATION.name,
				expect.objectContaining({
					err: expect.objectContaining({
						stack: 'No stack trace provided',
					}),
				}),
			);
		});

		test('Should normalise code and status from response error shape', async () => {
			await notifyListenerFailure({
				eventName: 'RESPONSE_ERROR',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { value: generateRandomString() },
				error: {
					response: {
						status: 503,
						data: {
							code: 'UPSTREAM_DOWN',
						},
					},
					reason: 'Temporary outage',
				},
			});

			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
				mailTemplates.ERROR_NOTIFICATION.name,
				expect.objectContaining({
					message: expect.stringContaining('Error code: UPSTREAM_DOWN'),
				}),
			);
			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
				mailTemplates.ERROR_NOTIFICATION.name,
				expect.objectContaining({
					message: expect.stringContaining('Error status: 503'),
				}),
			);
		});

		test('Should truncate long error messages and stacks', async () => {
			const longMessage = 'm'.repeat(1200);
			const longStack = 's'.repeat(7000);

			await notifyListenerFailure({
				eventName: 'LONG_ERROR',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { value: generateRandomString() },
				error: { message: longMessage, stack: longStack },
			});

			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
				mailTemplates.ERROR_NOTIFICATION.name,
				expect.objectContaining({
					err: expect.objectContaining({
						message: expect.stringContaining('...(truncated)'),
						stack: expect.stringContaining('...(truncated)'),
					}),
				}),
			);
		});

		test('Should not send ERROR_NOTIFICATION for suppressed errors', async () => {
			await notifyListenerFailure({
				eventName: 'NEW_EVENT',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { message: generateRandomString() },
				error: templates.projectNotFound,
			});

			expect(Mailer.sendSystemEmail).not.toHaveBeenCalled();
		});

		test('Should use fallback message when error has no recognisable message fields', async () => {
			await notifyListenerFailure({
				eventName: 'UNKNOWN_ERR',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { message: generateRandomString() },
				error: { foo: 'bar' },
			});

			expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
				mailTemplates.ERROR_NOTIFICATION.name,
				expect.objectContaining({
					err: expect.objectContaining({
						message: 'No error message available',
					}),
				}),
			);
		});

		test('Should not throw if sending notification fails', async () => {
			Mailer.sendSystemEmail.mockRejectedValueOnce(new Error(generateRandomString()));
			await expect(notifyListenerFailure({
				eventName: 'NEW_EVENT',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { message: generateRandomString() },
				error: new Error(generateRandomString()),
			})).resolves.toBeUndefined();
		});

		test('Should log notify error stack if provided', async () => {
			const notifyErr = {
				message: generateRandomString(),
				stack: generateRandomString(),
			};

			Mailer.sendSystemEmail.mockRejectedValueOnce(notifyErr);

			await expect(notifyListenerFailure({
				eventName: 'NEW_EVENT',
				listenerName: 'listenerFn',
				component: 'modelEvents',
				payload: { message: generateRandomString() },
				error: new Error(generateRandomString()),
			})).resolves.toBeUndefined();

			expect(logger.logError).toHaveBeenCalledTimes(2);
			expect(logger.logError).toHaveBeenNthCalledWith(2, notifyErr.stack);
		});
	});
});
