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

import { useContext } from 'react';
import { FILTER_OPERATOR_ICON } from '../cardFilters.helpers';
import { CardFilterOperator, CardFilter } from '../cardFilters.types';
import { TicketFiltersContext } from '../../tickets/ticketFiltersContext';

// TODO - remove this
export const CardFiltersCreatorForm = () => {
	const { addFilter } = useContext(TicketFiltersContext);

	const handleAddFilter = (e) => {
		e.preventDefault();
		let value = e.target[1].value;
		const isDate = e.target[2].checked;
		const filterPath = e.target[0].value.split('.') as [string, CardFilterOperator, CardFilterOperator];
		if (filterPath.length !== 3) {
			alert("This will crash the app. Remeber: 'module'.'property'.'type'");
			return;
		}
		const [module, property, operator] = filterPath;
		if (!Object.keys(FILTER_OPERATOR_ICON).includes(operator)) {
			alert('This will crash the app. This operator is not supported');
			return;
		}
		const filter = { type: isDate ? 'date' : 'text', values: [isDate ? new Date(+value) : value] };
		addFilter({ module, property, operator, filter } as CardFilter);
	};

	return (
		<form onSubmit={handleAddFilter}>
			filter: <input name="filter" placeholder='module.property.type' />
			<br />
			value: <input name="value" placeholder='value' />
			<br />
			<label>
				is Date:
				<input type='checkbox' /> (if yes, convert to `new Date(+value)`)
			</label>
			<br />
			<button>[submit]</button>
		</form>
	);
};
