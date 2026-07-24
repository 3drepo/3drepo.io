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
const { isObject } = require('../../../utils/helper/typeCheck');

const TEMPLATE_PATH = `${__dirname}/html/listenerErrorNotification.html`;

const dataSchema = Yup.object({
	eventName: Yup.string().default('Unknown event'),
	listenerName: Yup.string().default('unknownListener'),
	component: Yup.string().default('unknownComponent'),
	payload: Yup.string().transform((payload, orgVal) => (
		isObject(orgVal) ? JSON.stringify(orgVal) : JSON.stringify({ orgVal }))).default('{}'),
	error: Yup.object({
		message: Yup.string().default('Unknown error'),
		code: Yup.string().default('N/A'),
		stack: Yup.mixed().default('no stack trace provided'),
	}).transform((err, orgVal) => (isObject(orgVal)
		? { message: orgVal.message, stack: orgVal.stack } : { message: orgVal || undefined })),
}).required(true);

const ListenerErrorNotification = {};
ListenerErrorNotification.subject = () => 'Event Listener Failure ';

ListenerErrorNotification.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

module.exports = ListenerErrorNotification;
