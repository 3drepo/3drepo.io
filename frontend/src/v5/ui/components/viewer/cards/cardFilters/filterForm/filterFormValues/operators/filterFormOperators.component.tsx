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

import { FormSelect } from '@controls/inputs/formInputs.component';
import { FILTER_OPERATOR_ICON, FILTER_OPERATOR_LABEL, getValidOperators } from '../../../cardFilters.helpers';
import { MenuItem } from '@mui/material';
import { CardFilterOperator } from '../../../cardFilters.types';
import { FilterIconContainer } from './filterFormOperators.styles';

const MenuItemContent = ({ operator }) => {
	const Icon = FILTER_OPERATOR_ICON[operator];
	const label = FILTER_OPERATOR_LABEL[operator];

	return (
		<>
			<FilterIconContainer>
				<Icon />
			</FilterIconContainer>
			{label}
		</>
	);
};

export const FilterFormOperators = ({ type }) => {
	const operators = getValidOperators(type);
	return (
		<FormSelect
			name='operator'
			renderValue={(op: CardFilterOperator) => FILTER_OPERATOR_LABEL[op]}
		>
			{operators.map((operator) => (
				<MenuItem value={operator} key={operator}>
					<MenuItemContent operator={operator} />
				</MenuItem>
			))}
		</FormSelect>
	);
};