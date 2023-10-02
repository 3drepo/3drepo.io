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
import { useEffect } from 'react';
import AddValueIcon from '@assets/icons/outlined/add_circle-outlined.svg';
import RemoveValueIcon from '@assets/icons/outlined/remove_circle-outlined.svg';
import { range } from 'lodash';
import { ValueIconContainer, ValuesContainer } from '../groupRulesInputs.styles';
import { IFormRule } from '../../groupRulesForm.helpers';
import { FieldValueInput } from './fieldValueInput/fieldValueInput.component';

export const RuleFieldValues = () => {
	const { control, watch } = useFormContext<IFormRule>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'field.values',
	});

	const operator = watch('field.operator');

	const appendEmptyValue = () => append({ value: '' });

	useEffect(() => {
		if (fields.length) return;
		appendEmptyValue();
	}, [fields]);

	useEffect(() => {
		if (operator === 'REGEX') {
			range(1, fields.length).forEach(remove);
		}
	}, [operator]);

	if (!operator) return (<></>);

	if (operator !== 'REGEX') {
		return (
			<>
				{fields.map((field, i) => (
					<ValuesContainer key={field.id}>
						<FieldValueInput name={`field.values.${i}.value`} />
						<ValueIconContainer onClick={() => remove(i)} disabled={fields.length === 1}>
							<RemoveValueIcon />
						</ValueIconContainer>
						<ValueIconContainer onClick={appendEmptyValue} disabled={i !== (fields.length - 1)}>
							<AddValueIcon />
						</ValueIconContainer>
					</ValuesContainer>
				))}
			</>
		);
	}

	return (<FieldValueInput name="field.values.0.value" />);
};
