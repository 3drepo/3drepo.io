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

const { EVENTS: chatEvents } = require('../../chat/chat.constants');
const { createProjectMessage } = require('../../chat');
const { events } = require('../../eventsManager/eventsManager.constants');
const { logger } = require('../../../utils/logger');
const { subscribe } = require('../../eventsManager/eventsManager');

const modelAdded = async ({ teamspace, project, model, data, isFederation }) => {
	try {
		const event = isFederation ? chatEvents.NEW_FEDERATION : chatEvents.NEW_CONTAINER;
		await createProjectMessage(event, { ...data, _id: model }, teamspace, project);
	} catch (err) {
		logger.logError(`Failed to send a project message to queue: ${err?.message}`);
	}
};

const ProjectEventsListener = {};

ProjectEventsListener.init = () => {
	subscribe(events.NEW_MODEL, modelAdded);
};

module.exports = ProjectEventsListener;
