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
import { FormBooleanSelect, FormMultiSelect, FormDateTime, FormNumberField, FormTextField, FormJobsAndUsersSelect } from '@controls/inputs/formInputs.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { useEffect, useRef } from 'react';
import { compact, isArray, isEmpty } from 'lodash';
import { CardFilterType } from '../../cardFilters.types';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { DateRangeInput } from './rangeInput/dateRangeInput.component';
import { NumberRangeInput } from './rangeInput/numberRangeInput.component';
import { mapFormArrayToArray } from '@/v5/helpers/form.helper';
import { getOptionFromValue, getFilterFromEvent } from '../../filtersSelection/tickets/ticketFilters.helpers';
import { ArrayFields, Value } from './filterFormValues.styles';
import { useSelectedModelsIds } from '@/v5/ui/routes/dashboard/projects/tickets/ticketsTable/newTicketMenu/useSelectedModels';

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
	const availableTemplateIds = TicketsHooksSelectors.selectFilterableTemplatesIds();
	const containersAndFederations = useSelectedModelsIds();
	const { setValue, control, watch, formState: { errors, dirtyFields } } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name,
	});
	const error = errors.values || {};
	const operator = watch('operator');

	const maxFields = getOperatorMaxFieldsAllowed(operator);
	const isRangeOp = isRangeOperator(operator);
	const emptyValue = { value: (isRangeOp ? ['', ''] : '') };
	let selectOptions = [];

	if (type === 'template') {
		selectOptions = TicketsHooksSelectors.selectTemplatesByIds(availableTemplateIds).map(({ code: value, name: displayValue }) => ({ value, displayValue, type: 'template' }));
	} else if (isSelectType(type)) {
		selectOptions = TicketsCardHooksSelectors.selectPropertyOptions(
			availableTemplateIds,
			containersAndFederations,
			module,
			property,
		);
	}
	const arrayFieldsRef = useRef(null);
	const arrayFieldsMaxHeight = window.innerHeight - arrayFieldsRef.current?.getBoundingClientRect()?.top - 60;

	useEffect(() => {
		if (!isEmpty(dirtyFields)) {
			remove();
			return () => remove();
		}
	}, [isRangeOp]);

	useEffect(() => {
		setValue('selectOptions', selectOptions);
	}, [selectOptions]);

	useEffect(() => {
		if (!fields.length && maxFields > 0 && !isSelectType(type)) {
			append(emptyValue);
		}
	}, [fields.length, operator]);
	
	useEffect(() => {
		if (maxFields === 0) {
			remove();
		}
	}, [maxFields]);

	if (maxFields === 0) return null;

	if (type === 'number' || isDateType(type) || isTextType(type)) {
		const InputField = getInputField(type);

		if (maxFields === 1) return <InputField key={fields[0]?.id} name={`${name}.0.value`} formError={error?.[0]?.value} />;

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
				<ArrayFields ref={arrayFieldsRef} maxHeight={arrayFieldsMaxHeight}>
					{fields.map((field, i) => (
						<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
							<RangeInput name={`${name}.${i}.value`} formError={error?.[i]?.value} />
						</ArrayFieldContainer>
					))}
				</ ArrayFields>
			);
		}
		return (
			<ArrayFields ref={arrayFieldsRef} maxHeight={arrayFieldsMaxHeight}>
				{fields.map((field, i) => (
					<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
						<InputField name={`${name}.${i}.value`} formError={error?.[i]?.value} />
					</ArrayFieldContainer>
				))}
			</ ArrayFields>
		);
	}

	if (isSelectType(type) && selectOptions.length) {
		const allJobsAndUsers = selectOptions.every(({ type: t }) => t === 'jobsAndUsers');
		if (allJobsAndUsers) return (
			<FormJobsAndUsersSelect
				multiple
				excludeJobs={type === 'owner'}
				maxItems={19}
				name={name}
				transformInputValue={(v) => compact(mapFormArrayToArray(v))}
				transformOutputValue={(e) =>  getFilterFromEvent(e)}
				formError={error?.[0]}
			/>
		);
		return (
			<FormMultiSelect
				name={name}
				transformInputValue={mapFormArrayToArray}
				transformOutputValue={(e) => getFilterFromEvent(e)}
				renderValue={(values: string[]) => values.map((value) => getOptionFromValue(value, selectOptions)?.displayValue ?? value).join(', ')}
				formError={error?.[0]}
			>
				{selectOptions.map(
					(option) => (
						<MultiSelectMenuItem key={option.value} value={option.value}>
							<Value>
								{option.displayValue ?? option.value}
							</Value>
						</MultiSelectMenuItem>
					),
				)}
			</FormMultiSelect>
		);
	}

	if (type === 'boolean') return (<FormBooleanSelect key={fields[0]?.id} name={`${name}.0.value`} />);

	return (
		<>
			type not created yet: {type}
			<FormTextField name={`${name}.0.value`} />
		</>
	);
};
