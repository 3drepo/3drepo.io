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

import { ContainerSettings, NewContainer } from '@/v5/store/containers/containers.types';
import { ContainersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { subscribeToRoomEvent } from './realtime.service';
import { prepareContainerSettingsForFrontend } from '@/v5/store/containers/containers.helpers';

export const enableRealtimeContainerUpdateSettings = (teamspace:string, project:string, containerId:string) =>
	subscribeToRoomEvent({ teamspace, project, model: containerId }, 'containerSettingsUpdate',
		(settings: ContainerSettings) =>
			ContainersActionsDispatchers.fetchContainerSettingsSuccess(project, containerId, prepareContainerSettingsForFrontend(settings)));

export const enableRealtimeNewContainer = (teamspace:string, project:string) =>
	subscribeToRoomEvent({ teamspace, project }, 'newContainer',
		(container: NewContainer) =>
			ContainersActionsDispatchers.createContainerSuccess(project, container));

export const enableRealtimeContainerRemoved = (teamspace:string, project:string, containerId:string) =>
	subscribeToRoomEvent({ teamspace, project, model: containerId }, 'containerRemoved',
		() => ContainersActionsDispatchers.deleteContainerSuccess(project, containerId));
