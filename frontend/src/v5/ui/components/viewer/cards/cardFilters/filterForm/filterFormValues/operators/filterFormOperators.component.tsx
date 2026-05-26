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
import { FILTER_OPERATOR_ICON, getFilterOperatorLabels } from '../../../cardFilters.helpers';
import { getValidOperators } from '../../../filtersSelection/tickets/ticketFilters.helpers';
import { MenuItem } from '@mui/material';
import { TicketFilterOperator, TicketFilterType } from '../../../cardFilters.types';
import { FilterIconContainer } from './filterFormOperators.styles';

const MenuItemContent = ({ operator, type }) => {
	const Icon = FILTER_OPERATOR_ICON[operator];
	const label = getFilterOperatorLabels(type)[operator];

	return (
		<>
			<FilterIconContainer>
				<Icon />
			</FilterIconContainer>
			{label}
		</>
	);
};

type FilterFormOperatorsProps = { type: TicketFilterType };
export const FilterFormOperators = ({ type }: FilterFormOperatorsProps) => {
	const operators = getValidOperators(type);

	const renderValue = (op: TicketFilterOperator) => getFilterOperatorLabels(type)[op];

	return (
		<FormSelect
			name='operator'
			renderValue={renderValue}
		>
			{operators.map((operator) => (
				<MenuItem value={operator} key={operator}>
					<MenuItemContent operator={operator} type={type} />
				</MenuItem>
			))}
		</FormSelect>
	);
};