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

const { newRevisionProcessed, updateModelStatus } = require('../../../models/modelSettings');
const { events } = require('../../eventsManager/eventsManager.constants');
const { subscribe } = require('../../eventsManager/eventsManager');

const queueStatusUpdate = ({
	teamspace, model, corId, status, user,
}) => updateModelStatus(teamspace, model, status, corId, user);
const queueTasksCompleted = ({
	teamspace, model, value, corId, user,
}) => newRevisionProcessed(teamspace, model, corId, value, user);

const ModelEventsListener = {};

ModelEventsListener.init = () => {
	subscribe(events.QUEUED_TASK_UPDATE, queueStatusUpdate);
	subscribe(events.QUEUED_TASK_COMPLETED, queueTasksCompleted);
};

module.exports = ModelEventsListener;
