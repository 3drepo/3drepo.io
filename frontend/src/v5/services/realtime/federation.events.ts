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

import { IFederation } from '@/v5/store/federations/federations.types';
import { FederationsActionsDispatchers } from '../actionsDispatchers/federationsActions.dispatchers';
import { subscribeToRoomEvent } from './realtime.service';

type FederationUpdatedPayload = Partial<IFederation>;

export const enableRealtimeFederationUpdates = (teamspace, project) =>
	subscribeToRoomEvent({ teamspace, project }, 'federationUpdate',
		(federation: FederationUpdatedPayload) =>
			FederationsActionsDispatchers.updateFederationSuccess(project, federation._id, federation));
