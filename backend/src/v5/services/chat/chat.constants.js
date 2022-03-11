/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { toConstantCase } = require('../../utils/helper/strings');

const ChatConstants = {};

const events = [
	'message',
	'error',
	'loggedOut',
	// message events
	'success',

	// Model events
	{ v5: 'modelStatusUpdate', v4: 'modelStatusChanged' },
];

const errors = [
	'unauthorised',
	'room not found',
];

const actions = [
	'leave',
	'join',
];

const createConstantsMapping = (data) => {
	const constants = {};
	data.forEach((value) => {
		const valueConstCase = toConstantCase(value);
		constants[valueConstCase] = valueConstCase;
	});
	return constants;
};

const createEventsMapping = (data) => {
	const constants = {};
	const v5ToV4 = {};
	data.forEach((value) => {
		const event = value.v5 || value;
		v5ToV4[event] = value.v4 || value;

		const eventConstCase = toConstantCase(event);
		constants[eventConstCase] = event;
	});

	ChatConstants.EVENTS = constants;
	ChatConstants.EVENTS_V5_TO_V4 = v5ToV4;
};

createEventsMapping(events, false);

ChatConstants.ERRORS = createConstantsMapping(errors);
ChatConstants.ACTIONS = createConstantsMapping(actions);

ChatConstants.SESSION_CHANNEL_PREFIX = 'sessions::';

module.exports = ChatConstants;
