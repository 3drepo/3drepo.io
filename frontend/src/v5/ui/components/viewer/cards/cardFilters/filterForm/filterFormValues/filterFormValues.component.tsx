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
import { isRangeOperator, isTextType, isSelectType } from '../../cardFilters.helpers';
import { FormNumberField, FormTextField, FormSelect } from '@controls/inputs/formInputs.component';
import { ArrayFieldContainer } from '@controls/inputs/arrayFieldContainer/arrayFieldContainer.component';
import { useEffect } from 'react';
import { isArray, range } from 'lodash';
import { CardFilterType } from '../../cardFilters.types';
import { RangeInput } from './rangeInput/rangeInput.component';
import { MenuItem } from '@mui/material';
import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';

const name = 'values';
type FilterFolrmValuesType = {
	module: string,
	property: string,
	type: CardFilterType,
};

export const FilterFormValues = ({ module, property, type }: FilterFolrmValuesType) => {
	const { containerOrFederation } = useParams<ViewerParams>();
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
	const selectOptions = TicketsHooksSelectors.selectAllValuesByModuleAndProperty(containerOrFederation, module, property);

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
		
		// Switching from single-value to range inputs crashes the app as
		// the latter try to access either the value at the first or second index
		// of what they expect to be array but is a values instead, and the
		// useEffect that adapts fields' values to be arrays is async
		// and it is only called later
		// @ts-ignore
		if (isRangeOp && isArray(fields[0]?.value)) return (
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
	if (isSelectType(type)) {
		return (
			<FormSelect name={`${name}.0.value`} formError={!!error?.[0]?.value}>
				{selectOptions.map((val) => <MenuItem key={val} value={val}>{val}</MenuItem>)}
			</FormSelect>
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