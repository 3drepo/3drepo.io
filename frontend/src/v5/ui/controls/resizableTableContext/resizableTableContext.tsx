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
import { createContext, useEffect, useState } from 'react';

export type TableColumn = { name: string, minWidth?: number, width: number };

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
	isHidden: (name: string) => boolean,
	gutter: number,
	getRowWidth: () => number,
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
	isHidden: () => true,
	gutter: 0,
	getRowWidth: () => 0,
};
export const ResizableTableContext = createContext(defaultValue);
ResizableTableContext.displayName = 'ResizeableColumns';

interface Props {
	children: any;
	columns: TableColumn[];
	hiddenColumns: string[];
	gutter?: number;
}
export const ResizableTableContextComponent = ({ children, columns: inputColumns, hiddenColumns: inputHiddenColumns, gutter = 0 }: Props) => {
	const [columns, setColumns] = useState([...inputColumns]);
	const [hiddenColumns, setHiddenColumns] = useState(inputHiddenColumns);
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);

	const getElementByName = (name) => columns.find((e) => e.name === name);

	const isHidden = (name) => hiddenColumns.includes(name);
	const getMinWidth = (name) => getElementByName(name)?.minWidth ?? 0;
	const getWidth = (name) => (!isHidden(name) && getElementByName(name)?.width) ?? 0;

	const getVisibleColumns = () => columns.filter((c) => !isHidden(c.name));
	const getVisibleColumnsWidths = () => getVisibleColumns().map((c) => c.width);
	const getVisibleColumnsNames = () => getVisibleColumns().map((c) => c.name);
	const getRowWidth = () => {
		const visibleColumnswidths = getVisibleColumnsWidths();
		const gutterSpacing = (visibleColumnswidths.length - 1) * gutter;
		return sum(visibleColumnswidths) + gutterSpacing;
	};

	const setWidth = (name: string, width: number) => {
		getElementByName(name).width = Math.max(getMinWidth(name), width);
		setColumns([ ...columns ]);
	};

	useEffect(() => {
		if (!isEqual(inputHiddenColumns, hiddenColumns)) {
			setHiddenColumns(inputHiddenColumns);
		}
	}, [inputHiddenColumns]);

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
			isHidden,
			getRowWidth,
			gutter,
		}}>
			{children}
		</ResizableTableContext.Provider>
	);
};
