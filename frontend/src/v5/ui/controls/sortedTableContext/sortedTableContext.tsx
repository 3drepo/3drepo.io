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

import { get, orderBy } from 'lodash';
import { createContext, useState } from 'react';

export interface SortedTableType<T> {
	sortedItems: T[];
	onColumnClick: (col: string) => void;
	sortingColumn: string;
	isDescendingOrder: boolean;
}

const defaultValue: SortedTableType<any> = { sortedItems: [], onColumnClick: () => {}, sortingColumn: '', isDescendingOrder: true };
export const SortedTableContext = createContext(defaultValue);
SortedTableContext.displayName = 'SortedTable';

export interface Props<T> {
	items: T[];
	customSortingFunctions?: (sortingColumn: string) => ((items: T[], order: 'asc' | 'desc', column: string) => T[]) | undefined;
	sortingColumn?: string;
	isDescendingOrder?: boolean;
	children: any;
}
// eslint-disable-next-line @typescript-eslint/comma-dangle
export const SortedTableComponent = <T,>({
	items,
	customSortingFunctions,
	sortingColumn: initialSortingColumn,
	isDescendingOrder: initialIsDescendingOrder,
	children,
}: Props<T>) => {
	const [isDescendingOrder, setIsDescendingOrder] = useState(initialIsDescendingOrder ?? true);
	const [sortingColumn, setSortingColumn] = useState(initialSortingColumn || '');

	const onColumnClick = (col) => {
		if (!col) return;
		setSortingColumn(col);
		setIsDescendingOrder(col === sortingColumn ? !isDescendingOrder : false);
	};

	const sortingOrder = isDescendingOrder ? 'desc' : 'asc';

	const getSortedItems = () => {
		const customSortingFn = customSortingFunctions(sortingColumn);
		if (customSortingFn) return customSortingFn(items, sortingOrder, sortingColumn);
		return orderBy(
			items as T[],
			(item) => {
				const sortingElement = get(item, sortingColumn);
				return sortingElement?.toLowerCase?.() ?? sortingElement;
			},
			sortingOrder,
		);
	};

	return (
		<SortedTableContext.Provider value={{ onColumnClick, sortingColumn, isDescendingOrder, sortedItems: getSortedItems() }}>
			{children}
		</SortedTableContext.Provider>
	);
};
