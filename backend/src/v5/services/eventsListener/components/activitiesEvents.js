/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const { addActivity } = require('../../../models/activities');
const { events } = require('../../eventsManager/eventsManager.constants');
const { logger } = require('../../../utils/logger');
const { subscribe } = require('../../eventsManager/eventsManager');

const actions = {
	USER_ADDED: 'USER_ADDED',
	USER_REMOVED: 'USER_REMOVED',
	PERMISSIONS_UPDATED: 'PERMISSIONS_UPDATED',
	INVITATION_ADDED: 'INVITATION_ADDED',
	INVITATION_REVOKED: 'INVITATION_REVOKED',
};

const userAdded = async ({ teamspace, data }) => {
	try {
		await addActivity(teamspace, actions.USER_ADDED, data);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.USER_ADDED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const userRemoved = async ({ teamspace, data }) => {
	try {
		await addActivity(teamspace, actions.USER_REMOVED, data);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.USER_REMOVED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const permissionsUpdated = async ({ teamspace, data }) => {
	try {
		await addActivity(teamspace, actions.PERMISSIONS_UPDATED, data);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.PERMISSIONS_UPDATED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const invitationAdded = async ({ teamspace, data }) => {
	try {
		await addActivity(teamspace, actions.INVITATION_ADDED, data);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.INVITATION_ADDED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const invitationRevoked = async ({ teamspace, data }) => {
	try {
		await addActivity(teamspace, actions.INVITATION_REVOKED, data);
	} catch (err) {
		logger.logError(`Failed to add a ${actions.INVITATION_REVOKED} activity`);
		if (err.stack) {
			logger.logError(err.stack);
		}
	}
};

const ActivitiesEventsListener = {};

ActivitiesEventsListener.init = () => {
	subscribe(events.USER_ADDED, userAdded);
	subscribe(events.USER_REMOVED, userRemoved);
	subscribe(events.PERMISSIONS_UPDATED, permissionsUpdated);
	subscribe(events.INVITATION_ADDED, invitationAdded);
	subscribe(events.INVITATION_REVOKED, invitationRevoked);
};

module.exports = ActivitiesEventsListener;
