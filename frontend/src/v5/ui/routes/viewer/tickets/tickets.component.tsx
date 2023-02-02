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
	enableRealtimeFederationNewTicket,
	enableRealtimeFederationUpdateTicket,
} from '@/v5/services/realtime/ticket.events';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers, UsersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsCardViews } from './tickets.constants';
import { TicketsListCard } from './ticketsList/ticketsListCard.component';
import { TicketDetailsCard } from './ticketDetails/ticketsDetailsCard.component';
import { NewTicketCard } from './newTicket/newTicket.component';
import { ViewerParams } from '../../routes.constants';

export const Tickets = () => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const view = TicketsCardHooksSelectors.selectView();

	useEffect(() => {
		UsersActionsDispatchers.fetchUsers(teamspace);
		TicketsActionsDispatchers.fetchRiskCategories(teamspace);
	}, []);

	useEffect(() => {
		if (isFederation) {
			combineSubscriptions(
				enableRealtimeFederationNewTicket(teamspace, project, containerOrFederation),
				enableRealtimeFederationUpdateTicket(teamspace, project, containerOrFederation),
			);
		} else {
			combineSubscriptions(
				enableRealtimeContainerNewTicket(teamspace, project, containerOrFederation),
				enableRealtimeContainerUpdateTicket(teamspace, project, containerOrFederation),
			);
		}
		if (view === TicketsCardViews.List) {
			TicketsActionsDispatchers.fetchTickets(
				teamspace,
				project,
				containerOrFederation,
				isFederation,
			);
			TicketsActionsDispatchers.fetchTemplates(
				teamspace,
				project,
				containerOrFederation,
				isFederation,
			);
		}
	}, [containerOrFederation]);

	return (
		<>
			{view === TicketsCardViews.List && <TicketsListCard />}
			{view === TicketsCardViews.Details && <TicketDetailsCard />}
			{view === TicketsCardViews.New && <NewTicketCard />}
		</>
	);
};
