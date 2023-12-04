/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormNumberField, FormTextField } from '@controls/inputs/formInputs.component';
import { useEffect } from 'react';
import AddValueIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import RemoveValueIcon from '@assets/icons/outlined/remove_circle-outlined.svg';
import { OPERATIONS_TYPES } from '@/v5/store/tickets/tickets.types';
import { Gap } from '@controls/gap';
import { ValueIconContainer, ValuesContainer } from '../groupRulesInputs.styles';
import { IFormRule } from '../../groupRulesForm.helpers';

export const RuleValues = ({ disabled }) => {
	const { control, watch, formState: { errors } } = useFormContext<IFormRule>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'values',
	});

	const operator = watch('operator');
	const operationType = OPERATIONS_TYPES[operator];
	const error = errors.values || {};

	useEffect(() => () => remove(), [operationType]);

	useEffect(() => {
		if (!fields.length) {
			append({ value: '' });
		}
	}, [fields]);

	const FormValueField = ['text', 'regex'].includes(operationType) ? FormTextField : FormNumberField;

	// array value type
	if (['text', 'number'].includes(operationType)) {
		return (
			<>
				{fields.map((field, i) => (
					<ValuesContainer key={field.id}>
						<FormValueField name={`values.${i}.value`} formError={error?.[i]} disabled={disabled} />
						<ValueIconContainer onClick={() => remove(i)} disabled={disabled || fields.length === 1}>
							<RemoveValueIcon />
						</ValueIconContainer>
						<ValueIconContainer onClick={() => append({ value: '' })} disabled={disabled || i !== (fields.length - 1)}>
							<AddValueIcon />
						</ValueIconContainer>
					</ValuesContainer>
				))}
			</>
		);
	}

	// single value type
	if (['regex', 'numberComparison'].includes(operationType)) {
		return (<FormValueField name="values.0.value" formError={error?.[0]} disabled={disabled} />);
	}

	// range value type
	if (operationType === 'numberRange') {
		return (
			<ValuesContainer>
				<FormNumberField
					name="values.0.value"
					formError={error?.[0]}
					disabled={disabled}
				/>
				<FormNumberField
					name="values.1.value"
					formError={error?.[1]}
					disabled={disabled}
				/>
			</ValuesContainer>
		);
	}

	// field value type
	return (<Gap $height="2px" />);
};