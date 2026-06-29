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

jest.mock('../../../../../src/v5/services/mailer');
const Mailer = require(`${src}/services/mailer`);
const { templates: emailTemplates } = require(`${src}/services/mailer/mailer.constants`);

jest.mock('../../../../../src/v5/utils/logger', () => ({
	logger: {
		logError: jest.fn(),
		logDebug: jest.fn(),
	},
	logWithLabel: () => ({
		logError: jest.fn(),
		logDebug: jest.fn(),
		logInfo: jest.fn(),
		logTrace: jest.fn(),
		logWarning: jest.fn(),
		logFatal: jest.fn(),
	}),
	labels: {
		event: 'EVENT',
	},
}));
const { logger } = require(`${src}/utils/logger`);

const { templates: responseTemplates } = require(`${src}/utils/responseCodes`);
const ListenerErrorNotification = require(`${src}/services/eventsListener/listenerErrorNotification`);

const MAX_DEPTH = 4;
const MAX_ARRAY_LENGTH = 20;
const MAX_OBJECT_KEYS = 40;
const REDACTED_KEYS = ['password', 'token', 'authorization', 'cookie', 'session', 'apikey', 'secret'];
const ENTITY_PATTERN = /(model|container|project|revision|drawing|federation|clash)/i;
const MISSING_PATTERN = /(not found|deleted|does not exist|no longer exists)/i;

const normaliseErrorForExpected = (error) => {
	if (!error) {
		return {};
	}

	if (typeof error === 'string') {
		return { message: error };
	}

	return {
		message: error.message || error.errorReason?.message || error.reason || error.msg,
		stack: error.stack,
		code: error.code || error.errorCode || error.errorReason?.errorCode || error.response?.data?.code,
		status: error.status || error.statusCode || error.response?.status,
	};
};

