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
import { getOperatorMaxSupportedValues } from '../../filterForm.helpers';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { FormTextField } from '@controls/inputs/formInputs.component';
import { useEffect } from 'react';

export const FilterFormTextValues = () => {
	const { control, watch, formState: { errors } } = useFormContext();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'values',
	});
	const error = errors.values || {};
	const formOperator = watch('operator');
	const maxValues = getOperatorMaxSupportedValues(formOperator);

	useEffect(() => {
		if (!fields.length) {
			append({ value: '' });
		}
	}, [fields]);
	
	if (maxValues === 1) return <FormTextField name="values.0.value" formError={!!error?.[0]} />;

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
					<FormTextField name={`values.${i}.value`} formError={!!error?.[i]} />
				</ArrayFieldContainer>
			))}
		</>
	);
};