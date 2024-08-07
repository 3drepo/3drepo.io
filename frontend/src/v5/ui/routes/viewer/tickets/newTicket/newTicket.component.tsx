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
import TicketsIcon from '@assets/icons/outlined/tickets-outlined.svg';
import { CardContainer, CardHeader, ArrowBack } from '@/v5/ui/components/viewer/cards/card.styles';
import CloseIcon from '@assets/icons/outlined/cross_sharp_edges-outlined.svg';
import { ITicket, NewTicket } from '@/v5/store/tickets/tickets.types';
import { filterEmptyTicketValues, getEditableProperties, getDefaultTicket, modelIsFederation, templateAlreadyFetched, sanitizeViewVals } from '@/v5/store/tickets/tickets.helpers';
import { getTicketValidator } from '@/v5/store/tickets/tickets.validators';
import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { yupResolver } from '@hookform/resolvers/yup';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { useContext, useEffect } from 'react';
import { InputController } from '@controls/inputs/inputController.component';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';
import { merge } from 'lodash';
import { BottomArea, CloseButton, Form, SaveButton } from './newTicket.styles';
import { TicketForm } from '../ticketsForm/ticketForm.component';
import { ViewerParams } from '../../../routes.constants';
import { TicketGroups } from '../ticketsForm/ticketGroups/ticketGroups.component';
import { TicketContext, TicketDetailsView } from '../ticket.context';
import { CardContent } from '../ticketsForm/ticketsForm.styles';
import { TicketsCardViews } from '../tickets.constants';

export const NewTicketCard = () => {
	const { teamspace, project, containerOrFederation } = useParams<ViewerParams>();
	const unsavedTicket = TicketsCardHooksSelectors.selectUnsavedTicket();

	const isFederation = modelIsFederation(containerOrFederation);
	const template = TicketsCardHooksSelectors.selectSelectedTemplate();
	const isLoading = !('config' in template);
	const templateId = template._id;

	let defaultTicket = getDefaultTicket(template);
	if (unsavedTicket) {
		defaultTicket = merge(defaultTicket, unsavedTicket);
	}

	const formData = useForm({
		resolver: yupResolver(isLoading ? null : getTicketValidator(template)),
		mode: 'onChange',
		defaultValues: defaultTicket,
	});

	const goBack = () => {
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.List);
	};

	const goToTicketDetails = (ticketId) => {
		TicketsCardActionsDispatchers.openTicket(ticketId);
	};

	const onSubmit = async (vals) => {
		const ticket = { type: templateId, ...vals };

		const { promiseToResolve, resolve } = getWaitablePromise();

		const parsedTicket = filterEmptyTicketValues(ticket) as NewTicket;
		sanitizeViewVals(ticket, { modules: {} } as ITicket, template);
		TicketsActionsDispatchers.createTicket(
			teamspace,
			project,
			containerOrFederation,
			parsedTicket,
			isFederation,
			(ticketId) => {
				resolve();
				goToTicketDetails(ticketId);
			},
			resolve,
		);

		await promiseToResolve;
	};

	const updateUnsavedTicket = () => TicketsCardActionsDispatchers.setUnsavedTicket(formData.getValues());

	useEffect(() => {
		if (!templateAlreadyFetched(template)) {
			TicketsActionsDispatchers.fetchTemplate(
				teamspace,
				project,
				containerOrFederation,
				templateId,
				isFederation,
			);
		}

		TicketsCardActionsDispatchers.setUnsavedTicket(defaultTicket);

		return () => { updateUnsavedTicket(); };
	}, []);

	useEffect(() => {
		formData.reset(defaultTicket);
	}, [isLoading]);

	const { detailsView, setDetailViewAndProps, detailsViewProps: viewProps } = useContext(TicketContext);

	return (
		<CardContainer>
			<FormProvider {...formData}>
				<Form onSubmit={formData.handleSubmit(onSubmit)}>
					{detailsView === TicketDetailsView.Groups && (
						<>
							<CardHeader>
								<ArrowBack onClick={() => setDetailViewAndProps(TicketDetailsView.Form)} />
								<FormattedMessage
									id="viewer.cards.newTicketTitleGroups"
									defaultMessage="New {template} ticket:Groups"
									values={{ template: template.name }}
								/>
							</CardHeader>
							<CardContent>
								<InputController
									Input={TicketGroups}
									name={viewProps.name}
								/>
							</CardContent>
						</>
					)}

					{detailsView === TicketDetailsView.Form && (
						<>
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
								<TicketForm
									template={getEditableProperties(template)}
									// Im not sure this is still needed here, because we are already depending on react-hook-form to fill the form
									ticket={defaultTicket}
									focusOnTitle
									onPropertyBlur={updateUnsavedTicket}
								/>
							)}
						</>
					)}
					<BottomArea>
						<SaveButton disabled={!formData.formState.isValid} isPending={formData.formState.isSubmitting}>
							<FormattedMessage id="customTicket.button.saveTicket" defaultMessage="Save ticket" />
						</SaveButton>
					</BottomArea>
				</Form>
			</FormProvider>
		</CardContainer>
	);
};
