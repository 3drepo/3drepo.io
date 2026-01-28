/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { useParams } from 'react-router-dom';
import { Button, ButtonsContainer, Container, TitleContainer } from '@components/viewer/cards/cardFilters/filterForm/filterForm.styles';
import { ActionMenuItem } from '@controls/actionMenu';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useTicketFiltersContext } from '@components/viewer/cards/cardFilters/ticketsFilters.context';
import { getFilterFormTitle } from '@components/viewer/cards/cardFilters/cardFilters.helpers';
import { findFilterByPropertyName } from '@/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTableContent/ticketsTableGroup/ticketsTableHeaders/ticketsTableHeaderFilter.component';
import { BulkEditInputField } from './bulkEditInputField/bulkEditInputField.component';
import { findPropertyDefinition } from '@/v5/store/tickets/tickets.helpers';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';

type IBulkEditFormProps = {
	name: string;
	selectedIds: Set<string>;
	onCancel: () => void;
};
type FormType = { value: any; };

export const TicketsBulkEditForm = ({ name, selectedIds, onCancel }: IBulkEditFormProps) => {
	const { filters, choosablefilters } = useTicketFiltersContext();
	const { module, property, type } = findFilterByPropertyName([...filters, ...choosablefilters], name); 
	const { template: templateId, project: projectId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const propDef = findPropertyDefinition(template, name);
	const defaultValues: FormType = {
		value: type === 'manyOf' ? [] : '',
	};

	const formData = useForm<FormType>({
		defaultValues,
		mode: 'onChange',
	});
	const { formState: { isValid }, watch } = formData;

	const isEmptyValue = !watch('value');
	const notNullable = propDef?.required || (propDef?.type === 'oneOf');
	const canSubmit = isValid && (!notNullable || !isEmptyValue);

	const handleSubmit = formData.handleSubmit((filledForm: FormType) => {
		// eslint-disable-next-line no-console
		console.log('@@ SUBMIT VALUE:', filledForm);
		// eslint-disable-next-line no-console
		console.log('@@ FOR PROPERTY:', module, property);
		// eslint-disable-next-line no-console
		console.log('@@ FOR TICKETS:', selectedIds);
	});

	return (
		<FormProvider {...formData}>
			<Container>
				<TitleContainer>
					{getFilterFormTitle([module, property])}
				</TitleContainer>
				<BulkEditInputField
					name="value"
					templateId={templateId}
					projectId={projectId}
					module={module}
					property={property}
					type={type}
				/>
				<ButtonsContainer>
					<Button onClick={onCancel} color="secondary">
						<FormattedMessage id="ticketsBulkEditForm.cancel" defaultMessage="Cancel" />
					</Button>
					<ActionMenuItem disabled={!canSubmit}>
						<Button onClick={handleSubmit} color="primary" variant="contained" disabled={!canSubmit}>
							{isEmptyValue ? (
								<FormattedMessage id="ticketsBulkEditForm.clear" defaultMessage="Clear All" />
							) : (
								<FormattedMessage id="ticketsBulkEditForm.apply" defaultMessage="Apply" />
							)}
						</Button>
					</ActionMenuItem>
				</ButtonsContainer>
			</Container>
		</FormProvider>
	);
};
