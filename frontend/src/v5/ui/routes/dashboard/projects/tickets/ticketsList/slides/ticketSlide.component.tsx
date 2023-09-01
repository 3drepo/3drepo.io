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

import { Loader } from '@/v4/routes/components/loader/loader.component';
import { dirtyValues, filterErrors, nullifyEmptyObjects, removeEmptyObjects } from '@/v5/helpers/form.helper';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeContainerNewTicket, enableRealtimeContainerUpdateTicket, enableRealtimeContainerUpdateTicketGroup, enableRealtimeFederationNewTicket, enableRealtimeFederationUpdateTicket, enableRealtimeFederationUpdateTicketGroup } from '@/v5/services/realtime/ticket.events';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { modelIsFederation, sanitizeViewVals, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { getValidators } from '@/v5/store/tickets/tickets.validators';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { TicketForm } from '@/v5/ui/routes/viewer/tickets/ticketsForm/ticketForm.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';

type TicketSlideProps = {
	ticketId: string,
	modelId: string,
	template: ITemplate,
};
export const TicketSlide = ({ modelId, template, ticketId }: TicketSlideProps) => {
	const { teamspace, project } = useParams<DashboardTicketsParams>();
	const isFederation = modelIsFederation(modelId);
	const ticket = TicketsHooksSelectors.selectTicketByIdRaw(modelId, ticketId);

	const formData = useForm({
		resolver: yupResolver(getValidators(template._id)),
		mode: 'onChange',
		defaultValues: ticket,
	});

	const onBlurHandler = () => {
		const values = dirtyValues(formData.getValues(), formData.formState.dirtyFields);
		const validVals = removeEmptyObjects(nullifyEmptyObjects(filterErrors(values, formData.formState.errors)));
		sanitizeViewVals(validVals, ticket, template);
		if (isEmpty(validVals)) return;
		TicketsActionsDispatchers.updateTicket(teamspace, project, modelId, ticketId, validVals, isFederation);
	};

	useEffect(() => { formData.reset(ticket); }, [ticket]);
	
	useEffect(() => (isFederation
		? enableRealtimeFederationUpdateTicket(teamspace, project, modelId)
		: enableRealtimeContainerUpdateTicket(teamspace, project, modelId)
	), [modelId]);

	if (!templateAlreadyFetched(template)) return (<Loader />);

	return (
		<FormProvider {...formData}>
			<TicketForm template={template} ticket={ticket} onPropertyBlur={onBlurHandler} />
		</FormProvider>
	);
};
