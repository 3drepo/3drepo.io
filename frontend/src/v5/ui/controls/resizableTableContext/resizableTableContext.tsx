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

import { sum } from 'lodash';
import { createContext, useRef, useState } from 'react';
import { RefHolder } from './resizableTableContext.styles';

export type TableColumn = { name: string, minWidth?: number, width: number };

export interface ResizableTableType {
	getVisibleColumnsWidths: () => number[];
	getVisibleColumnsNames: () => string[];
	getAllColumnsNames: () => string[];
	getWidth: (name: string) => number;
	getMinWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	setResizerName: (name: string) => void,
	resizerName: string,
	setIsResizing: (isResizing: boolean) => void,
	isResizing: boolean,
	hideColumn: (name: string) => void,
	showColumn: (name: string) => void,
	hiddenColumns: string[],
	isHidden: (name: string) => boolean,
	columnGap: number,
	getRowWidth: () => number,
	stretchTable: (names?: string[]) => void,
}

const defaultValue: ResizableTableType = {
	getVisibleColumnsWidths: () => [],
	getVisibleColumnsNames: () => [],
	getAllColumnsNames: () => [],
	getWidth: () => 0,
	getMinWidth: () => 0,
	setWidth: () => {},
	setResizerName: () => {},
	resizerName: '',
	setIsResizing: () => {},
	isResizing: false,
	hiddenColumns: [],
	hideColumn: () => {},
	showColumn: () => {},
	isHidden: () => true,
	columnGap: 0,
	getRowWidth: () => 0,
	stretchTable: () => {},
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
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);
	const ref = useRef<HTMLDivElement>();

	const getElementByName = (name: string) => columns.find((e) => e.name === name);

	const isHidden = (name: string) => hiddenColumns.includes(name);
	const getMinWidth = (name: string) => getElementByName(name)?.minWidth ?? 0;
	const getColumnWidth = (column: TableColumn) => columnsWidths[column.name] ?? column.width;
	const getWidth = (name: string) => {
		const element = getElementByName(name);
		if (isHidden(name) || !element) return 0;
		return getColumnWidth(element);
	};

	const getVisibleColumns = () => columns.filter((c) => !isHidden(c.name));
	const getVisibleColumnsWidths = () => getVisibleColumns().map(getColumnWidth);
	const getVisibleColumnsNames = () => getVisibleColumns().map((c) => c.name);
	const getAllColumnsNames = () => columns.map((c) => c.name);
	const getRowWidth = () => {
		const visibleColumnswidths = getVisibleColumnsWidths();
		const gaps = (visibleColumnswidths.length - 1) * columnGap;
		return sum(visibleColumnswidths) + gaps;
	};

	const setWidth = (name: string, width: number) => setColumnsWidths({
		...columnsWidths,
		[name]: Math.max(getMinWidth(name), width),
	});

	const stretchTable = (names: string[] = []) => {
		const visibleColumns = getVisibleColumns();
		if (!visibleColumns.length) return;
	
		const visibleStretchingColumnsNames = names.filter((name) => !isHidden(name)).map(getElementByName);
		const stretchableColumns = visibleStretchingColumnsNames.length ? visibleStretchingColumnsNames : visibleColumns;
		const parentWidth = +getComputedStyle(ref.current).width.replace('px', '');
		const tableWidth = getRowWidth();
		if (tableWidth >= parentWidth) return;

		const gap = parentWidth - tableWidth;
		const gapFraction = gap / stretchableColumns.length;
		stretchableColumns.forEach((c) => {
			columnsWidths[c.name] = getColumnWidth(getElementByName(c.name)) + gapFraction;
		});
		setColumnsWidths({ ...columnsWidths });
	};

	const hideColumn = (name: string) => setHiddenColumns([...hiddenColumns, name]);
	const showColumn = (name: string) => setHiddenColumns(hiddenColumns.filter((hiddenColumn) => hiddenColumn !== name));

	return (
		<ResizableTableContext.Provider value={{
			getVisibleColumnsWidths,
			getVisibleColumnsNames,
			getAllColumnsNames,
			getWidth,
			setWidth,
			getMinWidth,
			setResizerName,
			resizerName,
			setIsResizing,
			isResizing,
			hideColumn,
			showColumn,
			hiddenColumns,
			isHidden,
			getRowWidth,
			columnGap,
			stretchTable,
		}}>
			{children}
			<RefHolder ref={ref} />
		</ResizableTableContext.Provider>
	);
};
