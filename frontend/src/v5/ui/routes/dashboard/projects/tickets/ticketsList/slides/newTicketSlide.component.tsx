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

import { TicketsActionsDispatchers, TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { filterEmptyTicketValues, getDefaultTicket, getEditableProperties, modelIsFederation, sanitizeViewVals, templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { ITemplate, ITicket, NewTicket, PropertyTypeDefinition } from '@/v5/store/tickets/tickets.types';
import { getValidators } from '@/v5/store/tickets/tickets.validators';
import { DashboardTicketsParams, VIEWER_ROUTE } from '@/v5/ui/routes/routes.constants';
import { TicketForm } from '@/v5/ui/routes/viewer/tickets/ticketsForm/ticketForm.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useParams, generatePath } from 'react-router-dom';
import { isEmpty, merge, set } from 'lodash';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { SaveButton, RequiresViewerContainer, ButtonContainer, Link, Form } from './newTicketSlide.styles';
import { hasRequiredViewerProperties, PresetValue } from '../../ticketsTable/ticketsTable.helper';
import { getWaitablePromise } from '@/v5/helpers/async.helpers';
import { IssueProperties, TicketsCardViews } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { TicketsTableContext } from '../../ticketsTable/ticketsTableContext/ticketsTableContext';

type NewTicketSlideProps = {
	template: ITemplate,
	containerOrFederation: string,
	presetValue: PresetValue,
	onSave: (newTicketId: string) => void,
	onDirtyStateChange: (isDirty: boolean) => void,
};

const toDefaultValue = ({ key, value }: PresetValue, propertyType: PropertyTypeDefinition) => {
	if (!key || key === IssueProperties.DUE_DATE || !value) return;

	let val: string | string[] = value;
	if (propertyType === 'manyOf') {
		val = value.split(',').map((v) => v.trim());
	}

	return set({}, key, val);
};

export const NewTicketSlide = ({ template, containerOrFederation, presetValue, onSave, onDirtyStateChange }: NewTicketSlideProps) => {
	const { teamspace, project } = useParams<DashboardTicketsParams>();
	const { getPropertyType } = useContext(TicketsTableContext);
	const isLoading = !templateAlreadyFetched(template || {} as any) || !containerOrFederation;
	const preselectedDefaultValue = toDefaultValue(presetValue, getPropertyType(presetValue.key));
	const defaultTicket = getDefaultTicket(template);
	const defaultValues = preselectedDefaultValue ? merge(defaultTicket, preselectedDefaultValue) : defaultTicket;
	const isFederation = modelIsFederation(containerOrFederation);
	
	const formData = useForm({
		resolver: yupResolver(getValidators(template)),
		mode: 'onChange',
		defaultValues,
	});

	const { reset, handleSubmit, formState: { isValid, dirtyFields, isSubmitting } } = formData;

	const onSubmit = async (body) => {
		const ticket = { type: template._id, ...body };

		const parsedTicket = filterEmptyTicketValues(ticket) as NewTicket;
		sanitizeViewVals(ticket, { modules: {} } as ITicket, template);

		const { resolve, promiseToResolve } = getWaitablePromise();
		TicketsActionsDispatchers.createTicket(
			teamspace,
			project,
			containerOrFederation,
			parsedTicket,
			isFederation,
			(ticketId) => {
				onSave(ticketId);
				resolve();
			},
			resolve,
		);

		await promiseToResolve;
	};

	const viewerModelLink = !containerOrFederation ? '/' : generatePath(VIEWER_ROUTE, {
		teamspace,
		project,
		containerOrFederation,
	});

	useEffect(() => {
		if (isLoading) return;
		reset(defaultValues);
	}, [containerOrFederation, template, isLoading, presetValue.value]);

	useEffect(() => {
		onDirtyStateChange(!isEmpty(dirtyFields));
	}, [isEmpty(dirtyFields)]);

	useEffect(() => {
		TicketsCardActionsDispatchers.setCardView(TicketsCardViews.New);
		return () => onDirtyStateChange(false);
	}, []);

	if (isLoading) return (<Loader />);

	if (hasRequiredViewerProperties(template)) {
		return (
			<RequiresViewerContainer>
				<FormattedMessage
					id="ticketsTable.cannotCreate"
					defaultMessage="The selected template has required properties that can only be created in the viewer, please proceed to <Link>view this model</Link> to create the ticket."
					values={{
						Link: (text) => <Link to={viewerModelLink} target="_blank">{text}</Link>,
					}}
				/>
			</RequiresViewerContainer>
		);
	}

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormProvider {...formData}>
				<TicketForm template={getEditableProperties(template)} ticket={defaultValues} focusOnTitle />
			</FormProvider>
			<ButtonContainer>
				<SaveButton disabled={!isValid} isPending={isSubmitting}>
					<FormattedMessage id="ticketsTable.button.saveTicket" defaultMessage="Save ticket" />
				</SaveButton>
			</ButtonContainer>
		</Form>
	);
};
