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
import { getFilterFormTitle, isSelectType } from '@components/viewer/cards/cardFilters/cardFilters.helpers';
import { findFilterByPropertyName } from '@/v5/ui/routes/dashboard/projects/tickets/ticketsTable/ticketsTableContent/ticketsTableGroup/ticketsTableHeaders/ticketsTableHeaderFilter.component';
import { BulkEditInputField } from './bulkEditInputField/bulkEditInputField.component';
import { findPropertyDefinition } from '@/v5/store/tickets/tickets.helpers';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';

import { set, uniq } from 'lodash';
import { DialogsActionsDispatchers, TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { getState } from '@/v5/helpers/redux.helpers';
import { selectCurrentProjectTemplateById } from '@/v5/store/projects/projects.selectors';
import { selectTemplateById } from '@/v5/store/tickets/tickets.selectors';
import { getSelectOptions } from '@components/viewer/cards/cardFilters/filterForm/filterFormValues/filterFormValues.component';
import { formatMessage } from '@/v5/services/intl';

type IBulkEditFormProps = {
	name: string;
	selectedIds: Set<string>;
	onCancel: () => void;
};
type FormType = { value: any; };

export const TicketsBulkEditForm = ({ name, selectedIds, onCancel }: IBulkEditFormProps) => {
	const { filters, choosablefilters, modelsIds: modelsIdsContext } = useTicketFiltersContext();
	const { module, property, type } = findFilterByPropertyName([...filters, ...choosablefilters], name); 
	const { teamspace, containerOrFederation, project: projectId } = useParams();
	const selectedTickets = TicketsHooksSelectors.selectTicketsById(Array.from(selectedIds));
	const templatesIds = uniq(selectedTickets.map((t) => t.type));
	const state = getState();
	
	// Temporary method for getting template. When using this in Viewer will have to handle cases with multiple templates.
	const templates = templatesIds.map((id) => {
		// In viewer
		const templateByModel = selectTemplateById(state, containerOrFederation, id);
		// In tabular view
		const templateByProject = selectCurrentProjectTemplateById(state, id);
	
		return templateByProject || templateByModel;
	});

	let isArrayType = true;
	const notNullable = templates.every((template) =>  {
		const propDef = findPropertyDefinition(template, name);
		isArrayType = isArrayType && (['oneOf', 'manyOf'].includes(propDef?.type));
		return propDef?.required || (propDef?.type === 'oneOf');
	});

	const defaultValues: FormType = {
		value: type === 'manyOf' ? [] : null,
	};
	
	const formData = useForm<FormType>({
		defaultValues,
		mode: 'onChange',
	});

	const modelsIds = containerOrFederation ? [containerOrFederation] : modelsIdsContext;

	const { formState: { isValid }, watch } = formData;

	const value = watch('value');
	const isEmptyValue = !value || (isArrayType && value.length === 0);
	const canSubmit = isValid && (!notNullable || !isEmptyValue);

	const handleSubmit = formData.handleSubmit((filledForm: FormType) => {
		const values = Array.isArray(filledForm.value) ? filledForm.value.map((v) => v.value ? v.value : v) :  filledForm.value;

		// Checks which template applies to the selected value
		// for example a custom status from a template might not apply to a status from another one
		const appliesToTemplate:Record<string, boolean> = {};
		templates.forEach((template) => {
			const definition = findPropertyDefinition(template, name);
			appliesToTemplate[template._id] =
				(type === definition?.type) && // property exists on template with same type
				(!definition?.readOnlyOnUI && !definition?.readOnly); // this property is editable

			if (!definition) {
				return;
			}
 			
			if (['manyOf', 'oneOf'].includes(definition.type) && isSelectType(type)) {
				const options = new Set(getSelectOptions(module, property, type, [template], modelsIds).map((o) => o.value));
				
				if (type === 'manyOf'  && definition.type === 'manyOf') {
					appliesToTemplate[template._id] = values.every((val) =>  options.has(val));
				} else {
					appliesToTemplate[template._id] =  options.has(values);
				}
			}
		});

		const finalSelectedIds = selectedTickets.filter((ticket) => 
			appliesToTemplate[ticket.type]).map((ticket) => ticket._id);
		
		let partialTicket = {};
		set(partialTicket, name, values);

		if (finalSelectedIds.length !== selectedTickets.length) {
			DialogsActionsDispatchers.open('info', {
				title: formatMessage({
					id: 'bulkUpdate.partialUpdateTitle',
					defaultMessage: 'Partial update',
				}),
				message: formatMessage({
					id: 'bulkUpdate.partialUpdateMessage',
					defaultMessage: `
					The selected change can’t be applied to every ticket in your selection.{br} 
					Apply the update to the tickets where it’s valid, or review your selection.`,
				}, { br: <br /> }),
				actionButtonLabel:  formatMessage({
					id: 'bulkUpdate.partialUpdateAction',
					defaultMessage: 'Apply update',
				}),
				onClickAction: () => TicketsActionsDispatchers.updateManyTickets(teamspace, projectId, finalSelectedIds, partialTicket),
			});
		} else {
			TicketsActionsDispatchers.updateManyTickets(teamspace, projectId, finalSelectedIds, partialTicket);
		}

	});
	return (
		<FormProvider {...formData}>
			<Container>
				<TitleContainer>
					{getFilterFormTitle([module, property])}
				</TitleContainer>
				<BulkEditInputField
					name="value"
					templates={templates}
					modelsIds={modelsIds}
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
