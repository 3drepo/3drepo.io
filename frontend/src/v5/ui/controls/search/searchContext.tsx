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

import { get, isString } from 'lodash';
import { createContext, useCallback, useEffect, useState } from 'react';
import { matchesQuery } from './searchContext.helpers';

export interface SearchContextType<T> {
	items: T[];
	filteredItems: T[];
	query: string;
	refresh?: () => void;
	setQuery: (query: string) => void;
}

const defaultValue: SearchContextType<any> = { items: [], filteredItems: [], query: '', setQuery: () => {} };
export const SearchContext = createContext(defaultValue);
SearchContext.displayName = 'SearchContext';

export interface SearchContextProps<T> {
	items: T[];
	children: any;
	fieldsToFilter?: string[];
	refresh?: () => void;
	filteringFunction?: (items: T[], query: string) => T[];
}

export const SearchContextComponent = ({ items, children, fieldsToFilter, filteringFunction }: SearchContextProps<any>) => {
	const [query, setQuery] = useState('');
	const [refreshFlag, setRefreshFlag] = useState(false);
	const refresh = useCallback(() => setRefreshFlag(!refreshFlag), [refreshFlag]);
	const [contextValue, setContextValue] = useState<SearchContextType<any>>({ items, filteredItems: items, query, setQuery, refresh });

	useEffect(() => {
		let filteredItems = items;
		if (filteringFunction) {
			filteredItems = filteringFunction(items || [], query);
		} else {
			filteredItems = (items || []).filter((item) => (fieldsToFilter || Object.keys(item)).some(
				(key) => {
					const property = get(item, key);
					if (!isString(property)) return false;
					return matchesQuery(property, query);
				},
			));
		}

		setContextValue({ items, filteredItems, query, setQuery, refresh });
	}, [query, items, refresh]);



	return (
		<SearchContext.Provider value={contextValue}>
			{children}
		</SearchContext.Provider>
	);
};
