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
import { isEmpty } from 'lodash';
import { isDateType } from '../../cardFilters.helpers';
import { getOperatorMaxFieldsAllowed } from '../filterForm.helpers';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { DateRangeInput } from './rangeInput/dateRangeInput.component';
import { NumberRangeInput } from './rangeInput/numberRangeInput.component';
import { ArrayFields } from './filterFormValues.styles';
import {
	FIELD_ARRAY_NAME,
	FilterFormValuesComponentProps,
	FilterFormValuesForm,
	getDefaultValues,
	isOperatorDirty,
	mapFilterFormValuesToFilter,
} from './filterFormValues.helpers';
import { FilterFormActions } from './filterFormActions.component';
import { yupResolver } from '@hookform/resolvers/yup';
import { RangeFilterSchema } from '@/v5/validation/ticketSchemes/validators';

const EMPTY_RANGE_VALUE = { value: ['', ''] };

export const FilterFormRangeValues = ({
	module,
	property,
	type,
	filter,
	operator,
	cancelButton,
	onCancel,
	onSubmit,
}: FilterFormValuesComponentProps) => {
	const formData = useForm<FilterFormValuesForm>({
		defaultValues: getDefaultValues(filter, true),
		mode: 'onChange',
		resolver: yupResolver(RangeFilterSchema),
		context: { type, operator },
	});
	const { control, formState: { errors, dirtyFields, isValid }, reset } = formData;
	const { fields, append, remove } = useFieldArray({
		control,
		name: FIELD_ARRAY_NAME,
	});
	const error = errors.values || {};
	const maxFields = getOperatorMaxFieldsAllowed(operator);
	const RangeInput = isDateType(type) ? DateRangeInput : NumberRangeInput;
	const arrayFieldsRef = useRef(null);
	const arrayFieldsMaxHeight = window.innerHeight - arrayFieldsRef.current?.getBoundingClientRect()?.top - 60;
	const canSubmit = isValid && (!isEmpty(dirtyFields) || isOperatorDirty(filter, type, operator));
	const submitForm = formData.handleSubmit((filledForm) => onSubmit(
		mapFilterFormValuesToFilter(filledForm, module, property, type, operator),
	));
	const handleCancel = () => {
		reset();
		onCancel();
	};

	useEffect(() => {
		if (!isEmpty(dirtyFields)) {
			remove();
			return () => remove();
		}
	}, []);

	useEffect(() => {
		if (!fields.length && maxFields > 0) {
			append(EMPTY_RANGE_VALUE);
		}
	}, [fields.length, operator]);

	useEffect(() => {
		if (maxFields === 0) {
			remove();
		}
	}, [maxFields]);

	const getFieldContainerProps = (field, i) => ({
		key: field.id,
		onRemove: () => remove(i),
		disableRemove: fields.length === 1,
		onAdd: () => append(EMPTY_RANGE_VALUE),
		disableAdd: i !== (fields.length - 1),
	});

	return (
		<FormProvider {...formData}>
			<form onSubmit={submitForm}>
				<ArrayFields ref={arrayFieldsRef} maxHeight={arrayFieldsMaxHeight}>
					{fields.map((field, i) => (
						<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
							<RangeInput name={`${FIELD_ARRAY_NAME}.${i}.value`} formError={error?.[i]?.value} />
						</ArrayFieldContainer>
					))}
				</ArrayFields>
				<FilterFormActions canSubmit={canSubmit} cancelButton={cancelButton} onCancel={handleCancel} onSubmit={submitForm} />
			</form>
		</FormProvider>
	);
};
