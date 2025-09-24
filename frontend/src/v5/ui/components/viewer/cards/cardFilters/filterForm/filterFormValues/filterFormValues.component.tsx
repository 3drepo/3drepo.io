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
import { isRangeOperator, isTextType, isSelectType, isDateType, getTemplateProperty, useGetUsersAndJobs } from '../../cardFilters.helpers';
import { FormBooleanSelect, FormMultiSelect, FormDateTime, FormNumberField, FormTextField, FormJobsAndUsersSelect } from '@controls/inputs/formInputs.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { useEffect, useRef } from 'react';
import { compact, isArray, isEmpty, uniqBy } from 'lodash';
import { TicketFilterType } from '../../cardFilters.types';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { DateRangeInput } from './rangeInput/dateRangeInput.component';
import { NumberRangeInput } from './rangeInput/numberRangeInput.component';
import { mapFormArrayToArray, SelectOption } from '@/v5/helpers/form.helper';
import { getOptionFromValue, getFilterFromEvent, getFiltersFromJobsAndUsers } from '../../filtersSelection/tickets/ticketFilters.helpers';
import { ArrayFields, Value } from './filterFormValues.styles';
import { useTicketFiltersContext } from '../../ticketsFilters.context';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';

type FilterFormValuesProps = {
	module: string,
	property: string,
	type: TicketFilterType,
};

const getInputField = (type: TicketFilterType) => {
	if (type === 'number') return FormNumberField;
	if (isDateType(type)) return FormDateTime;
	return FormTextField;
};

const allValuesAre = (templates, module, property,  predefinedValues) => {
	const properties = templates.map((template) => getTemplateProperty(template, module, property)).filter(Boolean);
	return properties.length && properties.every(( { values } )=> values === predefinedValues );
}; 

export const isJobsAndUsersProperty = ( module, property, type) => {
	const { templates } = useTicketFiltersContext();
	return (type === 'owner') || allValuesAre(templates, module, property, 'jobsAndUsers' );
};


const getSelectOptions = (module, property, type): SelectOption[] => {
	let options = [];
	const { templates, modelsIds } = useTicketFiltersContext();

	if (type === 'template') {
		return templates.map((t) => ({ value: t.code, displayValue: t.name }));
	}

	const riskCategories = TicketsHooksSelectors.selectRiskCategories();
	const jobsAndUsers = getFiltersFromJobsAndUsers(useGetUsersAndJobs(modelsIds));

	if (type === 'owner') return jobsAndUsers;

	templates.forEach((template) => {
		const matchingProperty =  getTemplateProperty(template, module, property);
		if (!matchingProperty || !['manyOf', 'oneOf'].includes(matchingProperty.type)) return;
		switch (matchingProperty.values) {
			case 'riskCategories':
				options.push(...riskCategories.map((value) => ({ value })));
				break;
			case 'jobsAndUsers':
				options.push(...jobsAndUsers);
				break;
			default:
				options.push(...matchingProperty.values.map((value) => ({ value })));
		}
	});

	
	return uniqBy(options, (({ value }) => value) );
};

const name = 'values';
export const FilterFormValues = ({ module, property, type }: FilterFormValuesProps) => {
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
	const selectOptions = getSelectOptions(module, property, type);
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

	if (isJobsAndUsersProperty(module, property, type))  {
		return (
			<FormJobsAndUsersSelect
				multiple
				maxItems={19}
				name={name}
				transformInputValue={(v) => compact(mapFormArrayToArray(v))}
				transformOutputValue={(e) => getFilterFromEvent(e)}
				formError={error?.[0]}
				excludeJobs={(type === 'owner')}
				usersAndJobs={selectOptions.map(({ value }) => value)}
			/>
		);
	}

	if (isSelectType(type)) {


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
