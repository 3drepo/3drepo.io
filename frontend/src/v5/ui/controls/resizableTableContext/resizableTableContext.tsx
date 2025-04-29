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
	visibleColumnsNames: string[],
	isVisible: (name: string) => boolean,
	setVisibleColumnsNames: (names: string[]) => void,
	columnGap: number,
	getRowWidth: () => number,
	stretchTable: (names?: string[]) => void,
}

const defaultValue: ResizableTableType = {
	getAllColumnsNames: () => [],
	getWidth: () => 0,
	getMinWidth: () => 0,
	setWidth: () => {},
	setResizerName: () => {},
	resizerName: '',
	setIsResizing: () => {},
	isResizing: false,
	hideColumn: () => {},
	showColumn: () => {},
	visibleColumnsNames: [],
	isVisible: () => true,
	setVisibleColumnsNames: () => {},
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
	const [visibleColumnsNames, setVisibleColumnsNames] = useState(new Set<string>());
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);
	const ref = useRef<HTMLDivElement>();

	const getColumnByName = (name: string) => columns.find((e) => e.name === name);

	const isVisible = (name: string) => visibleColumnsNames.has(name);
	const getMinWidth = (name: string) => getColumnByName(name)?.minWidth ?? 0;
	const getColumnWidth = (column: TableColumn) => columnsWidths[column.name] ?? column.width;
	const getWidth = (name: string) => {
		const column = getColumnByName(name);
		if (!column || !isVisible(name)) return 0;
		return getColumnWidth(column);
	};

	const getAllColumnsNames = () => columns.map((c) => c.name);
	const getRowWidth = () => {
		const visibleColumnsWidths = Array.from(visibleColumnsNames).map(getWidth);
		const gaps = (visibleColumnsWidths.length - 1) * columnGap;
		return sum(visibleColumnsWidths) + gaps;
	};

	const setWidth = (name: string, width: number) => setColumnsWidths({
		...columnsWidths,
		[name]: Math.max(getMinWidth(name), width),
	});

	const stretchTable = (names: string[] = []) => {
		if (!visibleColumnsNames.size) return;
	
		const visibleStretchingColumnsNames = names.filter(isVisible);
		const stretchableColumns = visibleStretchingColumnsNames.length ? visibleStretchingColumnsNames : Array.from(visibleColumnsNames);
		const parentWidth = +getComputedStyle(ref.current).width.replace('px', '');
		const tableWidth = getRowWidth();
		if (tableWidth >= parentWidth) return;

		const gap = parentWidth - tableWidth;
		const gapFraction = gap / stretchableColumns.length;
		stretchableColumns.forEach((name) => {
			columnsWidths[name] = getColumnWidth(getColumnByName(name)) + gapFraction;
		});
		setColumnsWidths({ ...columnsWidths });
	};

	const showColumn = (name: string) => setVisibleColumnsNames(new Set(visibleColumnsNames).add(name));
	const hideColumn = (name: string) => {
		visibleColumnsNames.delete(name);
		setVisibleColumnsNames(new Set(visibleColumnsNames));
	};

	const getSortedVisibleColumnsNames = () => getAllColumnsNames().filter(isVisible);

	return (
		<ResizableTableContext.Provider value={{
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
			isVisible,
			visibleColumnsNames: getSortedVisibleColumnsNames(),
			setVisibleColumnsNames: (names: string[]) => setVisibleColumnsNames(new Set(names)),
			getRowWidth,
			columnGap,
			stretchTable,
		}}>
			{children}
			<RefHolder ref={ref} />
		</ResizableTableContext.Provider>
	);
};
