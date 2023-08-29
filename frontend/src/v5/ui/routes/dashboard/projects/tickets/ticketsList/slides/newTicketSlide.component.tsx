/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { ProjectsActionsDispatchers, TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { filterEmptyTicketValues, getDefaultTicket, modelIsFederation, sanitizeViewVals, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { ITicket, NewTicket } from '@/v5/store/tickets/tickets.types';
import { getValidators } from '@/v5/store/tickets/tickets.validators';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { TicketForm } from '@/v5/ui/routes/viewer/tickets/ticketsForm/ticketForm.component';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { merge } from 'lodash';
import { SaveButton } from './newTicketSlide.styles';

type NewTicketSlideProps = {
	ticket?: Partial<ITicket>,
	containerOrFederationId: string,
	onSave: (newTicket) => void,
};
export const NewTicketSlide = ({ ticket, containerOrFederationId, onSave }: NewTicketSlideProps) => {
	const { teamspace, project, template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const defaultValues = merge(getDefaultTicket(template), ticket);
	const isFederation = modelIsFederation(containerOrFederationId);

	const formData = useForm({
		resolver: yupResolver(getValidators(template)),
		mode: 'onChange',
		defaultValues,
	});

	const onSubmit = (body) => {
		const ticket = { type: template._id, ...body };

		const parsedTicket = filterEmptyTicketValues(ticket) as NewTicket;
		sanitizeViewVals(ticket, { modules: {} } as ITicket, template);
		TicketsActionsDispatchers.createTicket(
			teamspace,
			project,
			containerOrFederationId,
			parsedTicket,
			isFederation,
			(ticketId) => onSave({ ...ticket, _id: ticketId }), //TODO - refine this
		);
	};


	useEffect(() => { formData.reset(ticket); }, [containerOrFederationId]);

	useEffect(() => {
		if (templateAlreadyFetched(template)) return;
		ProjectsActionsDispatchers.fetchTemplate(teamspace, project, containerOrFederationId, templateId, isFederation);
	}, [template._id]);

	return (
		<form onSubmit={formData.handleSubmit(onSubmit)}>
			<FormProvider {...formData}>
				<TicketForm
					template={template}
					ticket={ticket}
				/>
			</FormProvider>
			<SaveButton disabled={!formData.formState.isValid}>
				<FormattedMessage
					id="ticketsTable.button.saveTicket" defaultMessage="Save ticket" />
			</SaveButton>
		</form>
	);
};
