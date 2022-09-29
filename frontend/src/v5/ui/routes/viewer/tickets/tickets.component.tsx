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
import { useContext, useEffect, useState } from 'react';
import { Button } from '@controls/button';
import { useParams } from 'react-router-dom';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers/ticketsActions.dispatchers';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { omit } from 'lodash';
import { NewTicket } from '@/v5/store/tickets/tickets.types';
import { TextField } from '@mui/material';
import { TicketsCardViews } from './tickets.constants';
import { TicketsListCard } from './ticketsList/ticketsListCard.component';

export const TicketDetailCard = () => {
	const contextValue = useContext(CardContext);
	const { teamspace, project, containerOrFederation } = useParams();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticket = TicketsHooksSelectors.selectTicketById(containerOrFederation, contextValue.props.ticket._id);
	const [title, setTitle] = useState(ticket.title);

	const goBack = () => {
		contextValue.setCardView(TicketsCardViews.List);
	};

	const updateTicket = () => {
		TicketsActionsDispatchers.updateTicket(
			teamspace,
			project,
			containerOrFederation,
			contextValue.props.ticket._id,
			{ title },
			isFederation,
		);
	};

	const cloneTicket = () => {
		const newTicket = omit(ticket, [
			'properties.Updated at',
			'properties.Created at',
			'properties.Owner',
			'_id',
			'number',
		]) as NewTicket;

		newTicket.title += '(clone)';

		TicketsActionsDispatchers.createTicket(
			teamspace,
			project,
			containerOrFederation,
			newTicket,
			isFederation,
		);
	};

	useEffect(() => {
		TicketsActionsDispatchers.fetchTicket(
			teamspace,
			project,
			containerOrFederation,
			contextValue.props.ticket._id,
			isFederation,
		);
	}, [contextValue.props.ticket._id]);

	const onChange = (evt) => {
		setTitle(evt.target.value);
	};

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon fontSize="small" />
				<FormattedMessage id="viewer.cards.ticketsTitle" defaultMessage="Tickets" />
				<Button onClick={goBack}>back</Button>
			</CardHeader>
			<CardContent>
				Showing the details of the ticket {JSON.stringify(ticket)}
				<TextField name="title" value={title} onChange={onChange} />
				<Button onClick={updateTicket}> Update Ticket! </Button>
				<Button onClick={cloneTicket}> Clone Ticket!</Button>

			</CardContent>
		</CardContainer>
	);
};

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
