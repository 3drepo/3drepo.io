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

import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { filterEmptyTicketValues, getDefaultTicket, getEditableProperties, modelIsFederation, sanitizeViewVals, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { ITemplate, ITicket, NewTicket } from '@/v5/store/tickets/tickets.types';
import { getValidators } from '@/v5/store/tickets/tickets.validators';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { TicketForm } from '@/v5/ui/routes/viewer/tickets/ticketsForm/ticketForm.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import { isEmpty, merge } from 'lodash';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { SaveButton, RequiresViewerContainer, ButtonContainer } from './newTicketSlide.styles';
import { hasRequiredViewerProperties } from '../../ticketsTable/ticketsTable.helper';

const getGroupDefaultValue = (template, ticket) => {
	let defaultValues = getDefaultTicket(template);

	if ((defaultValues.modules?.safetibase && ticket?.modules?.safetibase) || (defaultValues.properties && ticket?.properties)) {
		defaultValues = merge(defaultValues, ticket);
	}

	return defaultValues;
};

type NewTicketSlideProps = {
	defaultValue?: Partial<ITicket>,
	modelId: string,
	template: ITemplate,
	onSave: (newTicketId: string) => void,
	onDirtyStateChange: (isDirty: boolean) => void,
};
export const NewTicketSlide = ({ defaultValue, modelId, template, onSave, onDirtyStateChange }: NewTicketSlideProps) => {
	const { teamspace, project } = useParams<DashboardTicketsParams>();
	const templateIsFetched = templateAlreadyFetched(template || {} as any);
	const defaultValues = getGroupDefaultValue(template, defaultValue);
	const isFederation = modelIsFederation(modelId);

	const formData = useForm({
		resolver: yupResolver(getValidators(template)),
		mode: 'onChange',
		defaultValues,
	});

	const { reset, handleSubmit, formState: { isValid, dirtyFields } } = formData;

	const onSubmit = (body) => {
		const ticket = { type: template._id, ...body };

		const parsedTicket = filterEmptyTicketValues(ticket) as NewTicket;
		sanitizeViewVals(ticket, { modules: {} } as ITicket, template);
		TicketsActionsDispatchers.createTicket(
			teamspace,
			project,
			modelId,
			parsedTicket,
			isFederation,
			onSave,
		);
	};

	useEffect(() => {
		if (!templateIsFetched) return;
		reset(defaultValues);
	}, [modelId, templateIsFetched]);

	useEffect(() => {
		onDirtyStateChange(!isEmpty(dirtyFields));
	}, [JSON.stringify(dirtyFields)]);

	useEffect(() => () => {
		onDirtyStateChange(false);
	}, []);

	if (!templateIsFetched) return (<Loader />);

	if (hasRequiredViewerProperties(template)) {
		return (
			<RequiresViewerContainer>
				<FormattedMessage
					id="ticketsTable.cannotCreate"
					defaultMessage="The selected template has required properties that must be set in the viewer."
				/>
			</RequiresViewerContainer>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<FormProvider {...formData}>
				<TicketForm template={getEditableProperties(template)} ticket={defaultValues} />
			</FormProvider>
			<ButtonContainer>
				<SaveButton disabled={!isValid}>
					<FormattedMessage id="ticketsTable.button.saveTicket" defaultMessage="Save ticket" />
				</SaveButton>
			</ButtonContainer>
		</form>
	);
};
