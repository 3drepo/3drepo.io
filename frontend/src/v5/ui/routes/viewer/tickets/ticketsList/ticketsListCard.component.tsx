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

import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { CardContainer, CardHeader } from '@components/viewer/cards/card.styles';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import TicketsIcon from '@assets/icons/filled/tickets-filled.svg';
import { CardContent } from '@components/viewer/cards/cardContent.component';
import { TicketsList } from './ticketsList.component';
import { NewTicketMenu } from './newTicketMenu/newTicketMenu.component';
import { ViewerParams } from '../../../routes.constants';
import { EmptyList } from './ticketsList.styles';

export const TicketsListCard = () => {
	const { containerOrFederation } = useParams<ViewerParams>();
	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon />
				<FormattedMessage id="viewer.cards.tickets.title" defaultMessage="Tickets" />
				<NewTicketMenu />
			</CardHeader>
			<CardContent>
				{tickets.length ? (
					<TicketsList tickets={tickets} />
				) : (
					<EmptyList>
						<FormattedMessage id="viewer.cards.tickets.emptyList" defaultMessage="No tickets have been created yet" />
					</EmptyList>
				)}
			</CardContent>
		</CardContainer>
	);
};
