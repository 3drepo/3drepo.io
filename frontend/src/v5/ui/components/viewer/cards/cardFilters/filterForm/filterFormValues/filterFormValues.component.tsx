/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { useFieldArray, useFormContext } from 'react-hook-form';
import { getOperatorMaxFieldsAllowed } from '../filterForm.helpers';
import { isRangeOperator, isTextType, isSelectType, isDateType } from '../../cardFilters.helpers';
import { FormBooleanSelect, FormMultiSelect, FormDateTime, FormNumberField, FormTextField, FormAssigneesSelect } from '@controls/inputs/formInputs.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { useEffect } from 'react';
import { compact, isArray, isEmpty } from 'lodash';
import { CardFilterType } from '../../cardFilters.types';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { DateRangeInput } from './rangeInput/dateRangeInput.component';
import { NumberRangeInput } from './rangeInput/numberRangeInput.component';
import { mapArrayToFormArray, mapFormArrayToArray } from '@/v5/helpers/form.helper';
import { getOptionFromValue, selectTypeOnChange } from '../../filtersSelection/tickets/ticketFilters.helpers';

type FilterFormValuesProps = {
	module: string,
	property: string,
	type: CardFilterType,
};

const getInputField = (type: CardFilterType) => {
	if (type === 'number') return FormNumberField;
	if (isDateType(type)) return FormDateTime;
	return FormTextField;
};

const name = 'values';
export const FilterFormValues = ({ module, property, type }: FilterFormValuesProps) => {
	if (!property) return null;
	const { containerOrFederation } = useParams<ViewerParams>();
	const { control, watch, formState: { errors, dirtyFields } } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name,
	});
	const error = errors.values || {};
	const operator = watch('operator');
	
	const maxFields = getOperatorMaxFieldsAllowed(operator);
	const isRangeOp = isRangeOperator(operator);
	const emptyValue = { value: (isRangeOp ? ['', ''] : '') };
	const selectOptions = type === 'template' ?
		TicketsCardHooksSelectors.selectTemplatesWithTickets();
		: TicketsCardHooksSelectors.selectPropertyOptions(containerOrFederation, module, property);

	useEffect(() => {
		if (!fields.length && maxFields > 0) {
			append(emptyValue);
		}
	}, [fields.length, operator]);
	
	useEffect(() => {
		if (maxFields === 0) {
			remove();
		}
	}, [maxFields]);

	useEffect(() => {
		if (!isEmpty(dirtyFields)) {
			remove();
		}
	}, [isRangeOp]);

	if (maxFields === 0) return null;

	if (type === 'number' || isDateType(type) || isTextType(type)) {
		const InputField = getInputField(type);

		if (maxFields === 1) return <InputField name={`${name}.0.value`} formError={error?.[0]} />;

		const getFieldContainerProps = (field, i) => ({
			key: field.id,
			onRemove: () => remove(i),
			disableRemove: fields.length === 1,
			onAdd: () => append(emptyValue),
			disableAdd: i !== (fields.length - 1),
		});
		
		// Switching from single-value to range inputs crashes the app as
		// the latter try to access either the value at the first or second index
		// of what they expect to be array but is a values instead, and the
		// useEffect that adapts fields' values to be arrays is async
		// and it is only called later
		// @ts-ignore
		if (isRangeOp && isArray(fields[0]?.value)) {
			const RangeInput = isDateType(type) ? DateRangeInput : NumberRangeInput;
			return (
				<>
					{fields.map((field, i) => (
						<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
							<RangeInput name={`${name}.${i}.value`} formError={error?.[i]?.value} />
						</ArrayFieldContainer>
					))}
				</>
			);
		}
		return (
			<>
				{fields.map((field, i) => (
					<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
						<InputField name={`${name}.${i}.value`} formError={error?.[i]?.value} />
					</ArrayFieldContainer>
				))}
			</>
		);
	}

	if (isSelectType(type)) {
		const allJobsAndUsers = selectOptions.every(({ type: t }) => t === 'jobsAndUsers');
		if (allJobsAndUsers || type === 'owner') return (
			<FormAssigneesSelect
				multiple
				showAddButton
				maxItems={19}
				name={name}
				transformInputValue={(v) => compact(mapFormArrayToArray(v))}
				transformOutputValue={(e) => selectTypeOnChange(e, selectOptions)}
				formError={error?.[0]}
			/>
		);
		return (
			<FormMultiSelect
				name={name}
				transformInputValue={mapFormArrayToArray}
				transformOutputValue={(e) => selectTypeOnChange(e, selectOptions)}
				renderValue={(values: string[]) => values.map((value) => getOptionFromValue(value, selectOptions)?.displayValue ?? value).join(', ')}
				formError={error?.[0]}
			>
				{(selectOptions || []).map(
					(option) => <MultiSelectMenuItem key={option.value} value={option.value}>{option.displayValue ?? option.value}</MultiSelectMenuItem>,
				)}
			</FormMultiSelect>
		);
	}

	if (type === 'boolean') return (<FormBooleanSelect name={`${name}.0.value`} />);

	return (
		<>
			type not created yet: {type}
			<FormTextField name={`${name}.0.value`} />
		</>
	);
};
