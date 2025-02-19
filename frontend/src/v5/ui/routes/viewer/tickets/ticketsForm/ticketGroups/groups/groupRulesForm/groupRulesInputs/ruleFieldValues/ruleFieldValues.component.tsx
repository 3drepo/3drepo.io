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
import { useEffect, useState } from 'react';
import { range } from 'lodash';
import { IFormRule } from '../../groupRulesForm.helpers';
import { FieldValueInput } from './fieldValueInput/fieldValueInput.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';

export const RuleFieldValues = ({ disabled }) => {
	const name = 'field.values';
	const [autoFocus, setAutoFocus] = useState(false);
	const { control, watch, setValue } = useFormContext<IFormRule>();
	const { fields, append, remove } = useFieldArray({ control, name });

	const operator = watch('field.operator');

	const appendEmptyValue = () => {
		append({ value: '' });
		setAutoFocus(!!fields.length);
	};

	useEffect(() => {
		if (fields.length) return;
		appendEmptyValue();
	}, [fields]);

	useEffect(() => {
		if (operator === 'REGEX') {
			remove(range(1, fields.length));
		}
	}, [operator]);

	useEffect(() => () => { setValue(name, []); }, []);

	if (!operator) return (<></>);

	if (operator !== 'REGEX') {
		return (
			<>
				{fields.map((field, i) => (
					<ArrayFieldContainer
						key={field.id}
						onRemove={() => remove(i)}
						disableRemove={disabled || fields.length === 1}
						onAdd={appendEmptyValue}
						disableAdd={disabled || i !== (fields.length - 1)}
					>
						<FieldValueInput
							name={`field.values.${i}.value`}
							autoFocus={autoFocus}
							disabled={disabled}
						/>
					</ArrayFieldContainer>
				))}
			</>
		);
	}

	return (<FieldValueInput name="field.values.0.value" disabled={disabled}/>);
};
