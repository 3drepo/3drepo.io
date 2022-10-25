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
import TicketsIcon from '@mui/icons-material/FormatListBulleted';
import { CardContainer, CardHeader } from '@components/viewer/cards/card.styles';
import { CardContext } from '@components/viewer/cards/cardContext.component';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { useParams } from 'react-router-dom';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers/ticketsActions.dispatchers';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { FormProvider, useForm } from 'react-hook-form';
import { omit } from 'lodash';
import { NewTicket } from '@/v5/store/tickets/tickets.types';
import { TicketsCardViews } from '../tickets.constants';
import { TicketForm } from '../ticketsForm/ticketsForm.component';

export const TicketDetailsCard = () => {
	const { props: { ticketId }, setCardView } = useContext(CardContext);
	const { teamspace, project, containerOrFederation } = useParams();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticket = TicketsHooksSelectors.selectTicketById(containerOrFederation, ticketId);
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket?.type);

	const goBack = () => {
		setCardView(TicketsCardViews.List);
	};

	const updateTicket = () => {
		// TicketsActionsDispatchers.updateTicket(
		// teamspace,
		// project,
		// containerOrFederation,
		// ticketId,
		// { title },
		// isFederation,
		// );
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
			ticketId,
			isFederation,
		);
	}, [ticketId]);

	useEffect(() => {
		if (!ticket) {
			return;
		}

		TicketsActionsDispatchers.fetchTemplate(
			teamspace,
			project,
			containerOrFederation,
			ticket.type,
			isFederation,
		);
	}, [ticket?.type]);

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon fontSize="small" />
				<FormattedMessage id="viewer.cards.ticketsTitle" defaultMessage="Tickets" />
				<Button onClick={goBack}>back</Button>
			</CardHeader>
			<FormProvider {...useForm()}>
				<TicketForm template={template} ticket={ticket} />
			</FormProvider>
			<Button onClick={updateTicket}> Update Ticket! </Button>
			<Button onClick={cloneTicket}> Clone Ticket!</Button>
		</CardContainer>
	);
};
