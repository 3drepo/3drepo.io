/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { compact, sum } from 'lodash';
import { createContext, useRef } from 'react';
import { RefHolder } from './resizableTableContext.styles';
import { ResizableEventType, UnsubscribeFn, TableColumn, ResizableEvent } from './resizableTableContext.types';
import { usePubSub } from '@/v5/services/pubSub';

export interface ResizableTableType {
	getAllColumnsNames: () => string[];
	getWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	columnGap: number,
	getRowWidth: () => number,
	getColumnOffsetLeft: (name: string) => number,
	getIndex: (name: string) => number,
	stretchTable: (name: string) => void,
	subscribe: (event: ResizableEventType, fn: (...args: any[]) => void) => UnsubscribeFn,

	// columns visibility
	hideColumn: (name: string) => void,
	showColumn: (name: string) => void,
	isVisible: (name: string) => boolean,
	getVisibleSortedColumnsNames: () => string[],
	setVisibleSortedColumnsNames: (names: string[]) => void,

	// moving columns
	setMovingColumn: (name: string) => void,
	getMovingColumn: () => string,
	setMovingColumnDropIndex: (index: number) => void,
	getMovingColumnDropIndex: () => number,
	moveColumn: (name: string, dropIndex: number) => void,
}

const defaultValue: ResizableTableType = {
	getAllColumnsNames: () => [],
	getWidth: () => 0,
	setWidth: () => {},
	columnGap: 0,
	getRowWidth: () => 0,
	getColumnOffsetLeft: () => 0,
	getIndex: () => -1,
	stretchTable: () => {},
	subscribe: () => () => {},

	// columns visibility
	hideColumn: () => {},
	showColumn: () => {},
	isVisible: () => true,
	getVisibleSortedColumnsNames: () => [],
	setVisibleSortedColumnsNames: () => {},

	// moving columns
	getMovingColumn: () => '',
	setMovingColumn: () => {},
	getMovingColumnDropIndex: () => -1,
	setMovingColumnDropIndex: () => {},
	moveColumn: () => {},
};
export const ResizableTableContext = createContext(defaultValue);
ResizableTableContext.displayName = 'ResizeableColumns';

interface Props {
	children: any;
	columns: TableColumn[];
	columnGap?: number;
}
export const ResizableTableContextComponent = ({ children, columns, columnGap = 0 }: Props) => {
	const columnsWidths = useRef<Record<string, number>>({});
	const visibleSortedColumnsNames = useRef<string[]>([]);
	const movingColumn = useRef('');
	const movingColumnDropIndex = useRef(-1);
	const ref = useRef<HTMLDivElement>();
	const { publish, subscribe } = usePubSub<ResizableEventType>();

	const setVisibleSortedColumnsNames = (names: string[]) => {
		visibleSortedColumnsNames.current = names;
		publish(ResizableEvent.VISIBLE_COLUMNS_CHANGE, names);
	};

	const setMovingColumn = (name: string) => {
		movingColumn.current = name;
		publish(ResizableEvent.MOVING_COLUMN_CHANGE, name);
	};

	const setMovingColumnDropIndex = (index: number) => {
		movingColumnDropIndex.current = index;
		publish(ResizableEvent.MOVING_COLUMN_DROP_INDEX_CHANGE, index);
	};

	const getColumnByName = (name: string) => columns.find((e) => e.name === name) as TableColumn;

	const isVisible = (name: string) => visibleSortedColumnsNames.current.includes(name);
	const getMinWidth = (name: string) => getColumnByName(name)?.minWidth ?? 0;
	const getColumnWidth = (column: TableColumn) => columnsWidths.current[column.name] ?? column.width;
	const getWidth = (name: string) => {
		const column = getColumnByName(name);
		if (!column || !isVisible(name)) return 0;
		return getColumnWidth(column);
	};

	const getAllColumnsNames = () => columns.map((c) => c.name);
	const getRowWidth = () => {
		const visibleColumnsWidths = visibleSortedColumnsNames.current.map(getWidth);
		const gaps = (visibleColumnsWidths.length - 1) * columnGap;
		return sum(visibleColumnsWidths) + gaps;
	};

	const setWidth = (name: string, width: number) => {
		columnsWidths.current[name] = Math.max(getMinWidth(name), width);
		publish(ResizableEvent.WIDTH_CHANGE, name);
	};

	const getColumnOffsetLeft = (name: string) => {
		let offset = 0;
		for (const colName of visibleSortedColumnsNames.current) {
			if (colName === name) {
				break;
			}
			offset += getWidth(colName) + columnGap;
		}
		return offset;
	};

	const stretchTable = (name: string) => {
		const parentWidth = +getComputedStyle(ref.current).width.replace('px', '');
		const tableWidth = getRowWidth();
		if (tableWidth >= parentWidth) return;

		const gap = parentWidth - tableWidth;
		setWidth(name, getColumnWidth(getColumnByName(name)) + gap);
	};

	const showColumn = (name: string) => setVisibleSortedColumnsNames([...visibleSortedColumnsNames.current, name]);
	const hideColumn = (name: string) => setVisibleSortedColumnsNames(visibleSortedColumnsNames.current.filter((columnName) => columnName !== name));


	const getIndex = (name: string) => visibleSortedColumnsNames.current.findIndex((colName) => colName === name);

	const moveColumn = (name: string, to: number) => {
		const currentIndex = visibleSortedColumnsNames.current.findIndex((n) => n === name);
		delete visibleSortedColumnsNames.current[currentIndex];
		visibleSortedColumnsNames.current.splice(to, 0, name);
		setVisibleSortedColumnsNames(compact(visibleSortedColumnsNames.current));
	};

	return (
		<ResizableTableContext.Provider value={{
			getAllColumnsNames,
			getWidth,
			setWidth,
			getColumnOffsetLeft,
			getIndex,
			hideColumn,
			showColumn,
			isVisible,
			getVisibleSortedColumnsNames: () => [...visibleSortedColumnsNames.current],
			setVisibleSortedColumnsNames,
			getRowWidth,
			columnGap,
			stretchTable,
			subscribe,
			getMovingColumn: () => movingColumn.current,
			setMovingColumn,
			getMovingColumnDropIndex: () => movingColumnDropIndex.current,
			setMovingColumnDropIndex,
			moveColumn,
		}}>
			{children}
			<RefHolder ref={ref} />
		</ResizableTableContext.Provider>
	);
};
