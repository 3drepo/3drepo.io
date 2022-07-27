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

import { createContext, useEffect, useState } from 'react';

export interface SearchContextType {
	items: any[];
	filteredItems: any[];
	query: string;
	setQuery: (query: string) => void
}

const defaultValue: SearchContextType = { items: [], filteredItems: [], query: '', setQuery: () => {} };

export const SearchContext = createContext(defaultValue);
SearchContext.displayName = 'SearchContext';

export const SearchContextComponent = ({ items, children }) => {
	const [query, setQuery] = useState('');
	const [filteredItems, setFilteredItems] = useState([]);

	useEffect(() => {
		setFilteredItems(items.filter((item) => Object.keys(item).some((key) => item[key].includes(query))));
	}, [query, items]);

	return (
		<SearchContext.Provider value={{ items, filteredItems, query, setQuery }}>
			{children}
		</SearchContext.Provider>
	);
};
