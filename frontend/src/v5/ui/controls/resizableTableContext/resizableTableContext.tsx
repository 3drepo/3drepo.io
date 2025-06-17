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
import { RefHolder } from './resizableTableContext.styles';
import { SubscribableObject } from '@/v5/helpers/contextWithCondition/contextWithCondition.types';
import { useSubscribableState } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';
import { createContext } from 'react';

export type TableColumn = { name: string; minWidth?: number; width: number; };

type StateType = {
	columnsWidths: Record<string, number>,
	visibleSortedColumnsNames: string[],
	movingColumn: string,
	movingColumnDropIndex: number,
	tableNode: HTMLDivElement | null,
	resizingColumn: string,
};
const defaultState: StateType = {
	columnsWidths: {},
	visibleSortedColumnsNames: [],
	movingColumn: '',
	movingColumnDropIndex: null,
	tableNode: null,
	resizingColumn: '',
};

export interface ResizableTableType extends SubscribableObject<StateType> {
	getAllColumnsNames: () => string[];
	getWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	columnGap: number,
	getRowWidth: () => number,
	getColumnOffsetLeft: (name: string) => number,
	getIndex: (name: string) => number,
	stretchTable: (name: string) => void,

	// columns visibility
	hideColumn: (name: string) => void,
	showColumn: (name: string) => void,
	isVisible: (name: string) => boolean,
	getVisibleSortedColumnsNames: () => string[],
	setVisibleSortedColumnsNames: (names: string[]) => void,

	// moving columns
	setMovingColumn: (name: string) => void,
	setMovingColumnDropIndex: (index: number) => void,
	moveColumn: (name: string, dropIndex: number) => void,
	setResizingColumn: (name: string) => void,
}

const defaultValue: ResizableTableType = {
	subscribe: () => () => {},
	state: defaultState,
	previousState: { current: defaultState },

	getAllColumnsNames: () => [],
	getWidth: () => 0,
	setWidth: () => {},
	columnGap: 0,
	getRowWidth: () => 0,
	getColumnOffsetLeft: () => 0,
	getIndex: () => -1,
	stretchTable: () => {},

	// columns visibility
	hideColumn: () => {},
	showColumn: () => {},
	isVisible: () => true,
	getVisibleSortedColumnsNames: () => [],
	setVisibleSortedColumnsNames: () => {},

	// moving columns
	setMovingColumn: () => {},
	setMovingColumnDropIndex: () => {},
	moveColumn: () => {},
	setResizingColumn: () => {},

};
export const ResizableTableContext = createContext(defaultValue);
ResizableTableContext.displayName = 'ResizeableColumns';

interface Props {
	children: any;
	columns: TableColumn[];
	columnGap?: number;
}
export const ResizableTableContextComponent = ({ children, columns, columnGap = 0 }: Props) => {
	const [state, previousState, subscribe] = useSubscribableState(defaultState);

	const setVisibleSortedColumnsNames = (names: string[]) => {
		state.visibleSortedColumnsNames = names;
	};

	const setMovingColumn = (name: string) => {
		state.movingColumn = name;
	};

	const setMovingColumnDropIndex = (index: number) => {
		state.movingColumnDropIndex = index;
	};

	const setResizingColumn = (name: string) => {
		state.resizingColumn = name;
	};

	const getColumnByName = (name: string) => columns.find((e) => e.name === name) as TableColumn;

	const isVisible = (name: string) => state.visibleSortedColumnsNames.includes(name);
	const getMinWidth = (name: string) => getColumnByName(name)?.minWidth ?? 0;
	const getColumnWidth = (column: TableColumn) => state.columnsWidths[column.name] ?? column.width;
	const getWidth = (name: string) => {
		const column = getColumnByName(name);
		if (!column || !isVisible(name)) return 0;
		return getColumnWidth(column);
	};

	const getAllColumnsNames = () => columns.map((c) => c.name);
	const getRowWidth = () => {
		const visibleColumnsWidths = state.visibleSortedColumnsNames.map(getWidth);
		const gaps = (visibleColumnsWidths.length - 1) * columnGap;
		return sum(visibleColumnsWidths) + gaps;
	};

	const setWidth = (name: string, width: number) => state.columnsWidths = {
		...state.columnsWidths,
		[name]: Math.max(getMinWidth(name), width),
	};

	const getColumnOffsetLeft = (name: string) => {
		let offset = 0;
		for (const colName of state.visibleSortedColumnsNames) {
			if (colName === name) {
				break;
			}
			offset += getWidth(colName) + columnGap;
		}
		return offset;
	};

	const stretchTable = (name: string) => {
		if (!state.tableNode) return;
		const parentWidth = +getComputedStyle(state.tableNode).width.replace('px', '');
		const tableWidth = getRowWidth();
		if (tableWidth >= parentWidth) return;

		const gap = parentWidth - tableWidth;
		setWidth(name, getColumnWidth(getColumnByName(name)) + gap);
	};

	const showColumn = (name: string) => state.visibleSortedColumnsNames = [...state.visibleSortedColumnsNames, name];
	const hideColumn = (name: string) => state.visibleSortedColumnsNames = state.visibleSortedColumnsNames.filter((columnName) => columnName !== name);

	const getIndex = (name: string) => state.visibleSortedColumnsNames.findIndex((colName) => colName === name);

	const moveColumn = (name: string, to: number) => {
		const currentIndex = state.visibleSortedColumnsNames.findIndex((n) => n === name);
		const newSortedColumns = [...state.visibleSortedColumnsNames];
		delete newSortedColumns[currentIndex];
		newSortedColumns.splice(to, 0, name);
		state.visibleSortedColumnsNames = compact(newSortedColumns);
	};

	return (
		<ResizableTableContext.Provider value={{
			subscribe,
			previousState,
			state,
			getAllColumnsNames,
			getWidth,
			setWidth,
			getColumnOffsetLeft,
			getIndex,
			hideColumn,
			showColumn,
			isVisible,
			getVisibleSortedColumnsNames: () => state.visibleSortedColumnsNames,
			setVisibleSortedColumnsNames,
			getRowWidth,
			columnGap,
			stretchTable,
			setMovingColumn,
			setMovingColumnDropIndex,
			moveColumn,
			setResizingColumn,
		}}>
			{children}
			<RefHolder ref={(node) => { state.tableNode = node; }} />
		</ResizableTableContext.Provider>
	);
};
