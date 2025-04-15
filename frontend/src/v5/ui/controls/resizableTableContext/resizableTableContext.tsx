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

export type TableColumn = { name: string, minWidth?: number, width: number, stretch?: boolean };

export interface ResizableTableType {
	getVisibleColumnsWidths: () => number[];
	getVisibleColumnsNames: () => string[];
	getWidth: (name: string) => number;
	getMinWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	setResizerName: (name: string) => void,
	resizerName: string,
	setIsResizing: (isResizing: boolean) => void,
	isResizing: boolean,
	setHiddenColumns: (hiddenColumnsState: React.SetStateAction<string[]>) => void,
	hiddenColumns: string[],
	unavailableColumns: string[],
	isHidden: (name: string) => boolean,
	columnGap: number,
	getRowWidth: () => number,
	stretchTable: () => void,
	resetColumns: (columns: TableColumn[]) => void,
}

const defaultValue: ResizableTableType = {
	getVisibleColumnsWidths: () => [],
	getVisibleColumnsNames: () => [],
	getWidth: () => 0,
	getMinWidth: () => 0,
	setWidth: () => {},
	setResizerName: () => {},
	resizerName: '',
	setIsResizing: () => {},
	isResizing: false,
	setHiddenColumns: () => {},
	// `hiddenColumns` are set by descendant components accessing the context.
	// `unavailableColumns` are forced to be "hidden" by the component rendering
	// the contextComponent. Changing the value of `unavailableColumns` does not
	// affect `hiddenColumns` and viceversa, so the 2 states can be mutated independently
	hiddenColumns: [],
	unavailableColumns: [],
	isHidden: () => true,
	columnGap: 0,
	getRowWidth: () => 0,
	stretchTable: () => {},
	resetColumns: () => {},
};
export const ResizableTableContext = createContext(defaultValue);
ResizableTableContext.displayName = 'ResizeableColumns';

interface Props {
	children: any;
	columns: TableColumn[];
	unavailableColumns?: string[];
	columnGap?: number;
}
export const ResizableTableContextComponent = ({ children, columns: inputColumns, unavailableColumns = [], columnGap = 0 }: Props) => {
	const [columns, setColumns] = useState([...inputColumns]);
	const [hiddenColumns, setHiddenColumns] = useState([]);
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);
	const ref = useRef<HTMLDivElement>();

	const getElementByName = (name) => columns.find((e) => e.name === name);

	const isHidden = (name) => [...hiddenColumns, ...unavailableColumns].includes(name);
	const getMinWidth = (name) => getElementByName(name)?.minWidth ?? 0;
	const getWidth = (name) => (!isHidden(name) && getElementByName(name)?.width) ?? 0;

	const getVisibleColumns = () => columns.filter((c) => !isHidden(c.name));
	const getVisibleColumnsWidths = () => getVisibleColumns().map((c) => c.width);
	const getVisibleColumnsNames = () => getVisibleColumns().map((c) => c.name);
	const getRowWidth = () => {
		const visibleColumnswidths = getVisibleColumnsWidths();
		const gaps = (visibleColumnswidths.length - 1) * columnGap;
		return sum(visibleColumnswidths) + gaps;
	};

	const setWidth = (name: string, width: number) => {
		getElementByName(name).width = Math.max(getMinWidth(name), width);
		setColumns([ ...columns ]);
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
			getElementByName(c.name).width += gapFraction;
		});
		setColumns([ ...columns ]);
	};

	const resetColumns = (cols) => {
		const newColumns = [...cols];
		columns.forEach(({ name, width }) => {
			const col = newColumns.find((newCol) => newCol.name === name);
			if (col) {
				col.width = width;
			}
		});
		setColumns(columns);
	};

	return (
		<ResizableTableContext.Provider value={{
			getVisibleColumnsWidths,
			getVisibleColumnsNames,
			getWidth,
			setWidth,
			getMinWidth,
			setResizerName,
			resizerName,
			setIsResizing,
			isResizing,
			setHiddenColumns,
			hiddenColumns,
			unavailableColumns,
			isHidden,
			getRowWidth,
			columnGap,
			stretchTable,
			resetColumns,
		}}>
			{children}
			<RefHolder ref={ref} />
		</ResizableTableContext.Provider>
	);
};
