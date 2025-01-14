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

import { createContext, useEffect, useState } from 'react';

export interface ResizableColumnsType {
	getWidth: (name: string) => number;
	getMinWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	widths: Record<string, number>;
	setResizerOffset: (offset: number) => void,
	resizerOffset: number,
	setIsResizing: (isResizing: boolean) => void,
	isResizing: boolean,
}

const defaultValue: ResizableColumnsType = {
	getWidth: () => 0,
	getMinWidth: () => 0,
	setWidth: () => {},
	widths: {},
	setResizerOffset: () => {},
	resizerOffset: 0,
	setIsResizing: () => {},
	isResizing: false,
};
export const ResizableColumnsContext = createContext(defaultValue);
ResizableColumnsContext.displayName = 'ResizeableColumns';

export interface Props {
	children: any;
	widths: Record<string, { min?: number, width: number }>;
}
export const ResizableColumnsContextComponent = ({ children, widths: initialWidths }: Props) => {
	const [widths, setWidths] = useState({});
	const [minWidths, setMinWidths] = useState({});
	const [resizerOffset, setResizerOffset] = useState(0);
	const [isResizing, setIsResizing] = useState(false);

	const setWidth = (name: string, width: number) => {
		widths[name] = width;
		setWidths({ ...widths });
	};

	const getWidth = (name) => widths?.[name] ?? 0;
	const getMinWidth = (name) => minWidths?.[name] ?? 0;

	useEffect(() => {
		Object.entries(initialWidths).forEach(([name, { min, width }]) => {
			if (min) {
				minWidths[name] = min;
			}
			widths[name] = width;
		});
		setWidths({ ...widths });
		setMinWidths({ ...minWidths });
	}, []);

	return (
		<ResizableColumnsContext.Provider value={{
			setWidth,
			getWidth,
			getMinWidth,
			widths,
			setResizerOffset,
			resizerOffset,
			setIsResizing,
			isResizing,
		}}>
			{children}
		</ResizableColumnsContext.Provider>
	);
};
