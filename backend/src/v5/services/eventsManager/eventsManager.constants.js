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
	// Model settngs
	'NEW_MODEL', 'DELETE_MODEL',
	// Model import (including federation and toy project)
	'MODEL_IMPORT_UPDATE', 'MODEL_IMPORT_FINISHED',
	// Queue specific
	'QUEUED_TASK_UPDATE', 'QUEUED_TASK_COMPLETED',
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
