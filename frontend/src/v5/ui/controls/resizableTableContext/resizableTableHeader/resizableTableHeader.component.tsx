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

import { useContext, useRef } from 'react';
import { DraggingContainer } from '../draggingContainer/draggingContainer.component';
import { ResizableTableContext } from '../resizableTableContext';
import { ResizableTableCell } from '../resizableTableCell/resizableTableCell.component';

export const ResizableTableHeader = ({ name, children, ...props }) => {
	const { setMovingColumn, setColumnAfterMovingColumn, getVisibleColumns } = useContext(ResizableTableContext);
	const middleColumnsMap = useRef<{ name, middleOffset }[]>([]);

	const getMiddleColumnsMap = (e) => {
		// TODO - find the right value here
		const currentPointerOffset = 0;
		let lastColumnOffset = -currentPointerOffset;
		return getVisibleColumns().map((col) => {
			lastColumnOffset += col.width;
			return { name: col.name, middleOffset: lastColumnOffset + col.width / 2 };
		});
	};
	const onDragStart = (e) => {
		middleColumnsMap.current = getMiddleColumnsMap(e);
		setColumnAfterMovingColumn(name);
		setMovingColumn(name);
	};

	const onDrag = (e, offsetFromInitialPosition) => {
		let lastCol = middleColumnsMap.current[0];
		for (const col of middleColumnsMap.current) {
			if (offsetFromInitialPosition > col.middleOffset) break;
			lastCol = col;
		}
		setColumnAfterMovingColumn(lastCol.name);
	};

	const onDragEnd = () => {
		setMovingColumn(null);
		setColumnAfterMovingColumn(null);
	};

	return (
		<DraggingContainer
			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragEnd={onDragEnd}
		>
			<ResizableTableCell name={name} {...props}>
				{children}
			</ResizableTableCell>
		</DraggingContainer>
	);
};