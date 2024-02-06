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
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsCardActionsDispatchers, TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { findEditedGroup, modelIsFederation, sanitizeViewVals, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { getValidators } from '@/v5/store/tickets/tickets.validators';
import { FormProvider, useForm } from 'react-hook-form';
import { CircleButton } from '@controls/circleButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty, set } from 'lodash';
import { dirtyValues, filterErrors, nullifyEmptyObjects, removeEmptyObjects } from '@/v5/helpers/form.helper';
import { FormattedMessage } from 'react-intl';
import { InputController } from '@controls/inputs/inputController.component';
import { TicketsCardViews } from '../tickets.constants';
import { TicketForm } from '../ticketsForm/ticketForm.component';
import { BreakableText, ChevronLeft, ChevronRight, GroupsCardHeader } from './ticketDetailsCard.styles';
import { TicketGroups } from '../ticketsForm/ticketGroups/ticketGroups.component';
import { useSearchParam } from '../../../useSearchParam';

enum IndexChange {
	PREV = -1,
	NEXT = 1,
}

export const TicketDetailsCard = () => {
	const { teamspace, project, containerOrFederation, revision } = useParams();
	const [, setTicketId] = useSearchParam('ticketId');

	const view = TicketsCardHooksSelectors.selectView();
	const viewProps = TicketsCardHooksSelectors.selectViewProps();

	const isFederation = modelIsFederation(containerOrFederation);
	const filteredTickets = TicketsCardHooksSelectors.selectTicketsWithAllFiltersApplied() as any;
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();
	const ticket = TicketsHooksSelectors.selectTicketById(containerOrFederation, ticketId);
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, ticket?.type);
	const currentIndex = filteredTickets.findIndex((tckt) => tckt._id === ticket._id);
	const initialIndex = useRef(currentIndex);
	const listLength = filteredTickets.length;
	const ticketWasRemoved = currentIndex === -1;
	const disableCycleButtons = ticketWasRemoved ? listLength < 1 : listLength < 2;
	const templateValidationSchema = getValidators(template);

	const getUpdatedIndex = (delta: IndexChange) => {
		let index = ticketWasRemoved ? initialIndex.current : currentIndex;
		if (ticketWasRemoved && delta === IndexChange.NEXT) {
			index--;
		}
		return (index + delta) % listLength;
	};

	const changeTicketIndex = (delta: IndexChange) => {
		const updatedId = filteredTickets.at(getUpdatedIndex(delta))._id;
		TicketsCardActionsDispatchers.setSelectedTicket(updatedId);
	};

	const cycleToPrevTicket = () => changeTicketIndex(IndexChange.PREV);
	const cycleToNextTicket = () => changeTicketIndex(IndexChange.NEXT);

	const goBack = () => {
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.List);
		if (!ticketWasRemoved) return;
		if (initialIndex.current < listLength) {
			cycleToNextTicket();
		} else {
			TicketsCardActionsDispatchers.setSelectedTicket(null);
		}
	};

	const formData = useForm({
		resolver: yupResolver(templateValidationSchema),
		mode: 'onChange',
		defaultValues: ticket,
	});

	const onBlurHandler = async () => {
		const formValues = formData.getValues();
		let errors = {};
		try {
			// cannot use formState.errors because the validation for complex objects is completed after
			// onBlur gets called, so formState.errors for those objects is updated to the previous
			// onBlur call instead and might claim there are no errors when it's not the case
			await templateValidationSchema.validateSync(formValues, { abortEarly: false });
		} catch (yupError) {
			(yupError?.inner || []).forEach(({ path, message }) => set(errors, path, { message }));
		}
		const values = dirtyValues(formValues, formData.formState.dirtyFields);
		const validVals = removeEmptyObjects(nullifyEmptyObjects(filterErrors(values, errors)));

		const editedGroup = findEditedGroup(validVals, ticket, template);
		if (editedGroup) {
			TicketsActionsDispatchers.updateTicketGroup(
				teamspace,
				project,
				containerOrFederation,
				ticket._id,
				editedGroup,
				isFederation,
			);
		}

		sanitizeViewVals(validVals, ticket, template);
		if (isEmpty(validVals)) return;
		TicketsActionsDispatchers.updateTicket(teamspace, project, containerOrFederation, ticket._id, validVals, isFederation);
	};

	useEffect(() => {
		if (!ticket?._id) return;
		initialIndex.current = currentIndex;
		if (!templateAlreadyFetched(template)) {
			TicketsActionsDispatchers.fetchTemplate(
				teamspace,
				project,
				containerOrFederation,
				template._id,
				isFederation,
			);
		}
		TicketsActionsDispatchers.fetchTicket(teamspace, project, containerOrFederation, ticket._id, isFederation, revision);
		setTicketId(ticket._id);
	}, [ticket?._id]);

	useEffect(() => {
		formData.reset(ticket);
	}, [JSON.stringify(ticket)]);

	useEffect(() => () => {
		onBlurHandler();
		setTicketId();
	}, []);

	if (!ticket) return null;
	return (
		<CardContainer>
			<FormProvider {...formData}>
				{view === TicketsCardViews.DetailsGroups
					&& (
						<>
							<GroupsCardHeader>
								<ArrowBack onClick={() => TicketsCardActionsDispatchers.goBackFromTicketGroups(ticket)} />
								<BreakableText>{ticket.title}</BreakableText>
								<span>:<FormattedMessage id="ticket.groups.header" defaultMessage="Groups" /></span>
							</GroupsCardHeader>
							<InputController
								Input={TicketGroups}
								name={viewProps.name}
								onBlur={onBlurHandler}
							/>
						</>
					)}
				{view !== TicketsCardViews.DetailsGroups
					&& (
						<>
							<CardHeader>
								<ArrowBack onClick={goBack} />
								{template.code}:{ticket.number}
								<HeaderButtons>
									<CircleButton variant="viewer" onClick={cycleToPrevTicket} disabled={disableCycleButtons}><ChevronLeft /></CircleButton>
									<CircleButton variant="viewer" onClick={cycleToNextTicket} disabled={disableCycleButtons}><ChevronRight /></CircleButton>
								</HeaderButtons>
							</CardHeader>
							<TicketForm template={template} ticket={ticket} onPropertyBlur={onBlurHandler} />
						</>
					)}
			</FormProvider>
		</CardContainer>
	);
};
