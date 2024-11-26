/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { get, isEmpty, set, unset } from 'lodash';
import { createContext, useState } from 'react';
import { CardFilterOperator, CardFilter } from '../cardFilters/cardFilters.types';

export interface TicketFiltersContextType {
	filters: Record<string, any>;
	addFilter: (filter: CardFilter) => void;
	editFilter: (filter: CardFilter, oldOperator: CardFilterOperator) => void;
	deleteFilter: (filter: Omit<CardFilter, 'filter'>) => void;
	deleteAllFilters: () => void;
}

const defaultValue: TicketFiltersContextType = {
	filters: {},
	addFilter: () => {},
	editFilter: () => {},
	deleteFilter: () => {},
	deleteAllFilters: () => {},
};
export const TicketFiltersContext = createContext(defaultValue);
TicketFiltersContext.displayName = 'TicketFiltersContext';

export interface TicketFiltersContextProps {
	filters: Record<string, any>;
	children: any;
}

export const TicketFiltersContextComponent = ({ filters: initialFilters, children }: TicketFiltersContextProps) => {
	const [filters, setFilters] = useState(initialFilters);

	// delete filter and recursiverly delete parent entry if empty
	const deleteFilterAndEmptyAncestors = (fltrs, path) => {
		do {
			unset(fltrs, path);
			path.pop();
		} while (path.length && isEmpty(get(fltrs, path)));
	};
	
	const addFilter = ({ module, property, operator, filter }: CardFilter) => {
		let newFilters = { ...filters };
		const path = [module, property, operator];
		set(newFilters, path, filter);
		setFilters({ ...newFilters });
	};

	const editFilter = ({ module, property, operator, filter }: CardFilter, oldOperator?: CardFilterOperator) => {
		let newFilters = { ...filters };
		const path = [module, property, operator];
		set(newFilters, path, filter);
		if (operator !== oldOperator) {
			const oldPath = [module, property, oldOperator];
			deleteFilterAndEmptyAncestors(newFilters, oldPath);
		}
		setFilters({ ...newFilters });
	};

	const deleteFilter = ({ module, property, operator }: CardFilter) => {
		const newFilters = { ...filters };
		const path = [module, property, operator];
		deleteFilterAndEmptyAncestors(newFilters, path);
		setFilters(newFilters);
	};
	
	const handleDeleteAllFilters = () => setFilters({});

	return (
		<TicketFiltersContext.Provider value={{
			filters,
			addFilter: addFilter,
			editFilter: editFilter,
			deleteFilter: deleteFilter,
			deleteAllFilters: handleDeleteAllFilters,
		}}>
			{children}
		</TicketFiltersContext.Provider>
	);
};
