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
import { isTextType } from '../../cardFilters.helpers';
import { FormNumberField, FormTextField } from '@controls/inputs/formInputs.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { useEffect } from 'react';
import { range } from 'lodash';
import { CardFilterType } from '../../cardFilters.types';

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
	
	useEffect(() => {
		if (maxFields === 0) {
			remove();
		} else if (!fields.length) {
			append({ value: '' });
		}
	}, [maxFields]);

	if (maxFields === 0) return null;

	if (type === 'number' || isTextType(type)) {
		const InputField = type === 'number' ? FormNumberField : FormTextField;

		if (maxFields === 1) return <InputField name={`${name}.0.value`} formError={!!error?.[0]} />;
		return (
			<>
				{fields.map((field, i) => (
					<ArrayFieldContainer
						key={field.id}
						onRemove={() => remove(i)}
						disableRemove={fields.length === 1}
						onAdd={() => append({ value: '' })}
						disableAdd={i !== (fields.length - 1)}
					>
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