const sanitiseForExpected = (value, depth = 0, seen = new WeakSet()) => {
	if (value === null || value === undefined) {
		return value;
	}

	if (depth >= MAX_DEPTH) {
		return '[Max depth reached]';
	}

	if (Array.isArray(value)) {
		return value.slice(0, MAX_ARRAY_LENGTH).map((entry) => sanitiseForExpected(entry, depth + 1, seen));
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (Buffer.isBuffer(value)) {
		return `[Buffer length=${value.length}]`;
	}

	if (typeof value === 'object') {
		if (seen.has(value)) {
			return '[Circular]';
		}

		seen.add(value);
		const entries = Object.entries(value).slice(0, MAX_OBJECT_KEYS);
		const output = {};
		entries.forEach(([key, entry]) => {
			if (REDACTED_KEYS.some((redactedKey) => key.toLowerCase().includes(redactedKey))) {
				output[key] = '[REDACTED]';
			} else {
				output[key] = sanitiseForExpected(entry, depth + 1, seen);
			}
		});
		seen.delete(value);

		return output;
	}

	if (typeof value === 'function') {
		return '[Function]';
	}

	return value;
};

const shouldSuppressForExpected = (error) => {
	const { status, message } = normaliseErrorForExpected(error);
	const safeMessage = `${message ?? ''}`;
	const hasMissingContext = ENTITY_PATTERN.test(safeMessage) && MISSING_PATTERN.test(safeMessage);

	return status === 404 || hasMissingContext;
};

const formatter = ({ eventName, listenerName, component, payload, error }) => {
	const sanitisedPayload = sanitiseForExpected(payload);
	const serialisedPayload = JSON.stringify(sanitisedPayload);
	const { message, stack, code, status } = normaliseErrorForExpected(error);

	return {
		title: `Event listener failure: ${eventName}`,
		scope: 'eventsListener',
		message: [
			`Event: ${eventName}`,
			`Listener: ${component}.${listenerName}`,
			`Error code: ${code ?? 'N/A'}`,
			`Error status: ${status ?? 'N/A'}`,
			`Payload: ${serialisedPayload}`,
		].join('\n'),
		err: {
			message: message || 'No error message available',
			stack: stack || 'No stack trace provided',
		},
	};
};

const testNotifyListenerFailure = () => {
	describe('notifyListenerFailure', () => {
		const eventName = 'MODEL_IMPORT_FINISHED';
		const listenerName = 'onModelImportFinished';
		const component = 'modelEvents';

		const generateTests = () => {
			const initialError = new Error(generateRandomString());
			const extractedMessage = generateRandomString();
			const extractedCode = generateRandomString();
			const dateValue = new Date('2026-01-01T00:00:00.000Z');
			const circular = { name: 'root' };
			circular.self = circular;
			const manyKeys = {};
			Array.from({ length: 45 }, (_, i) => i).forEach((idx) => {
				manyKeys[`key${idx}`] = idx;
			});

			return [
				[
					'receiving an error with event and listener details',
					{ payload: { key: generateRandomString() }, error: initialError },
					true,
					false,
					false,
				],
				[
					'the error is a string value',
					{ payload: {}, error: generateRandomString() },
					true,
					false,
					false,
				],
				[
					'the error has nested error structures',
					{
						payload: {},
						error: {
							errorReason: { message: extractedMessage, errorCode: extractedCode },
							response: { status: 503, data: { code: 'IGNORED_CODE' } },
						},
					},
					true,
					false,
					false,
				],
				[
					'the error object is missing message and stack',
					{ payload: {}, error: {} },
					true,
					false,
					false,
				],
				[
					'the error is undefined',
					{ payload: {}, error: undefined },
					true,
					false,
					false,
				],

				[
					'the payload contains sensitive fields',
					{
						payload: {
							password: 'super-secret',
							apiKey: 'api-key-value',
							authorizationHeader: 'Bearer token',
							cookieData: 'cookie-value',
							sessionId: 'session-value',
							secretThing: 'secret-value',
							nested: { token: 'nested-token' },
							createdAt: dateValue,
							buffer: Buffer.from('abcd'),
							fn: () => true,
							circular,
						},
						error: new Error('any error'),
					},
					true,
					false,
					false,
				],
				[
					'the payload exceeds structural limits',
					{
						payload: {
							deepObject: { a: { b: { c: { d: { e: 'too deep' } } } } },
							longArray: Array.from({ length: 25 }, (_, i) => i),
							manyKeys,
						},
						error: new Error('any error'),
					},
					true,
					false,
					false,
				],
				[
					'the payload is undefined',
					{ payload: undefined, error: new Error('any error') },
					true,
					false,
					false,
				],
				[
					'the mailer throws with a stack trace',
					{ payload: {}, error: new Error('source failure') },
					true,
					true,
					true,
				],
				[
					'the mailer throws without a stack trace',
					{ payload: {}, error: new Error('source failure') },
					true,
					true,
					false,
				],
				[
					'the error is a not-found response code',
					{ payload: {}, error: { code: responseTemplates.modelNotFound.code } },
					false,
					false,
					false,
				],
				[
					'the error is a clash not-found response code',
					{ payload: {}, error: { code: responseTemplates.clashRunNotFound.code } },
					false,
					false,
					false,
				],
				[
					'the error indicates a missing entity',
					{
						payload: {},
						error: {
							message: 'Model does not exist anymore',
							status: 404,
						},
					},
					false,
					false,
					false,
				],
			];
		};

		const runTests = (tests) => {
			describe.each(tests)('',
				(description, testInput, succeed, skipNotification, notificationErrorHasStack) => {
					test(`It should ${succeed ? 'succeed' : 'fail'} if ${description}`, async () => {
						if (skipNotification && notificationErrorHasStack) {
							const notificationError = new Error('failed to send');
							Mailer.sendSystemEmail.mockRejectedValueOnce(notificationError);
						} else if (skipNotification) {
							Mailer.sendSystemEmail.mockRejectedValueOnce({ message: 'mailer failed without stack' });
						}

						await expect(ListenerErrorNotification.notifyListenerFailure({
							eventName,
							listenerName,
							component,
							payload: testInput.payload,
							error: testInput.error,
						})).resolves.toBeUndefined();

						if (succeed && !skipNotification) {
							const expectedPayload = formatter({
								eventName,
								listenerName,
								component,
								payload: testInput.payload,
								error: testInput.error,
							});

							expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
							expect(Mailer.sendSystemEmail).toHaveBeenCalledWith(
								emailTemplates.ERROR_NOTIFICATION.name,
								expectedPayload,
							);
							expect(logger.logDebug).not.toHaveBeenCalled();
							expect(logger.logError).not.toHaveBeenCalled();
							return;
						}

						if (!succeed) {
							if (shouldSuppressForExpected(testInput.error)) {
								expect(Mailer.sendSystemEmail).not.toHaveBeenCalled();
								expect(logger.logDebug).toHaveBeenCalledTimes(1);
								expect(logger.logDebug).toHaveBeenCalledWith(
									`Suppressed listener error notification for ${eventName}.${listenerName}`,
								);
								expect(logger.logError).not.toHaveBeenCalled();
							}

							return;
						}

						if (skipNotification) {
							expect(Mailer.sendSystemEmail).toHaveBeenCalledTimes(1);
							if (notificationErrorHasStack) {
								expect(logger.logError).toHaveBeenCalledTimes(2);
								expect(logger.logError).toHaveBeenNthCalledWith(1,
									`Failed to notify listener failure for ${eventName}.${listenerName}: failed to send`);
								expect(logger.logError).toHaveBeenNthCalledWith(2, expect.stringContaining('Error: failed to send'));
							} else {
								expect(logger.logError).toHaveBeenCalledTimes(1);
								expect(logger.logError).toHaveBeenCalledWith(
									`Failed to notify listener failure for ${eventName}.${listenerName}: mailer failed without stack`,
								);
							}
						}
					});
				});
		};

		runTests(generateTests());
	});
};

describe(determineTestGroup(__filename), () => {
	testNotifyListenerFailure();
});
