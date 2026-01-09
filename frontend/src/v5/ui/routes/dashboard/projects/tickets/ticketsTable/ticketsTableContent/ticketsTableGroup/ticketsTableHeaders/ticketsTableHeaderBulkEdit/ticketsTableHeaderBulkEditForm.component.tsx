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

import { useParams } from "react-router-dom";
import { Button, ButtonsContainer, Container, TitleContainer } from "@components/viewer/cards/cardFilters/filterForm/filterForm.styles";
import { ActionMenuItem } from "@controls/actionMenu";
import { compact, isEmpty } from "lodash";
import { FormProvider, useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { findFilterByPropertyName } from "../ticketsTableHeaderFilter.component";
import { useTicketFiltersContext } from "@components/viewer/cards/cardFilters/ticketsFilters.context";
import { getSelectOptions, isJobsAndUsersProperty } from "@components/viewer/cards/cardFilters/filterForm/filterFormValues/filterFormValues.component";
import { FormBooleanSelect, FormDateTime, FormJobsAndUsersSelect, FormMultiSelect, FormNumberField, FormSelect, FormTextField } from "@controls/inputs/formInputs.component";
import { getFilterFormTitle, isDateType} from "@components/viewer/cards/cardFilters/cardFilters.helpers";
import { mapFormArrayToArray } from "@/v5/helpers/form.helper";
import { getFilterFromEvent } from "@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers";
import { TicketFilterType } from "@components/viewer/cards/cardFilters/cardFilters.types";
import { MultiSelectMenuItem } from "@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component";
import { Value } from "@components/viewer/cards/cardFilters/filterForm/filterFormValues/filterFormValues.styles";
import { MenuItem } from "../../../../../selectMenus/selectMenus.styles";
import { DashboardTicketsParams } from "@/v5/ui/routes/routes.constants";
import { getStatusPropertyValues } from "@controls/chip/statusChip/statusChip.helpers";
import { TicketsHooksSelectors } from "@/v5/services/selectorsHooks";
import { IChipSelectItem, ChipSelectItem } from "@controls/chip/chipSelect/chipSelect.component";

// type FormType = { selectOptions?: Option[], values: { value: TicketFilterValue, displayValue?: string }[], operator: TicketFilterOperator };
type FormType = any;

type InputFieldProps = {
	module: string;
	property: string;
	type: TicketFilterType;
	name: string;
	formError?: string;
};
const InputField = ({module, property, type, ...inputProps}: InputFieldProps) => {
	const { template: templateId, project: projectId } = useParams<DashboardTicketsParams>();
	if (type === 'number') return <FormNumberField {...inputProps} />;
	if (type === 'boolean') return <FormBooleanSelect {...inputProps} />;
	if (type === 'status') {
		const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(projectId, templateId);
		const values = getStatusPropertyValues(statusConfig);
		return (
			<FormSelect {...inputProps}>
				{Object.values(values).map(({ value, ...optionProps }: IChipSelectItem) => (
					<ChipSelectItem key={value} value={value} {...optionProps} />
				))}
			</FormSelect>
		);
	}
	if (isDateType(type)) return <FormDateTime {...inputProps} />;
	if (isJobsAndUsersProperty(module, property, type)) return (
		<FormJobsAndUsersSelect
			multiple
			maxItems={19}
			transformInputValue={(v) => compact(mapFormArrayToArray(v))}
			transformOutputValue={(e) => getFilterFromEvent(e)}
			excludeJobs={(type === 'owner')}
			usersAndJobs={getSelectOptions(module, property, type).map(({ value }) => value)}
			{...inputProps}
		/>
	);
	if (type === 'oneOf') {
		const selectOptions = getSelectOptions(module, property, type);
		return (
			<FormSelect {...inputProps}>
				{selectOptions.map(({ value }) => (
					<MenuItem key={value} value={value}>
						<Value>{value}</Value>
					</MenuItem>
				))}
			</FormSelect>
		)
	}
	if (type === 'manyOf') {
		const selectOptions = getSelectOptions(module, property, type);
		return (
			<FormMultiSelect {...inputProps}>
				{selectOptions.map(({ value }) => (
					<MultiSelectMenuItem key={value} value={value}>
						<Value>{value}</Value>
					</MultiSelectMenuItem>
				))}
			</FormMultiSelect>
		)
	}
	return <FormTextField {...inputProps} />;
}

export const TicketsTableHeaderBulkEditForm = ({ name, onCancel }) => {
   const { filters, choosablefilters } = useTicketFiltersContext();
	const { module, property, type } = findFilterByPropertyName([...filters, ...choosablefilters], name); 
	const defaultValues: FormType = {
		value: type === 'manyOf' ? [] : '',
	};

	const formData = useForm<FormType>({
		defaultValues,
		mode: 'onChange',
		// resolver: yupResolver(FilterSchema),
		shouldUnregister: true,
	});
	const { formState: { isValid, dirtyFields, errors } } = formData;
	const canSubmit = isValid && !isEmpty(dirtyFields);
	const checkedTicketIds = ['ticketId1', 'ticketId2']; // TODO: get checked ticket ids from context

	const handleSubmit = formData.handleSubmit((filledForm: FormType) => {
		console.log('@@ SUBMIT VALUE:', filledForm);
		console.log('@@ FOR PROPERTY:', module, property);
		console.log('@@ FOR TICKETS:', checkedTicketIds);
	});


	return (
		<FormProvider {...formData}>
			<Container>
				<TitleContainer>
					{getFilterFormTitle([module, property])}
				</TitleContainer>
				<InputField
					name="value"
					formError={errors?.values?.value}
					module={module}
					property={property}
					type={type}
				/>
				<ButtonsContainer>
					<Button onClick={onCancel} color="secondary">
						<FormattedMessage id="ticketsTable.headers.bulkEditForm.cancel" defaultMessage="Cancel" />
					</Button>
					<ActionMenuItem disabled={!canSubmit}>
						<Button onClick={handleSubmit} color="primary" variant="contained" disabled={!canSubmit}>
							<FormattedMessage id="ticketsTable.headers.bulkEditForm.apply" defaultMessage="Apply" />
						</Button>
					</ActionMenuItem>
				</ButtonsContainer>
			</Container>
		</FormProvider>
	);
}