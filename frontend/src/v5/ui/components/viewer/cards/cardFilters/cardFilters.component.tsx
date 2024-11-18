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

export const CardFilters = () => {
	const [filters, setFilters] = useState({});
	
	const hasFilters = Object.keys(filters).length > 0;

	const onDeleteAllFilters = () => setFilters({});
	const onDeleteFilter = (module, property, type) => {
		const filter = [module, property, type].join('.');
		delete filters[filter];
		setFilters({ ...filters });
	};
	const addFilter = (filter: string, value?) => {
		if (filters[filter]?.length) {
			filters[filter].push(value);
		} else {
			filters[filter] = [value];
		}
		setFilters({ ...filters });
	};

	const handleAddFilter = (e) => {
		e.preventDefault();
		const filter = e.target[0].value;
		const value = e.target[1].value;
		addFilter(filter, value);
	};

	useEffect(() => {
		setFilters({
			'.property1.inRange': [[0, 4]],
			'.property1.notInRange': [[2, 3]],
			'.property2.equal': [0],
			'module1.property1.exist': [],
			'module1.property1.contain': [2, 3],
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
				<input name="filter" />
				<input name="val" />
				<button>submit</button>
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
