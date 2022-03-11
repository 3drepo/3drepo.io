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
const { UUIDToString } = require('../../../utils/helper/uuids');
const { events } = require('../../eventsManager/eventsManager.constants');
const { findProjectByModelId } = require('../../../models/projectSettings');
const { subscribe } = require('../../eventsManager/eventsManager');

const queueStatusUpdate = async ({
	teamspace, model, corId, status, user,
}) => {
	try {
		const { _id: projectId } = await findProjectByModelId(teamspace, model, { _id: 1 });
		updateModelStatus(teamspace, UUIDToString(projectId), model, status, corId, user);
	} catch (err) {
		// do nothing - the model may have been deleted before the task came back.
	}
};
const queueTasksCompleted = ({
	teamspace, model, value, corId, user, containers,
}) => newRevisionProcessed(teamspace, model, corId, value, user, containers);

const ModelEventsListener = {};

ModelEventsListener.init = () => {
	subscribe(events.QUEUED_TASK_UPDATE, queueStatusUpdate);
	subscribe(events.QUEUED_TASK_COMPLETED, queueTasksCompleted);
};

module.exports = ModelEventsListener;
