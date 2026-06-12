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

const { templates: emailTemplates } = require('../mailer/mailer.constants');
const { logger } = require('../../utils/logger');
const { sendSystemEmail } = require('../mailer');

const MAX_DEPTH = 4;
const MAX_ARRAY_LENGTH = 20;
const MAX_OBJECT_KEYS = 40;
const REDACTED_KEYS = [
	'password',
	'token',
	'authorization',
	'cookie',
	'session',
	'apikey',
	'secret',
];
const ENTITY_PATTERN = /(model|container|project|revision|drawing|federation|clash)/i;
const MISSING_PATTERN = /(not found|deleted|does not exist|no longer exists)/i;

const ListenerFailureNotifier = {};

const normaliseError = (error) => {
	if (!error) {
		return {};
	}

	if (typeof error === 'string') {
		return { message: error };
	}

	const message = error.message || error.errorReason?.message || error.reason || error.msg;
	const { stack } = error;
	const code = error.code || error.errorCode || error.errorReason?.errorCode || error.response?.data?.code;
	const status = error.status || error.statusCode || error.response?.status;

	return {
		message,
		stack,
		code,
		status,
	};
};

const sanitise = (value, depth = 0, seen = new WeakSet()) => {
	if (value === null || value === undefined) {
		return value;
	}

	if (depth >= MAX_DEPTH) {
		return '[Max depth reached]';
	}

	if (Array.isArray(value)) {
		return value.slice(0, MAX_ARRAY_LENGTH).map((entry) => sanitise(entry, depth + 1, seen));
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
		const obj = {};
		entries.forEach(([key, entry]) => {
			if (REDACTED_KEYS.some((rKey) => key.toLowerCase().includes(rKey))) {
				obj[key] = '[REDACTED]';
			} else {
				obj[key] = sanitise(entry, depth + 1, seen);
			}
		});

		seen.delete(value);
		return obj;
	}

	if (typeof value === 'function') {
		return '[Function]';
	}

	return value;
};

const shouldSuppressListenerError = (error) => {
	const { status, message } = normaliseError(error);
	const safeMessage = `${message ?? ''}`;
	const hasMissingContext = ENTITY_PATTERN.test(safeMessage) && MISSING_PATTERN.test(safeMessage);

	return status === 404 || hasMissingContext;
};

ListenerFailureNotifier.notifyListenerFailure = async ({
	eventName,
	listenerName,
	component,
	payload,
	error,
}) => {
	try {
		if (shouldSuppressListenerError(error)) {
			logger.logDebug(`Suppressed listener error notification for ${eventName}.${listenerName}`);
			return;
		}

		const sanitisedPayload = sanitise(payload);
		const serialisedPayload = JSON.stringify(sanitisedPayload);
		const { message, stack, code, status } = normaliseError(error);
		const messageDetails = [
			`Event: ${eventName}`,
			`Listener: ${component}.${listenerName}`,
			`Error code: ${code ?? 'N/A'}`,
			`Error status: ${status ?? 'N/A'}`,
			`Payload: ${serialisedPayload}`,
		].join('\n');

		await sendSystemEmail(
			emailTemplates.ERROR_NOTIFICATION.name,
			{
				title: `Event listener failure: ${eventName}`,
				scope: 'eventsListener',
				message: messageDetails,
				err: {
					message: message || 'No error message available',
					stack: stack || 'No stack trace provided',
				},
			},
		);
	} catch (err) {
		logger.logError(`Failed to notify listener failure for ${eventName}.${listenerName}: ${err?.message}`);
		if (err?.stack) {
			logger.logError(err?.stack);
		}
	}
};

module.exports = ListenerFailureNotifier;
