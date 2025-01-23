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

import { createContext, useState } from 'react';

export type TableElements = { name: string, minWidth?: number, width: number, hidden?: boolean };

export interface ResizableTableType {
	getElements: () => TableElements[];
	getWidth: (name: string) => number;
	getMinWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	setResizerName: (name: string) => void,
	resizerName: string,
	setIsResizing: (isResizing: boolean) => void,
	isResizing: boolean,
	isHidden: (name: string) => boolean,
}

const defaultValue: ResizableTableType = {
	getElements: () => [],
	getWidth: () => 0,
	getMinWidth: () => 0,
	setWidth: () => {},
	setResizerName: () => {},
	resizerName: '',
	setIsResizing: () => {},
	isResizing: false,
	isHidden: () => true,
};
export const ResizableTableContext = createContext(defaultValue);
ResizableTableContext.displayName = 'ResizeableColumns';

interface Props {
	children: any;
	elements: TableElements[];
}
export const ResizableTableContextComponent = ({ children, elements: inputElements }: Props) => {
	const [elements, setElements] = useState([...inputElements]);
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);

	const getElementByName = (name) => elements.find((e) => e.name === name);
	const getElementIndexByName = (name) => elements.findIndex((e) => e.name === name);

	const isHidden = (name) => getElementByName(name)?.hidden ?? false;
	const getMinWidth = (name) => getElementByName(name)?.minWidth ?? 0;
	const getWidth = (name) => (!isHidden(name) && getElementByName(name)?.width) ?? 0;

	const setWidth = (name: string, width: number) => {
		const index = getElementIndexByName(name);
		elements[index].width = Math.max(getMinWidth(name), width);
		setElements([ ...elements ]);
	};

	return (
		<ResizableTableContext.Provider value={{
			getElements: () => [...elements],
			getWidth,
			setWidth,
			getMinWidth,
			setResizerName,
			resizerName,
			setIsResizing,
			isResizing,
			isHidden,
		}}>
			{children}
		</ResizableTableContext.Provider>
	);
};
