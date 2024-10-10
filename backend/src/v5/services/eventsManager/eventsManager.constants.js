/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const EventManagerConst = {};

const eventList = [
	// Groups
	'NEW_GROUPS', 'UPDATE_GROUP',
	// Model settings
	'NEW_MODEL', 'DELETE_MODEL', 'MODEL_SETTINGS_UPDATE',
	// Model import (including federation and toy project)
	'MODEL_IMPORT_FINISHED',
	// Model Tickets
	'NEW_TICKET', 'UPDATE_TICKET', 'NEW_COMMENT', 'UPDATE_COMMENT', 'UPDATE_TICKET_GROUP',
	'TICKETS_IMPORTED',
	// Revisions
	'REVISION_UPDATED',
	// Queue specific
	'QUEUED_TASK_UPDATE', 'QUEUED_TASK_COMPLETED',
	// Socket IO events
	'CHAT_EVENT',
	// Authentication
	'FAILED_LOGIN_ATTEMPT', 'SUCCESSFUL_LOGIN_ATTEMPT', 'SESSION_CREATED', 'SESSIONS_REMOVED', 'ACCOUNT_LOCKED',
	// User related
	'USER_VERIFIED', 'USER_ADDED', 'USER_REMOVED', 'INVITATION_ADDED', 'INVITATION_REVOKED',
	'PERMISSIONS_UPDATED',
];

const generateEventsMap = () => {
	const res = {};
	eventList.forEach((event) => {
		res[event] = event;
	});

	return res;
};

EventManagerConst.events = generateEventsMap();

module.exports = EventManagerConst;
