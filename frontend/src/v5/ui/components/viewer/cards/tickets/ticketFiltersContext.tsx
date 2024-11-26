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
import { CardFilter } from '../cardFilters/cardFilters.types';

export interface TicketFiltersContextType {
	filters: Record<string, any>;
	upsertFilter: (filter: CardFilter) => void;
	deleteFilter: (filter: Omit<CardFilter, 'filter'>) => void;
	deleteAllFilters: () => void;
}

const defaultValue: TicketFiltersContextType = {
	filters: {},
	upsertFilter: () => {},
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
		
	const upsertFilter = ({ module, property, type, filter }: CardFilter) => {
		let newFilters = { ...filters };
		const path = [module, property, type];
		set(newFilters, path, filter);
		setFilters({ ...newFilters });
	};
	
	const deleteFilter = ({ module, property, type }: CardFilter) => {
		const newFilters = { ...filters };
		const path = [module, property, type];
		deleteFilterAndEmptyAncestors(newFilters, path);
		setFilters(newFilters);
	};
		
	const deleteAllFilters = () => setFilters({});

	return (
		<TicketFiltersContext.Provider value={{
			filters,
			upsertFilter,
			deleteFilter,
			deleteAllFilters,
		}}>
			{children}
		</TicketFiltersContext.Provider>
	);
};
