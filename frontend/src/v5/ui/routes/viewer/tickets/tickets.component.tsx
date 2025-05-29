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
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';

import { ContainersHooksSelectors, FederationsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { JobsActionsDispatchers, ProjectsActionsDispatchers, TicketsActionsDispatchers, TicketsCardActionsDispatchers, UsersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TicketsCardViews } from './tickets.constants';
import { TicketsListCard } from './ticketsList/ticketsListCard.component';
import { TicketDetailsCard } from './ticketDetailsCard/ticketsDetailsCard.component';
import { NewTicketCard } from './newTicket/newTicket.component';
import { ViewerParams } from '../../routes.constants';
import { TicketContextComponent } from './ticket.context';
import { Viewer } from '@/v4/services/viewer/viewer';
import { uniq } from 'lodash';

export const Tickets = () => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const view = TicketsCardHooksSelectors.selectView();
	const newTicketPins = TicketsCardHooksSelectors.selectNewTicketPins();
	const filters = TicketsCardHooksSelectors.selectFilters();
	const tickets = TicketsCardHooksSelectors.selectCurrentTickets();
	const templateIdsInUse = uniq(tickets.map(({ type }) => type));

	const readOnly = isFederation
		? !FederationsHooksSelectors.selectHasCommenterAccess(containerOrFederation)
		: !ContainersHooksSelectors.selectHasCommenterAccess(containerOrFederation);

	useEffect(() => {
		TicketsCardActionsDispatchers.setReadOnly(readOnly);
		JobsActionsDispatchers.fetchJobs(teamspace);
		UsersActionsDispatchers.fetchUsers(teamspace);
		TicketsActionsDispatchers.fetchRiskCategories(teamspace);
		ProjectsActionsDispatchers.fetchTemplates(teamspace, project, true);
	}, []);

	useEffect(() => {
		if (view !== TicketsCardViews.New) {
			TicketsCardActionsDispatchers.setUnsavedTicket(null);
			newTicketPins.forEach(({ id }) => Viewer.removePin(id));
		}
	}, [view]);

	useEffect(() => {
		TicketsCardActionsDispatchers.fetchFilteredTickets(teamspace, project, [containerOrFederation]);
	}, [tickets, filters]);

	useEffect(() => {
		TicketsActionsDispatchers.setFilterableTemplatesIds(templateIdsInUse);
	}, [templateIdsInUse.length]);

	return (
		<TicketContextComponent isViewer containerOrFederation={containerOrFederation}>
			{view === TicketsCardViews.List && <TicketsListCard />}
			{view === TicketsCardViews.Details && <TicketDetailsCard />}
			{view === TicketsCardViews.New && <NewTicketCard />}
		</TicketContextComponent>
	);
};
