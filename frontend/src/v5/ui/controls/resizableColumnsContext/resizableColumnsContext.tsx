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

export type WidthsType = Record<string, { min?: number, initial: number }>;

export interface ResizableColumnsType {
	getWidth: (name: string) => number;
	getMinWidth: (name: string) => number;
	setWidth: (name: string, width: number) => void;
	widths: Record<string, number>;
	setResizerName: (name: string) => void,
	resizerName: string,
	setIsResizing: (isResizing: boolean) => void,
	isResizing: boolean,
}

const defaultValue: ResizableColumnsType = {
	getWidth: () => 0,
	getMinWidth: () => 0,
	setWidth: () => {},
	widths: {},
	setResizerName: () => {},
	resizerName: '',
	setIsResizing: () => {},
	isResizing: false,
};
export const ResizableColumnsContext = createContext(defaultValue);
ResizableColumnsContext.displayName = 'ResizeableColumns';

export interface Props {
	children: any;
	widths: WidthsType;
}
export const ResizableColumnsContextComponent = ({ children, widths: initialWidths }: Props) => {
	const [widths, setWidths] = useState({});
	const [minWidths, setMinWidths] = useState({});
	const [resizerName, setResizerName] = useState('');
	const [isResizing, setIsResizing] = useState(false);

	const getWidth = (name) => widths?.[name] ?? 0;
	const getMinWidth = (name) => minWidths?.[name] ?? 0;

	const setWidth = (name: string, width: number) => {
		widths[name] = Math.max(getMinWidth(name), width);
		setWidths({ ...widths });
	};

	useEffect(() => {
		Object.entries(initialWidths).forEach(([name, { min, initial }]) => {
			if (min) {
				minWidths[name] = min;
			}
			widths[name] = initial;
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
			setResizerName,
			resizerName,
			setIsResizing,
			isResizing,
		}}>
			{children}
		</ResizableColumnsContext.Provider>
	);
};
