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

const Yup = require('yup');
const { generateTemplateFn } = require('./common');

const TEMPLATE_PATH = `${__dirname}/html/errorNotification.html`;

const dataSchema = Yup.object({
	eventName: Yup.string().required(),
	listenerName: Yup.string().required(),
	component: Yup.string().required(),
	payload: Yup.mixed(),
	error: Yup.object({
		message: Yup.string(),
		stack: Yup.string(),
		code: Yup.string(),
		status: Yup.number(),
	}).required(),
}).transform((values) => {
	const { eventName, listenerName, component, payload, error } = values;

	return {
		title: `Event listener failure: ${eventName}`,
		scope: 'eventsListener',
		message: [
			`Event: ${eventName}`,
			`Listener: ${component}.${listenerName}`,
			`Error: ${error.message || 'Unknown error'}`,
			`Code: ${error.code || 'N/A'}`,
			payload ? `Payload: ${JSON.stringify(payload)}` : '',
		].filter(Boolean).join('\n'),
		err: {
			message: error.message || 'No error message available',
			stack: error.stack || 'No stack trace provided',
		},
	};
}).required(true);

const ListenerErrorNotification = {};
ListenerErrorNotification.subject = () => 'Event listener failure';

ListenerErrorNotification.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

module.exports = ListenerErrorNotification;
