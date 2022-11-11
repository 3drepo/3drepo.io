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

import ChevronLeft from '@mui/icons-material/ArrowBackIosNew';
import ChevronRight from '@mui/icons-material/ArrowForwardIos';
import { ArrowBack, CardContainer, CardHeader, HeaderButtons } from '@components/viewer/cards/card.styles';
import { CardContext } from '@components/viewer/cards/cardContext.component';
import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers/ticketsActions.dispatchers';
import { getValidators, modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { FormProvider, useForm } from 'react-hook-form';
import { CircleButton } from '@controls/circleButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { dirtyValues, filterErrors, nullifyEmptyStrings, removeEmptyObjects } from '@/v5/helpers/form.helper';
import { TicketsCardViews } from '../tickets.constants';
import { TicketForm } from '../ticketsForm/ticketForm.component';

export const TicketDetailsCard = () => {
	const { props: { ticketId }, setCardView } = useContext(CardContext);

	const { teamspace, project, containerOrFederation } = useParams();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticket = TicketsHooksSelectors.selectTicketById(containerOrFederation, ticketId);
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket?.type);
	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);

	const goBack = () => {
		setCardView(TicketsCardViews.List);
	};
	const changeTicketIndex = (delta: number) => {
		const currentIndex = tickets.findIndex((tckt) => tckt._id === ticketId);
		const updatedId = tickets.slice((currentIndex + delta) % tickets.length)[0]._id;
		setCardView(TicketsCardViews.Details, { ticketId: updatedId });
	};
	const goPrev = () => changeTicketIndex(-1);
	const goNext = () => changeTicketIndex(1);

	useEffect(() => {
		TicketsActionsDispatchers.fetchTicket(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
		);
	}, [ticketId]);

	if (!ticket) return <></>;

	const formData = useForm({
		resolver: yupResolver(getValidators(template)),
		mode: 'all',
		defaultValues: ticket,
	});

	useEffect(() => {
		formData.reset(ticket);
	}, [JSON.stringify(ticket)]);

	const onBlurHandler = () => {
		const values = dirtyValues(formData.getValues(), formData.formState.dirtyFields);
		const validVals = removeEmptyObjects(nullifyEmptyStrings(filterErrors(values, formData.formState.errors)));

		if (isEmpty(validVals)) return;

		// eslint-disable-next-line max-len
		TicketsActionsDispatchers.updateTicket(teamspace, project, containerOrFederation, ticketId, validVals, isFederation);
	};

	return (
		<CardContainer>
			<CardHeader>
				<ArrowBack onClick={goBack} />
				{template.code}:{ticket.number}
				<HeaderButtons>
					<CircleButton size="medium" variant="viewer" onClick={goPrev}><ChevronLeft /></CircleButton>
					<CircleButton size="medium" variant="viewer" onClick={goNext}><ChevronRight /></CircleButton>
				</HeaderButtons>
			</CardHeader>
			<FormProvider {...formData}>
				<TicketForm template={template} ticket={ticket} onPropertyBlur={onBlurHandler} />
			</FormProvider>
		</CardContainer>
	);
};
