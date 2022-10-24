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

import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers/ticketsActions.dispatchers';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { CardContainer, CardHeader } from '@components/viewer/cards/card.styles';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import TicketsIcon from '@mui/icons-material/FormatListBulleted';
import { CardContent } from '@components/viewer/cards/cardContent.component';
import { ViewerParams } from '../../../routes.constants';
import { TicketsList } from './ticketsList.component';
import { Button } from '@controls/button';
import { CardContext } from '@components/viewer/cards/cardContext.component';
import { TicketsCardViews } from '../tickets.constants';

export const TicketsListCard = () => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);
	const contextValue = useContext(CardContext);

	const goToNewTicket = () => contextValue.setCardView(TicketsCardViews.Templates);

	useEffect(() => {
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
	}, [containerOrFederation]);

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon fontSize="small" />
				<FormattedMessage id="viewer.cards.tickets.title" defaultMessage="Tickets" />
				<Button onClick={goToNewTicket}>New Ticket</Button>
			</CardHeader>
			<CardContent autoHeightMax="100%">
				<TicketsList tickets={tickets} />
			</CardContent>
		</CardContainer>
	);
};
