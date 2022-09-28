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

import TicketsIcon from '@mui/icons-material/FormatListBulleted';
import { FormattedMessage } from 'react-intl';
import { CardContainer, CardHeader } from '@/v5/ui/components/viewer/cards/card.styles';
import { CardContent } from '@/v5/ui/components/viewer/cards/cardContent.component';
import { CardContext, CardContextComponent, CardContextView } from '@components/viewer/cards/cardContext.component';
import { useContext } from 'react';
import { Button } from '@controls/button';
import { TicketsCardViews } from './tickets.constants';
import { TicketsListCard } from './ticketsList/ticketsListCard.component';
import { TicketDetailCard } from './ticketDetails/ticketsDetailsCard.component';

export const TicketNewCard = () => {
	const contextValue = useContext(CardContext);

	const goBack = () => {
		contextValue.setCardView(TicketsCardViews.List);
	};

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon fontSize="small" />
				<FormattedMessage id="viewer.cards.ticketsTitle" defaultMessage="Tickets" />
				<Button onClick={goBack}>back</Button>
			</CardHeader>
			<CardContent>
				Showing the form for a new ticket for the template {JSON.stringify(contextValue.props.template)}
			</CardContent>
		</CardContainer>
	);
};

export const Tickets = () => (
	<CardContextComponent defaultView={TicketsCardViews.List}>
		<CardContextView cardView={TicketsCardViews.List}>
			<TicketsListCard />
		</CardContextView>
		<CardContextView cardView={TicketsCardViews.Details}>
			<TicketDetailCard />
		</CardContextView>
		<CardContextView cardView={TicketsCardViews.New}>
			<TicketNewCard />
		</CardContextView>
	</CardContextComponent>
);
