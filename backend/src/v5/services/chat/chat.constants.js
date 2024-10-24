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
	'loggedIn',
	'loggedOut',
	// message events
	'success',

	// Container events
	'containerSettingsUpdate',
	'containerNewRevision',
	'containerRevisionUpdate',
	'newContainer',
	'containerRemoved',
	'containerNewTicket',
	'containerUpdateTicket',
	'containerNewTicketComment',
	'containerUpdateTicketComment',
	'containerUpdateTicketGroup',

	// Federation events
	'federationSettingsUpdate',
	'federationNewRevision',
	'newFederation',
	'federationRemoved',
	'federationNewTicket',
	'federationUpdateTicket',
	'federationNewTicketComment',
	'federationUpdateTicketComment',
	'federationUpdateTicketGroup',

	// Drawing events
	'newDrawing',
	'drawingRemoved',
	'drawingSettingsUpdate',
	'drawingNewRevision',
	'drawingRevisionUpdate',
];

const errors = [
	'unauthorised',
	'room not found',
];

const actions = [
	'leave',
	'join',
];

const createConstantsMapping = (data, convertCase = true) => {
	const constants = {};
	data.forEach((value) => {
		const valueConstCase = toConstantCase(value);
		constants[valueConstCase] = convertCase ? valueConstCase : value;
	});
	return constants;
};

ChatConstants.EVENTS = createConstantsMapping(events, false);
ChatConstants.ERRORS = createConstantsMapping(errors);
ChatConstants.ACTIONS = createConstantsMapping(actions);

ChatConstants.SESSION_CHANNEL_PREFIX = 'sessions::';

ChatConstants.SOCKET_HEADER = 'x-socket-id';

module.exports = ChatConstants;
