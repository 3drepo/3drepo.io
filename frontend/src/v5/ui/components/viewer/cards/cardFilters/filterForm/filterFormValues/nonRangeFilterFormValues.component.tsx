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

import { useEffect, useRef } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { compact, isEmpty } from 'lodash';
import { mapFormArrayToArray } from '@/v5/helpers/form.helper';
import { isDateType, isSelectType, isTextType } from '../../cardFilters.helpers';
import { getOperatorMaxFieldsAllowed } from '../filterForm.helpers';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { FormBooleanSelect, FormJobsAndUsersSelect, FormMultiSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { getFilterFromEvent, getOptionFromValue, arrToDisplayValue } from '../../filtersSelection/tickets/ticketFilters.helpers';
import { FederationsHooksSelectors, ContainersHooksSelectors } from '@/v5/services/selectorsHooks';
import { useTicketFiltersContext } from '../../ticketsFilters.context';
import { ArrayFields, Value } from './filterFormValues.styles';
import {
	FIELD_ARRAY_NAME,
	FilterFormValuesForm,
	FilterFormValuesComponentProps,
	getDefaultValues,
	getIsJobsAndUsersProperty,
	getInputField,
	getSelectOptions,
	isOperatorDirty,
	mapFilterFormValuesToFilter,
} from './filterFormValues.helpers';
import { FilterFormActions } from './filterFormActions.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { NonRangeFilterSchema } from '@/v5/validation/ticketSchemes/validators';

const EMPTY_VALUE = { value: '' };

export const FilterFormNonRangeValues = ({
	module,
	property,
	type,
	filter,
	operator,
	cancelButton,
	onCancel,
	onSubmit,
}: FilterFormValuesComponentProps) => {
	const { templates, modelsIds } = useTicketFiltersContext();

	const formData = useForm<FilterFormValuesForm>({
		defaultValues: getDefaultValues(filter, false),
		mode: 'onChange',
		resolver: yupResolver(NonRangeFilterSchema),
		context: { type, operator },
	});
	const { setValue, control, formState: { errors, dirtyFields, isValid }, reset } = formData;
	const { fields, append, remove } = useFieldArray({
		control,
		name: FIELD_ARRAY_NAME,
	});
	const error = errors.values || {};

	// This is for triggering a new re render if these federations or containers change
	// in order to have the latests users/jobs
	FederationsHooksSelectors.selectFederations();
	ContainersHooksSelectors.selectContainers();

	const maxFields = getOperatorMaxFieldsAllowed(operator);
	const selectOptions = getSelectOptions(module, property, type, templates, modelsIds);
	const isJobsAndUsers = getIsJobsAndUsersProperty(templates, module, property, type);
	const arrayFieldsRef = useRef(null);
	const arrayFieldsMaxHeight = window.innerHeight - arrayFieldsRef.current?.getBoundingClientRect()?.top - 60;
	const canSubmit = isValid && (!isEmpty(dirtyFields) || isOperatorDirty(filter, type, operator));
	const submitForm = formData.handleSubmit((filledForm) => onSubmit(
		mapFilterFormValuesToFilter(filledForm, module, property, type, operator),
	));

	useEffect(() => {
		setValue('selectOptions', selectOptions);
	}, [selectOptions]);

	useEffect(() => {
		if (!fields.length && maxFields > 0 && !isSelectType(type)) {
			append(EMPTY_VALUE);
		}
	}, [fields.length, operator]);

	useEffect(() => {
		if (maxFields === 0) {
			remove();
		}
	}, [maxFields]);

	const renderFields = () => {
		if (!property || maxFields === 0) return null;

		if (type === 'number' || isDateType(type) || isTextType(type)) {
			const InputField = getInputField(type);

			if (maxFields === 1) return <InputField key={fields[0]?.id} name={`${FIELD_ARRAY_NAME}.0.value`} formError={error?.[0]?.value} />;

			const getFieldContainerProps = (field, i) => ({
				key: field.id,
				onRemove: () => remove(i),
				disableRemove: fields.length === 1,
				onAdd: () => append(EMPTY_VALUE),
				disableAdd: i !== (fields.length - 1),
			});

			return (
				<ArrayFields ref={arrayFieldsRef} maxHeight={arrayFieldsMaxHeight}>
					{fields.map((field, i) => (
						<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
							<InputField name={`${FIELD_ARRAY_NAME}.${i}.value`} formError={error?.[i]?.value} />
						</ArrayFieldContainer>
					))}
				</ArrayFields>
			);
		}

		if (isJobsAndUsers) {
			return (
				<FormJobsAndUsersSelect
					multiple
					maxItems={19}
					name={FIELD_ARRAY_NAME}
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
					name={FIELD_ARRAY_NAME}
					transformInputValue={mapFormArrayToArray}
					transformOutputValue={(e) => getFilterFromEvent(e)}
					renderValue={(values: string[]) => arrToDisplayValue(
						values.map((value) => getOptionFromValue(value, selectOptions)?.displayValue ?? value),
					)}
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

		if (type === 'boolean') return (<FormBooleanSelect key={fields[0]?.id} name={`${FIELD_ARRAY_NAME}.0.value`} />);

		return (
			<>
				type not created yet: {type}
				<FormTextField name={`${FIELD_ARRAY_NAME}.0.value`} />
			</>
		);
	};

	return (
		<>
			<FormProvider {...formData}>
				<form>
					{renderFields()}
				</form>
			</FormProvider>
			<FilterFormActions canSubmit={canSubmit} cancelButton={cancelButton} onCancel={onCancel} onSubmit={submitForm} />
		</>
	);
};
