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

const { templates: emailTemplates } = require('../../mailer/mailer.constants');
const { events } = require('../../eventsManager/eventsManager.constants');
const { sendSystemEmail } = require('../../mailer');
const { subscribe } = require('../../eventsManager/eventsManager');
const { unpack: unpackInvitations } = require('../../../processors/teamspaces/invitations');

const userCreated = async (payload) => {
	const { username } = payload;
	try {
		await unpackInvitations(username);
	} catch (err) {
		if (err.status !== 404) {
			await sendSystemEmail(emailTemplates.LISTENER_ERROR_NOTIFICATION.name, {
				component: 'UserEventsListener',
				listenerName: 'userCreated',
				eventName: events.USER_CREATED,
				payload,
				error: { message: err.message, code: err.code, stack: err.stack },
			});
		}
	}
};

const UserEventsListener = {};

UserEventsListener.init = () => {
	subscribe(events.USER_CREATED, userCreated);
};

module.exports = UserEventsListener;
