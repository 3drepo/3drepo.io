/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeWatchPropertyUpdateTicket } from '@/v5/services/realtime/ticketTable.events';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { useSearchParam, Transformers } from '@/v5/ui/routes/useSearchParam';
import { useEffect } from 'react';
import { useParams } from 'react-router';

export const useWatchPropertyChange = (property, callback) => {
	const { teamspace, project } = useParams<DashboardTicketsParams>();
	const [containersAndFederations] = useSearchParam('models', Transformers.STRING_ARRAY, true);
	const isFed = FederationsHooksSelectors.selectIsFederation();

	useEffect(() => {
		const subscriptions = containersAndFederations.map((modelId) => 
			enableRealtimeWatchPropertyUpdateTicket(teamspace, project, modelId, isFed(modelId), property, callback));
		return combineSubscriptions(...subscriptions);
	}, [teamspace, project, containersAndFederations, isFed, property, callback]);
};
