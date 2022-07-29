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

import { isString } from 'lodash';
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

export interface Props {
	items: any[];
	children: any;
	fieldsToFilter?: string[];
	filteringFunction?: <T>(items: T[], query: string) => T[];
}

export const SearchContextComponent = ({ items, children, fieldsToFilter, filteringFunction }: Props) => {
	const [query, setQuery] = useState('');
	const [contextValue, setContextValue] = useState({ items, filteredItems: items, query, setQuery });

	useEffect(() => {
		let filteredItems = items;
		if (filteringFunction) {
			filteredItems = filteringFunction(items || [], query);
		} else {
			filteredItems = (items || []).filter((item) => (fieldsToFilter || Object.keys(item)).some(
				(key) => {
					if (!isString(item[key])) return false;
					return item[key].toLowerCase().includes(query.toLowerCase());
				},
			));
		}

		setContextValue({ items, filteredItems, query, setQuery });
	}, [query, items]);

	return (
		<SearchContext.Provider value={contextValue}>
			{children}
		</SearchContext.Provider>
	);
};
