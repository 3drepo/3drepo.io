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

import { isEqual, sum } from 'lodash';
import { createContext, useEffect, useRef, useState } from 'react';
import { RefHolder } from './resizableTableContext.styles';

export type TableColumn = { name: string, minWidth?: number, width: number, stretch?: boolean };

export interface ResizableTableType {
	getVisibleColumns: () => TableColumn[];
	getWidth: (name: string) => number;
	getMinWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	isHidden: (name: string) => boolean,
	columnGap: number,
	getRowWidth: () => number,
	getOffset: (name: string) => number,

	// resizing
	setResizerName: (name: string) => void,
	resizerName: string,
	setIsResizing: (isResizing: boolean) => void,
	isResizing: boolean,
	stretchTable: () => void,

	// moving columns
	movingColumn: string,
	setMovingColumn: (name: string) => void,
	moveColumn: (name: string, newIndex) => void,
	columnAfterMovingColumn: string,
	setColumnAfterMovingColumn: (name: string) => void,
}

const defaultValue: ResizableTableType = {
	getVisibleColumns: () => [],
	getWidth: () => 0,
	getMinWidth: () => 0,
	setWidth: () => {},
	isHidden: () => true,
	columnGap: 0,
	getRowWidth: () => 0,
	getOffset: () => 0,

	// resizing
	setResizerName: () => {},
	resizerName: '',
	setIsResizing: () => {},
	isResizing: false,
	stretchTable: () => {},

	// moving columns
	movingColumn: '',
	setMovingColumn: () => {},
	moveColumn: () => {},
	columnAfterMovingColumn: '',
	setColumnAfterMovingColumn: () => {},
};
export const ResizableTableContext = createContext(defaultValue);
ResizableTableContext.displayName = 'ResizeableColumns';

interface Props {
	children: any;
	columns: TableColumn[];
	hiddenColumns: string[];
	columnGap?: number;
}
export const ResizableTableContextComponent = ({ children, columns: inputColumns, hiddenColumns: inputHiddenColumns, columnGap = 0 }: Props) => {
	const [columns, setColumns] = useState([...inputColumns]);
	const [hiddenColumns, setHiddenColumns] = useState(inputHiddenColumns);
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);
	const [movingColumn, setMovingColumn] = useState('');
	const [columnAfterMovingColumn, setColumnAfterMovingColumn] = useState('');
	const ref = useRef<HTMLDivElement>();

	const getColumnByName = (name) => columns.find((e) => e.name === name);

	const isHidden = (name) => hiddenColumns.includes(name);
	const getMinWidth = (name) => getColumnByName(name)?.minWidth ?? 0;
	const getWidth = (name) => (!isHidden(name) && getColumnByName(name)?.width) ?? 0;

	const getVisibleColumns = () => columns.filter((c) => !isHidden(c.name));
	const getVisibleColumnsWidths = () => getVisibleColumns().map((c) => c.width);
	const getRowWidth = () => {
		const visibleColumnswidths = getVisibleColumnsWidths();
		const gaps = (visibleColumnswidths.length - 1) * columnGap;
		return sum(visibleColumnswidths) + gaps;
	};

	const setWidth = (name: string, width: number) => {
		getColumnByName(name).width = Math.max(getMinWidth(name), width);
		setColumns([ ...columns ]);
	};

	const getOffset = (name: string) => {
		let offset = 0;
		for (const col of getVisibleColumns()) {
			if (col.name === name) {
				break;
			}
			offset += col.width + columnGap;
		}
		return offset;
	};

	const stretchTable = () => {
		const stretchableColumns = getVisibleColumns().filter((c) => c.stretch);
		if (!stretchableColumns.length) return;

		const parentWidth = +getComputedStyle(ref.current).width.replace('px', '');
		const tableWidth = getRowWidth();
		if (tableWidth >= parentWidth) return;

		const gap = parentWidth - tableWidth;
		const gapFraction = gap / stretchableColumns.length;
		stretchableColumns.forEach((c) => {
			getColumnByName(c.name).width += gapFraction;
		});
		setColumns([ ...columns ]);
	};

	const moveColumn = (name: string, columnBeforeName: string) => {
		if (name === columnBeforeName) return;

		const columnToMove = getColumnByName(name);
		const columnToMoveIndex = columns.findIndex((c) => c.name === name);
		const columnBeforeIndex = columns.findIndex((c) => c.name === columnBeforeName);

		const newColumns = [...columns];
		newColumns.splice(columnToMoveIndex, 1);
		if (columnToMoveIndex < columnBeforeIndex) {
			newColumns.splice(columnBeforeIndex + 1, 0, columnToMove);
		} else {
			newColumns.splice(columnBeforeIndex, 0, columnToMove);
		}
		setColumns(newColumns);
	};

	useEffect(() => {
		if (!isEqual(inputHiddenColumns, hiddenColumns)) {
			setHiddenColumns(inputHiddenColumns);
		}
	}, [inputHiddenColumns]);

	return (
		<ResizableTableContext.Provider value={{
			getVisibleColumns,
			getWidth,
			setWidth,
			getMinWidth,
			setResizerName,
			getOffset,
			resizerName,
			setIsResizing,
			isResizing,
			isHidden,
			getRowWidth,
			columnGap,
			stretchTable,
			moveColumn,
			movingColumn,
			setMovingColumn,
			columnAfterMovingColumn,
			setColumnAfterMovingColumn,
		}}>
			{children}
			<RefHolder ref={ref} />
		</ResizableTableContext.Provider>
	);
};
