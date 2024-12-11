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
import { isRangeOperator, isTextType } from '../../cardFilters.helpers';
import { FormNumberField, FormTextField } from '@controls/inputs/formInputs.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { useEffect, useRef } from 'react';
import { range } from 'lodash';
import { CardFilterType } from '../../cardFilters.types';
import { RangeInput } from './rangeInput/rangeInput.component';

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
	// Switching from a non-range to a range input type crashes the app
	// as the range input tries to access either the first or second value
	// of an array, whereas the non-range input type relies on string, and
	// so it tries to access [string].0
	const prevIsRangeOp = useRef(isRangeOp);
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
		prevIsRangeOp.current = isRangeOp;
	}, [isRangeOp]);

	if (maxFields === 0 || prevIsRangeOp.current !== isRangeOp) return null;

	if (type === 'number' || isTextType(type)) {
		const InputField = type === 'number' ? FormNumberField : FormTextField;

		if (maxFields === 1) return <InputField name={`${name}.0.value`} formError={!!error?.[0]} />;

		const getFieldContainerProps = (field, i) => ({
			key: field.id,
			onRemove: () => remove(i),
			disableRemove: fields.length === 1,
			onAdd: () => append(emptyValue),
			disableAdd: i !== (fields.length - 1),
		});
		if (isRangeOp) return (
			<>
				{fields.map((field, i) => (
					<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
						<RangeInput Input={InputField} name={`${name}.${i}.value`} error={error?.[i]?.value} />
					</ArrayFieldContainer>
				))}
			</>
		);
		return (
			<>
				{fields.map((field, i) => (
					<ArrayFieldContainer {...getFieldContainerProps(field, i)}>
						<InputField name={`${name}.${i}.value`} formError={!!error?.[i]} />
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