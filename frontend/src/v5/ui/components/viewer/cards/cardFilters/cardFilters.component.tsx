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
import { CardFilter, CardFilterOperator, CardFiltersByOperator } from './cardFilters.types';
import { FILTER_OPERATOR_ICON, getOperatorMaxValuesSupported } from './cardFilters.helpers';
import { get, set } from 'lodash';

export const CardFilters = () => {
	const [filters, setFilters] = useState<Record<string, Record<string, CardFiltersByOperator>>>({});
	
	const hasFilters = Object.keys(filters).length > 0;

	const onDeleteAllFilters = () => setFilters({});
	const onDeleteFilter = (module: string, property: string, operator: CardFilterOperator) => {
		const newFilters = { ...filters };
		delete newFilters[module][property][operator];
		if (!Object.values(newFilters[module][property]).length) {
			delete newFilters[module][property];
			if (!Object.values(newFilters[module]).length) {
				delete newFilters[module];
			}
		}
		setFilters(newFilters);
	};
	const addFilter = (module: string, property: string, operator: CardFilterOperator, filter: CardFilter) => {
		const filterPath = [module, property, operator];
		set(filters, filterPath, filter);
		setFilters({ ...filters });
	};

	// TODO - remove this
	const handleAddFilter = (e) => {
		e.preventDefault();
		const filter = e.target[0].value;
		let value = e.target[1].value;
		const isDate = e.target[2].checked;
		const filterPath = filter.split('.') as [string, string, CardFilterOperator];
		if  (filterPath.length !== 3) {
			alert("This will crash the app. Remeber: 'module'.'property'.'type'");
			return;
		}
		const operator = filterPath.at(-1);
		if  (!Object.keys(FILTER_OPERATOR_ICON).includes(operator)) {
			alert('This will crash the app. This operator is not supported');
			return;
		}
		switch (getOperatorMaxValuesSupported(operator as CardFilterOperator)) {
			case 0:
				value = [];
				break;
			case 1:
				value = [value];
			default:
				const currentVal = get(filters, [...filterPath, 'values'], []);
				value = currentVal.concat(value);
		}
		addFilter(...filterPath, { type: isDate ? 'date' : 'text', values: isDate ? new Date(+value) : value });
	};

	// TODO - remove this
	useEffect(() => {
		setFilters({
			'': {
				'createdAt': {
					'eq': {
						values: [new Date('12/12/2024')],
						type: 'pastDate',
					},
				},
				'property1': {
					'rng': {
						values: [new Date('12/12/2024'), new Date('12/20/2024')],
						type: 'date',
					},
					'nrng': {
						values: [3],
						type: 'number',
					},
				},
				'property2': {
					'eq': {
						values: [4],
						type: 'number',
					},
				},
				'assignees': {
					'ss': {
						values: ['Ale', 'San', 'Dan'],
						type: 'manyOf',
					},
				},
			},
			'module1': {
				'property1': {
					'ex': { values: [] },
					'ss': {
						values: [2, 3],
						type: 'oneOf',
					},
				},
			},
		});
	}, []);

	return (
		<>
			<form onSubmit={handleAddFilter}>
				filter: <input name="filter" placeholder='module.property.type' />
				<br />
				value: <input name="value" placeholder='value'/>
				<br />
				<label>
					is Date:
					<input type='checkbox' /> (if yes, convert to `new Date(+value)`)
				</label>
				<br />
				<button>[submit]</button>
			</form>
			{hasFilters && (
				<TicketsFiltersList
					filters={filters}
					onDeleteAllFilters={onDeleteAllFilters}
					onDeleteFilter={onDeleteFilter}
				/>
			)}
		</>
	);
};
