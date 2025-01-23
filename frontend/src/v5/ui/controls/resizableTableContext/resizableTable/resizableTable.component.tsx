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

import { Resizer } from '../resizer/resizer.component';
import { useContext } from 'react';
import { ResizableTableContext } from '../resizableTableContext';
import { ResizersContainers, Table, ResizerLine } from './resizableTable.styles';

const ResizerComponent = ({ name, width }) => {
	const { setWidth, getWidth, setIsResizing, isResizing, setResizerName, resizerName, isHidden } = useContext(ResizableTableContext);
	const currentWidth = getWidth(name);
	const hidden = isHidden(name);

	const onResizeStart = () => {
		setIsResizing(true);
		setResizerName(name);
	};
	const onResize = (offset) => setWidth(name, currentWidth + offset);
	const onResizeEnd = () => {
		setIsResizing(false);
		setResizerName('');
	};
	const handleMouseOver = () => setResizerName(name);
	const handleMouseOut = () => {
		if (!isResizing) setResizerName('');
	};

	if (hidden) return null;

	return (
		<ResizerLine
			$offset={width}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			$isResizing={isResizing}
			$highlight={resizerName === name}
		>
			<Resizer
				onResizeStart={onResizeStart}
				onResize={onResize}
				onResizeEnd={onResizeEnd}
			/>
		</ResizerLine>
	);
};

export const ResizableTable = ({ children }) => {
	const { getElements } = useContext(ResizableTableContext);
	const resizableElements = getElements().filter((e) => !e.hidden);

	return (
		<Table>
			{children}
			<ResizersContainers>
				{resizableElements.map(({ name, width }) => (
					<ResizerComponent name={name} width={width} key={name} />
				))}
			</ResizersContainers>
		</Table>
	);
};