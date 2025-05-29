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
import { createContext, useRef, useState } from 'react';
import { RefHolder } from './resizableTableContext.styles';

export type TableColumn = { name: string, minWidth?: number, width: number };

export interface ResizableTableType {
	getAllColumnsNames: () => string[];
	getWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	columnGap: number,
	getRowWidth: () => number,
	getColumnOffsetLeft: (name: string) => number,
	getIndex: (name: string) => number,

	// columns visibility
	hideColumn: (name: string) => void,
	showColumn: (name: string) => void,
	visibleSortedColumnsNames: string[],
	isVisible: (name: string) => boolean,
	setVisibleSortedColumnsNames: (names: string[]) => void,

	// resizing
	setResizerName: (name: string) => void,
	resizerName: string,
	setIsResizing: (isResizing: boolean) => void,
	isResizing: boolean,
	stretchTable: (name: string) => void,

	// moving columns
	setMovingColumn: (name: string) => void,
	movingColumn: string,
	setMovingColumnDropIndex: (index: number) => void,
	movingColumnDropIndex: number,
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

	// columns visibility
	hideColumn: () => {},
	showColumn: () => {},
	visibleSortedColumnsNames: [],
	isVisible: () => true,
	setVisibleSortedColumnsNames: () => {},

	// resizing
	setResizerName: () => {},
	resizerName: '',
	setIsResizing: () => {},
	isResizing: false,
	stretchTable: () => {},

	// moving columns
	movingColumn: '',
	setMovingColumn: () => {},
	movingColumnDropIndex: -1,
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
	const [columnsWidths, setColumnsWidths] = useState<Record<string, number>>({});
	const [visibleSortedColumnsNames, setVisibleSortedColumnsNames] = useState([]);
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);
	const [movingColumn, setMovingColumn] = useState('');
	const [movingColumnDropIndex, setMovingColumnDropIndex] = useState(-1);
	const ref = useRef<HTMLDivElement>();

	const getColumnByName = (name: string) => columns.find((e) => e.name === name) as TableColumn;

	const isVisible = (name: string) => visibleSortedColumnsNames.includes(name);
	const getMinWidth = (name: string) => getColumnByName(name)?.minWidth ?? 0;
	const getColumnWidth = (column: TableColumn) => columnsWidths[column.name] ?? column.width;
	const getWidth = (name: string) => {
		const column = getColumnByName(name);
		if (!column || !isVisible(name)) return 0;
		return getColumnWidth(column);
	};

	const getAllColumnsNames = () => columns.map((c) => c.name);
	const getRowWidth = () => {
		const visibleColumnsWidths = visibleSortedColumnsNames.map(getWidth);
		const gaps = (visibleColumnsWidths.length - 1) * columnGap;
		return sum(visibleColumnsWidths) + gaps;
	};

	const setWidth = (name: string, width: number) => setColumnsWidths({
		...columnsWidths,
		[name]: Math.max(getMinWidth(name), width),
	});

	const getColumnOffsetLeft = (name: string) => {
		let offset = 0;
		for (const colName of visibleSortedColumnsNames) {
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
		columnsWidths[name] = getColumnWidth(getColumnByName(name)) + gap;
		setColumnsWidths({ ...columnsWidths });
	};

	const showColumn = (name: string) => setVisibleSortedColumnsNames([...visibleSortedColumnsNames, name]);
	const hideColumn = (name: string) => setVisibleSortedColumnsNames(visibleSortedColumnsNames.filter((columnName) => columnName !== name));


	const getIndex = (name: string) => visibleSortedColumnsNames.findIndex((colName) => colName === name);

	const moveColumn = (name: string, to: number) => {
		const currentIndex = visibleSortedColumnsNames.findIndex((n) => n === name);
		delete visibleSortedColumnsNames[currentIndex];
		visibleSortedColumnsNames.splice(to, 0, name);
		setVisibleSortedColumnsNames(compact(visibleSortedColumnsNames));
	};

	return (
		<ResizableTableContext.Provider value={{
			getAllColumnsNames,
			getWidth,
			setWidth,
			setResizerName,
			getColumnOffsetLeft,
			getIndex,
			resizerName,
			setIsResizing,
			isResizing,
			hideColumn,
			showColumn,
			isVisible,
			visibleSortedColumnsNames,
			setVisibleSortedColumnsNames,
			getRowWidth,
			columnGap,
			stretchTable,
			movingColumn,
			setMovingColumn,
			movingColumnDropIndex,
			setMovingColumnDropIndex,
			moveColumn,
		}}>
			{children}
			<RefHolder ref={ref} />
		</ResizableTableContext.Provider>
	);
};
