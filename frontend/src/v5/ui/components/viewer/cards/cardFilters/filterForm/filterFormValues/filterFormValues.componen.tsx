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

import { useFormContext } from 'react-hook-form';
import { getOperatorMaxSupportedValues } from '../filterForm.helpers';
import { isTextType } from '../../cardFilters.helpers';
import { FilterFormTextValues } from './types/filterFormTextValues.component';
import { FormTextField } from '@controls/inputs/formInputs.component';

export const FilterFormValues = ({ type }) => {
	const { watch } = useFormContext();
	const formOperator = watch('operator');
	const valuesInputsCount = Math.min(getOperatorMaxSupportedValues(formOperator), 3);

	if (valuesInputsCount === 0) return null;

	if (isTextType) return (<FilterFormTextValues />);

	return (
		<>
			type not created yet: {type}
			{Array(valuesInputsCount).fill(0).map((i, index) => (
				<FormTextField name={`values.${index}`} />
			))}
		</>
	);
};