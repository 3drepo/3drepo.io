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
import { useCallback, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks/ticketsSelectors.hooks';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers/ticketsActions.dispatchers';
import { getTicketDefaultValues, modelIsFederation, getValidators } from '@/v5/store/tickets/tickets.helpers';
import { FormProvider, useForm } from 'react-hook-form';
import { CircleButton } from '@controls/circleButton';
import { yupResolver } from '@hookform/resolvers/yup';
import { debounce, isEmpty, isEqual } from 'lodash';
import { TicketsCardViews } from '../tickets.constants';
import { TicketForm } from '../ticketsForm/ticketsForm.component';
import { Form } from '../newTicket/newTicket.styles';

const dirtyValues = (
	dirtyFields: object | boolean,
	allValues: object,
) => {
// If *any* item in an array was modified, the entire array must be submitted, because there's no way to indicate
// "placeholders" for unchanged elements. `dirtyFields` is true for leaves.
	if (dirtyFields === true || Array.isArray(dirtyFields)) return allValues;
	// Here, we have an object
	return Object.fromEntries(
		Object.keys(dirtyFields).map((key) => [
			key,
			dirtyValues(dirtyFields[key], allValues[key]),
		]),
	);
};

const diff = (a, b) => {
	if (isEqual(a, b)) return ({});

	if (a.)
};

let timeStamp = +new Date();

const updateTicket = debounce((teamspace, project, containerOrFederation, ticketId, isFederation, formData) => {
	const now = +new Date();
	console.log(`Ellapsed: ${now - timeStamp}`);
	timeStamp = now;

	let values = dirtyValues(formData.formState.dirtyFields, formData.getValues());
	// console.log(JSON.stringify(formData.formState.dirtyFields, null, '\t'));

	if (isEmpty(values) || !formData.formState.isDirty) return;

	if (!values.title && !values.properties) {
		values = { modules: values };
	}

	TicketsActionsDispatchers.updateTicket(
		teamspace,
		project,
		containerOrFederation,
		ticketId,
		values,
		isFederation,
	);
}, 500);

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

	if (!ticket) return <></>;

	const formData = useForm({
		resolver: yupResolver(getValidators(template)),
		mode: 'onChange',
	});

	useEffect(() => {
		formData.reset(getTicketDefaultValues(ticket));
	}, [ticket.modules, ticket.properties]);

	useEffect(() => {
		updateTicket(
			teamspace,
			project,
			containerOrFederation,
			ticketId,
			isFederation,
			formData,
		);
	},
	[formData.watch()]);

	// console.log(JSON.stringify(ticket, null, '\t'));

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
				<TicketForm template={template} ticket={ticket} />
			</FormProvider>
		</CardContainer>
	);
};
