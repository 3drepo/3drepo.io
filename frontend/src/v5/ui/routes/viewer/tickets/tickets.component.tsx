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
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { CardContextComponent, CardContextView } from '@components/viewer/cards/cardContext.component';
import { TicketsCardViews } from './tickets.constants';
import { TicketsListCard } from './ticketsList/ticketsListCard.component';
import { TicketDetailsCard } from './ticketDetails/ticketsDetailsCard.component';
import { NewTicketCard } from './newTicket/newTicket.component';

export const Tickets = () => (
	<CardContextComponent defaultView={TicketsCardViews.List}>
		<CardContextView cardView={TicketsCardViews.List}>
			<TicketsListCard />
		</CardContextView>
		<CardContextView cardView={TicketsCardViews.Details}>
			<TicketDetailsCard />
		</CardContextView>
		<CardContextView cardView={TicketsCardViews.New}>
			<NewTicketCard />
		</CardContextView>
	</CardContextComponent>
);
