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

import { get, isEmpty, isString } from 'lodash';
import { createContext, useEffect, useState } from 'react';

export interface SearchContextType<T> {
	items: T[];
	filteredItems: T[];
	queries: string[];
	setQueries: (queries: string[]) => void;
}

const defaultValue: SearchContextType<any> = { items: [], filteredItems: [], queries: [], setQueries: () => {} };
export const SearchContext = createContext(defaultValue);
SearchContext.displayName = 'SearchContext';

export interface Props {
	items: any[];
	children: any;
	fieldsToFilter?: string[];
	filteringFunction?: <T>(items: T[], queries: string[]) => T[];
}

export const SearchContextComponent = ({ items, children, fieldsToFilter, filteringFunction }: Props) => {
	const [queries, setQueries] = useState([]);
	const [contextValue, setContextValue] = useState({ items, filteredItems: items, queries, setQueries });

	useEffect(() => {
		let filteredItems = items;
		if (filteringFunction) {
			filteredItems = filteringFunction(items || [], queries);
		} else {
			filteredItems = (items || []).filter((item) => (fieldsToFilter || Object.keys(item)).some(
				(key) => {
					const property = get(item, key);
					if (!isString(property)) return false;
					if (isEmpty(queries)) return true;
					return queries.some((query) => property.toLowerCase().includes(query.toLowerCase()));
				},
			));
		}

		setContextValue({ items, filteredItems, queries, setQueries });
	}, [queries, items]);

	return (
		<SearchContext.Provider value={contextValue}>
			{children}
		</SearchContext.Provider>
	);
};
