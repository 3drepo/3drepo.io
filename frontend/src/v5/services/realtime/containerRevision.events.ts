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
/* eslint-disable implicit-arrow-linebreak */

import { IContainerRevision, IContainerRevisionUpdate } from '@/v5/store/containers/revisions/containerRevisions.types';
import { ContainersActionsDispatchers, ContainerRevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { subscribeToRoomEvent } from './realtime.service';
import { refreshContainerRevisionsCount } from '@/v5/store/containers/revisions/containerRevisions.sagas';

export const enableRealtimeContainerRevisionUpdate = (teamspace: string, project: string, containerId: string) =>
	subscribeToRoomEvent({ teamspace, project, model: containerId }, 'containerRevisionUpdate',
		(updatedStats: IContainerRevisionUpdate) => {
			ContainerRevisionsActionsDispatchers.updateRevisionSuccess(containerId, updatedStats);
			refreshContainerRevisionsCount(teamspace, project, containerId);
		},
	);

export const enableRealtimeNewContainerRevisionUpdate = (teamspace: string, project: string, containerId: string) =>
	subscribeToRoomEvent({ teamspace, project, model: containerId }, 'containerNewRevision',
		(revision: IContainerRevision) => {
			ContainersActionsDispatchers.containerProcessingSuccess(project, containerId, revision);
			ContainerRevisionsActionsDispatchers.revisionProcessingSuccess(containerId, revision);
		});
