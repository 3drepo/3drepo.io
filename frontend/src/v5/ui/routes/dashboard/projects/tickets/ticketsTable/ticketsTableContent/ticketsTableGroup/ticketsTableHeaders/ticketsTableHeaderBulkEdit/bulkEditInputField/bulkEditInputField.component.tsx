import { useParams } from "react-router";
import { mapFormArrayToArray } from "@/v5/helpers/form.helper";
import { TicketsHooksSelectors } from "@/v5/services/selectorsHooks";
import { DashboardTicketsParams } from "@/v5/ui/routes/routes.constants";
import { isDateType, isSelectType } from "@components/viewer/cards/cardFilters/cardFilters.helpers";
import { TicketFilterType } from "@components/viewer/cards/cardFilters/cardFilters.types";
import { isJobsAndUsersProperty, getSelectOptions } from "@components/viewer/cards/cardFilters/filterForm/filterFormValues/filterFormValues.component";
import { Value } from "@components/viewer/cards/cardFilters/filterForm/filterFormValues/filterFormValues.styles";
import { getFilterFromEvent } from "@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers";
import { IChipSelectItem, ChipSelectItem } from "@controls/chip/chipSelect/chipSelect.component";
import { getStatusPropertyValues } from "@controls/chip/statusChip/statusChip.helpers";
import { FormNumberField, FormBooleanSelect, FormSelect, FormDateTime, FormJobsAndUsersSelect, FormMultiSelect, FormTextField } from "@controls/inputs/formInputs.component";
import { MultiSelectMenuItem } from "@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component";
import { MenuItem as SingleSelectMenuItem } from "@mui/material";
import { compact } from "lodash";

type InputFieldProps = {
	module: string;
	property: string;
	type: TicketFilterType;
	name: string;
	formError?: string;
};
export const BulkEditInputField = ({module, property, type, ...inputProps}: InputFieldProps) => {
	const { template: templateId, project: projectId } = useParams<DashboardTicketsParams>();
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(projectId, templateId);
	if (type === 'number') return <FormNumberField {...inputProps} />;
	if (type === 'boolean') return <FormBooleanSelect {...inputProps} />;
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
    if (type === 'status') {
		const values = getStatusPropertyValues(statusConfig);
		return (
			<FormSelect {...inputProps}>
				{Object.values(values).map(({ value, ...optionProps }: IChipSelectItem) => (
					<ChipSelectItem key={value} value={value} {...optionProps} />
				))}
			</FormSelect>
		);
	};
	if (isSelectType(type)) {
		const selectOptions = getSelectOptions(module, property, type);
		const SelectInput = type === 'manyOf' ? FormMultiSelect : FormSelect;
        const MenuItem = type === 'manyOf' ? MultiSelectMenuItem : SingleSelectMenuItem;
        return (
			<SelectInput {...inputProps}>
				{selectOptions.map(({ value }) => (
					<MenuItem key={value} value={value}>
						<Value>{value}</Value>
					</MenuItem>
				))}
			</SelectInput>
		)
    };
	return <FormTextField {...inputProps} />;
}