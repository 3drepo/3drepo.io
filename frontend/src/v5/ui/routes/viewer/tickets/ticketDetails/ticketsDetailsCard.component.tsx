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

import { ArrowBack, CardContainer, CardHeader, HeaderButtons } from '@components/viewer/cards/card.styles';
import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TicketsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers, TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { modelIsFederation, sanitizeViewVals, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { getValidators } from '@/v5/store/tickets/tickets.validators';
import { FormProvider, useForm } from 'react-hook-form';
import { CircleButton } from '@controls/circleButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { dirtyValues, filterErrors, nullifyEmptyStrings, removeEmptyObjects } from '@/v5/helpers/form.helper';
import { FormattedMessage } from 'react-intl';
import { InputController } from '@controls/inputs/inputController.component';
import { TicketsCardViews } from '../tickets.constants';
import { TicketForm } from '../ticketsForm/ticketForm.component';
import { ChevronLeft, ChevronRight } from './ticketDetails.styles';
import { TicketGroups } from '../ticketsForm/ticketGroups/ticketGroups.component';
import { TicketContext, TicketDetailsView } from '../ticket.context';

export const TicketDetailsCard = () => {
	const { teamspace, project, containerOrFederation } = useParams();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticket = TicketsCardHooksSelectors.selectSelectedTicket();
	const tickets = TicketsHooksSelectors.selectTickets(containerOrFederation);
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket?.type);

	const goBack = () => {
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.List);
	};

	const changeTicketIndex = (delta: number) => {
		const currentIndex = tickets.findIndex((tckt) => tckt._id === ticket._id);
		const updatedId = tickets.slice((currentIndex + delta) % tickets.length)[0]._id;
		TicketsCardActionsDispatchers.setSelectedTicket(updatedId);
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.Details);
	};

	const goPrev = () => changeTicketIndex(-1);
	const goNext = () => changeTicketIndex(1);

	const formData = useForm({
		resolver: yupResolver(getValidators(template)),
		mode: 'onChange',
		defaultValues: ticket,
	});

	useEffect(() => {
		formData.reset(ticket);
	}, [JSON.stringify(ticket)]);

	const onBlurHandler = () => {
		const values = dirtyValues(formData.getValues(), formData.formState.dirtyFields);
		let validVals = removeEmptyObjects(nullifyEmptyStrings(filterErrors(values, formData.formState.errors)));
		validVals = sanitizeViewVals(validVals, ticket, template);

		if (isEmpty(validVals)) return;

		// eslint-disable-next-line max-len
		TicketsActionsDispatchers.updateTicket(teamspace, project, containerOrFederation, ticket._id, validVals, isFederation);
	};

	useEffect(() => {
		TicketsActionsDispatchers.fetchTicket(
			teamspace,
			project,
			containerOrFederation,
			ticket._id,
			isFederation,
		);

		if (!templateAlreadyFetched(template)) {
			TicketsActionsDispatchers.fetchTemplate(
				teamspace,
				project,
				containerOrFederation,
				template._id,
				isFederation,
			);
		}
	}, [ticket._id]);

	if (!ticket) return (<></>);

	const { view, setDetailViewAndProps, viewProps } = useContext(TicketContext);

	return (
		<CardContainer>
			<FormProvider {...formData}>
				{view === TicketDetailsView.Groups
					&& (
						<>
							<CardHeader>
								<ArrowBack onClick={() => setDetailViewAndProps(TicketDetailsView.Form)} />
								{ticket.title}:<FormattedMessage id="ticket.groups.header" defaultMessage="Groups" />
							</CardHeader>
							<InputController
								Input={TicketGroups}
								name={viewProps.name}
								onBlur={onBlurHandler}
							/>
						</>
					)}
				{view === TicketDetailsView.Form
				&& (
					<>
						<CardHeader>
							<ArrowBack onClick={goBack} />
							{template.code}:{ticket.number}
							<HeaderButtons>
								<CircleButton variant="viewer" onClick={goPrev}><ChevronLeft /></CircleButton>
								<CircleButton variant="viewer" onClick={goNext}><ChevronRight /></CircleButton>
							</HeaderButtons>
						</CardHeader>
						<TicketForm template={template} ticket={ticket} onPropertyBlur={onBlurHandler} />
					</>
				)}
			</FormProvider>
		</CardContainer>
	);
};
