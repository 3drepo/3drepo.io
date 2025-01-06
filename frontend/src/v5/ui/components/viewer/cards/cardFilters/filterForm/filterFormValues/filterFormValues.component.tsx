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
import { isRangeOperator, isDateType, isTextType } from '../../cardFilters.helpers';
import { FormDateTime, FormNumberField, FormTextField } from '@controls/inputs/formInputs.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { useEffect } from 'react';
import { isArray, range } from 'lodash';
import { CardFilterType } from '../../cardFilters.types';
import { RangeInput } from './rangeInput/rangeInput.component';
import { DateRangeInput } from './rangeInput/dateRangeInput.component';

const getInputField = (type: CardFilterType) => {
	switch (type) {
		case 'number': return FormNumberField;
		case 'date': return FormDateTime;
		default: return FormTextField;
	}
};

const name = 'values';
export const FilterFormValues = ({ type }: { type: CardFilterType }) => {
	const { control, watch, formState: { errors } } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name,
	});
	const error = errors.values || {};
	const operator = watch('operator');
	const maxFields = getOperatorMaxFieldsAllowed(operator);
	const isRangeOp = isRangeOperator(operator);
	const emptyValue = { value: isRangeOp ? ['', ''] : '' };

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
		remove();
	}, [isRangeOp]);

	if (maxFields === 0) return null;

	if (type === 'number' || isDateType(type) || isTextType(type)) {
		const InputField = getInputField(type);

		if (maxFields === 1) return <InputField name={`${name}.0.value`} formError={error?.[0]} />;

		const getFieldContainerProps = (field, i, err) => ({
			key: field.id,
			onRemove: () => remove(i),
			disableRemove: fields.length === 1,
			onAdd: () => append(emptyValue),
			disableAdd: i !== (fields.length - 1),
			error: err,
		});
		
		// Switching from single-value to range inputs crashes the app as
		// the latter try to access either the value at the first or second index
		// of what they expect to be array but is a values instead, and the
		// useEffect that adapts fields' values to be arrays is async
		// and it is only called later
		// @ts-ignore
		if (isRangeOp && isArray(fields[0]?.value)) {
			if (isDateType(type)) return (
				<>
					{fields.map((field, i) => (
						<ArrayFieldContainer {...getFieldContainerProps(field, i, !!error?.[i]?.value)}>
							<DateRangeInput name={`${name}.${i}.value`} formError={error?.[i]?.value} />
						</ArrayFieldContainer>
					))}
				</>
			);
			return (
				<>
					{fields.map((field, i) => (
						<ArrayFieldContainer {...getFieldContainerProps(field, i, !!error?.[i]?.value)}>
							<RangeInput Input={InputField} name={`${name}.${i}.value`} formError={error?.[i]?.value} />
						</ArrayFieldContainer>
					))}
				</>
			);
		}
		return (
			<>
				{fields.map((field, i) => (
					<ArrayFieldContainer {...getFieldContainerProps(field, i, !!error?.[i]?.value)}>
						<InputField name={`${name}.${i}.value`} formError={error?.[i]?.value} />
					</ArrayFieldContainer>
				))}
			</>
		);
	}

	return (
		<>
			type not created yet: {type}
			{range(0, Math.min(maxFields, 3)).map((i) => (
				<FormTextField name={`values.${i}.value`} />
			))}
		</>
	);
};