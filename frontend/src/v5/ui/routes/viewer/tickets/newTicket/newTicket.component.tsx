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

import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { CircularProgress } from '@mui/material';
import TicketsIcon from '@assets/icons/filled/tickets-filled.svg';
import { CardContainer, CardHeader, CardContent } from '@/v5/ui/components/viewer/cards/card.styles';
import CloseIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { NewTicket } from '@/v5/store/tickets/tickets.types';
import { filterEmptyTicketValues, getEditableProperties, getDefaultTicket, modelIsFederation, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { getTicketValidator } from '@/v5/store/tickets/tickets.validators';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { yupResolver } from '@hookform/resolvers/yup';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { useEffect } from 'react';
import { BottomArea, CloseButton, Form, SaveButton } from './newTicket.styles';
import { TicketForm } from '../ticketsForm/ticketForm.component';
import { TicketsCardViews } from '../tickets.constants';
import { ViewerParams } from '../../../routes.constants';

export const NewTicketCard = () => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const isFederation = modelIsFederation(containerOrFederation);
	const template = TicketsCardHooksSelectors.selectSelectedTemplate();
	const isLoading = !('config' in template);

	const defaultTicket = getDefaultTicket(template);

	const formData = useForm({
		resolver: yupResolver(isLoading ? null : getTicketValidator(template)),
		mode: 'onChange',
		defaultValues: defaultTicket,
	});

	const goBack = () => {
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.List);
	};

	const goToTicketDetails = (ticketId) => {
		TicketsCardActionsDispatchers.setSelectedTicket(ticketId);
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.Details);
	};

	const onSubmit = (vals) => {
		const ticket = { type: template._id, ...vals };

		const parsedTicket = filterEmptyTicketValues(ticket) as NewTicket;
		TicketsActionsDispatchers.createTicket(
			teamspace,
			project,
			containerOrFederation,
			parsedTicket,
			isFederation,
			goToTicketDetails,
		);
	};

	useEffect(() => {
		if (templateAlreadyFetched(template)) return;
		TicketsActionsDispatchers.fetchTemplate(
			teamspace,
			project,
			containerOrFederation,
			template._id,
			isFederation,
		);
	}, []);

	return (
		<CardContainer>
			<CardHeader>
				<TicketsIcon />
				<FormattedMessage
					id="viewer.cards.newTicketTitle"
					defaultMessage="New {template} ticket"
					values={{ template: template.name }}
				/>
				<CloseButton onClick={goBack}>
					<CloseIcon />
				</CloseButton>
			</CardHeader>
			{isLoading ? (
				<CardContent>
					<CircularProgress />
				</CardContent>
			) : (
				<FormProvider {...formData}>
					<Form onSubmit={formData.handleSubmit(onSubmit)}>
						<TicketForm
							template={getEditableProperties(template)}
							// Im not sure this is still needed here, because we are already depending on react-hook-form to fill the form
							ticket={defaultTicket}
							focusOnTitle
						/>
						<BottomArea>
							<SaveButton disabled={!formData.formState.isValid}>
								<FormattedMessage id="customTicket.button.saveTicket" defaultMessage="Save ticket" />
							</SaveButton>
						</BottomArea>
					</Form>
				</FormProvider>
			)}
		</CardContainer>
	);
};
