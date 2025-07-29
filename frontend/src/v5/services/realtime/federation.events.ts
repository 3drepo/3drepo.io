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

import { FederationRevision, FederationSettings, NewFederationRealtime } from '@/v5/store/federations/federations.types';
import { FederationsActionsDispatchers } from '../actionsDispatchers';
import { subscribeToRoomEvent } from './realtime.service';
import { prepareFederationSettingsForFrontend } from '@/v5/store/federations/federations.helpers';

export const enableRealtimeFederationUpdateSettings = (teamspace:string, project:string, federationId:string) =>
	subscribeToRoomEvent({ teamspace, project, model: federationId }, 'federationSettingsUpdate',
		(settings: FederationSettings) =>
			FederationsActionsDispatchers.fetchFederationSettingsSuccess(project, federationId, prepareFederationSettingsForFrontend(settings)));

export const enableRealtimeNewFederation = (teamspace:string, project:string) =>
	subscribeToRoomEvent({ teamspace, project }, 'newFederation',
		({ _id: federationId, ...newFederation }: NewFederationRealtime) =>
			FederationsActionsDispatchers.createFederationSuccess(project, newFederation, federationId));

export const enableRealtimeFederationRemoved = (teamspace:string, project:string, federationId:string) =>
	subscribeToRoomEvent({ teamspace, project, model: federationId }, 'federationRemoved',
		() =>
			FederationsActionsDispatchers.deleteFederationSuccess(project, federationId));

export const enableRealtimeFederationNewRevision = (teamspace:string, project:string, federationId:string) =>
	subscribeToRoomEvent({ teamspace, project, model: federationId }, 'federationNewRevision',
		(revision: FederationRevision) => {
			FederationsActionsDispatchers.updateFederationSuccess(project, federationId, { revision });
			FederationsActionsDispatchers.fetchFederationStats(teamspace, project, federationId);
		},
	);
