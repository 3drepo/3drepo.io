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

import { useEffect, useState } from 'react';
import { TicketsFiltersList } from '../tickets/ticketsFiltersList/ticketsFiltersList.component';
import { set } from 'lodash';
import { CardFilterOperator } from './cardFilters.types';
import { FILTER_OPERATOR_ICON, getOperatorMaxValuesSupported } from './cardFilters.helpers';

export const CardFilters = () => {
	const [filters, setFilters] = useState({});
	
	const hasFilters = Object.keys(filters).length > 0;

	const onDeleteAllFilters = () => setFilters({});
	const onDeleteFilter = (module, property, type) => {
		const filter = [module, property, type].join('.');
		delete filters[filter];
		setFilters({ ...filters });
	};
	const addFilter = (filter: string, value?: string | number | Date) => {
		const operator = filter.split('.').at(-1) as CardFilterOperator;
		switch (getOperatorMaxValuesSupported(operator)) {
			case 0:
				filters[filter] = [];
				break;
			case 1:
				filters[filter] = [value];
				break;
			default:
				filters[filter] ||= [];
				filters[filter].push(value);
		}
		setFilters({ ...filters });
	};

	const handleAddFilter = (e) => {
		e.preventDefault();
		const filter = e.target[0].value;
		const value = e.target[1].value;
		const isDate = e.target[2].checked;
		if  (filter.split('.').length !== 3 || !Object.keys(FILTER_OPERATOR_ICON).includes(filter.split('.').at(-1))) {
			alert("this will crash the app. Remeber: 'module'.'property'.'type' (the latter from the existing ones)");
			return;
		}
		addFilter(filter, isDate ? new Date(value) : value);
	};

	useEffect(() => {
		setFilters({
			'.property1.rng': [new Date('12/12/2024'), new Date('12/20/2024')],
			'.assignees.ss': ['Ale', 'San', 'Dan'],
			'.property2.eq': [0],
			'.porpertyThatLooksVeryLong.eq': [1],
			'.porpertyThatLooksVeryLongs.eq': [11231231231231],
			'.porpertyThatLooksVeryLongsa.eq': [0, 1],
			'module1.property1.ex': [],
			'module1.property1.ss': [2, 3],
		});
	}, []);

	const getFiltersDictionary = () => {
		const filtersDict = {};
		Object.entries(filters).forEach(([key, values]) => set(filtersDict, key, values));
		return filtersDict;
	};

	return (
		<>
			<form onSubmit={handleAddFilter}>
				filter: <input name="filter" placeholder='module.property.type' />
				<br />
				value: <input name="value" placeholder='value'/>
				<br />
				<label>
					is Date:
					<input type='checkbox' /> (if yes, convert to `new Date(value)`)
				</label>
				<br />
				<button>[submit]</button>
			</form>
			{hasFilters && (
				<TicketsFiltersList
					filters={getFiltersDictionary()}
					onDeleteAllFilters={onDeleteAllFilters}
					onDeleteFilter={onDeleteFilter}
				/>
			)}
		</>
	);
};
