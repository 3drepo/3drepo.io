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

import { Button } from '@controls/button';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormNumberField, FormTextField } from '@controls/inputs/formInputs.component';
import { formatMessage } from '@/v5/services/intl';
import { useEffect } from 'react';
import { ValuesContainer, HiddenFormTextField } from './filterValueField.styles';
import { IFilterForm, OPERATIONS_TYPES } from '../groupFiltersForm.helpers';

const VALUE_LABEL = formatMessage({ id: 'ticket.groups.value.label', defaultMessage: 'Value' });
export const FilterValueField = () => {
	const { control, watch, getValues } = useFormContext<IFilterForm>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'value',
	});

	const operation = watch('operation');
	const operationType = OPERATIONS_TYPES[operation];

	useEffect(() => { remove(); }, [operationType]);

	useEffect(() => {
		if (!fields.length) {
			append('');
		}
	}, [fields.length]);

	useEffect(() => () => console.log("CLOSING"), []);

	const FormValueField = ['text', 'regex'].includes(operationType) ? FormTextField : FormNumberField;

	// array value type
	if (['text', 'number'].includes(operationType)) {
		return (
			<>
				{fields.map((field, i) => (
					<ValuesContainer>
						<FormValueField label={VALUE_LABEL} name={`value.${i}`} key={field.id} required/>
						<Button variant="contained" onClick={() => remove(i)}>-</Button>
						<Button variant="contained" onClick={() => append(null)} disabled={i !== (fields.length-1)}>+</Button>
					</ValuesContainer>
				))}
				<Button onClick={() => console.log(getValues(), operationType)}>Log</Button>
			</>
		);
	}

	// single value type
	if (['regex', 'numberComparison'].includes(operationType)) {
		return (<FormValueField label={VALUE_LABEL} name="value" required />);
	}

	// range value type
	if (operationType === 'numberRange') {
		return (
			<ValuesContainer>
				<FormNumberField
					label={formatMessage({ id: 'ticket.groups.rangeValue1.label', defaultMessage: 'Value 1'})}
					name="value.0"
					required
				/>
				<FormNumberField
					label={formatMessage({ id: 'ticket.groups.rangeValue2.label', defaultMessage: 'Value 2'})}
					name="value.1"
					required
				/>
			</ValuesContainer>
		);
	}

	// empty
	return (<HiddenFormTextField label="" name="value.0" />);
};
