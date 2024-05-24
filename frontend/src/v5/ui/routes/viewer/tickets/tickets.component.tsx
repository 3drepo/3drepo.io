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

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import {
	enableRealtimeContainerNewTicket,
	enableRealtimeContainerUpdateTicket,
	enableRealtimeContainerUpdateTicketGroup,
	enableRealtimeFederationNewTicket,
	enableRealtimeFederationUpdateTicket,
	enableRealtimeFederationUpdateTicketGroup,
} from '@/v5/services/realtime/ticket.events';
import { ContainersHooksSelectors, FederationsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers, UsersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsCardViews } from './tickets.constants';
import { TicketsListCard } from './ticketsList/ticketsListCard.component';
import { TicketDetailsCard } from './ticketDetailsCard/ticketsDetailsCard.component';
import { NewTicketCard } from './newTicket/newTicket.component';
import { ViewerParams } from '../../routes.constants';
import { TicketContextComponent } from './ticket.context';

export const Tickets = () => {
	const { teamspace, project, containerOrFederation, revision } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const view = TicketsCardHooksSelectors.selectView();

	const readOnly = isFederation
		? !FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: !ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);
	TicketsCardActionsDispatchers.setReadOnly(readOnly);

	useEffect(() => {
		UsersActionsDispatchers.fetchUsers(teamspace);
		TicketsActionsDispatchers.fetchRiskCategories(teamspace);
	}, []);

	useEffect(() => {
		if (isFederation) {
			return combineSubscriptions(
				enableRealtimeFederationNewTicket(teamspace, project, containerOrFederation, revision),
				enableRealtimeFederationUpdateTicket(teamspace, project, containerOrFederation, revision),
				enableRealtimeFederationUpdateTicketGroup(teamspace, project, containerOrFederation),
			);
		}
		return combineSubscriptions(
			enableRealtimeContainerNewTicket(teamspace, project, containerOrFederation, revision),
			enableRealtimeContainerUpdateTicket(teamspace, project, containerOrFederation, revision),
			enableRealtimeContainerUpdateTicketGroup(teamspace, project, containerOrFederation, revision),
		);
	}, [containerOrFederation, revision]);

	useEffect(() => () => {
		if (view === TicketsCardViews.New) {
			TicketsCardActionsDispatchers.setUnsavedTicket(null);
		}
	}, [view]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setUnsavedTicket(null);
	}, [containerOrFederation]);

	return (
		<TicketContextComponent isViewer containerOrFederation={containerOrFederation}>
			{view === TicketsCardViews.List && <TicketsListCard />}
			{view === TicketsCardViews.Details && <TicketDetailsCard />}
			{view === TicketsCardViews.New && <NewTicketCard />}
		</TicketContextComponent>
	);
};
