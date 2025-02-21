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

import { useContext, useRef, useState } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { TableCorner, DropAreas, Area, Container, DropLine } from './movingColumnDropAreas.styles';

export const MovingColumnDropAreas = () => {
	const {
		getVisibleColumns, setMovingColumn, movingColumn, moveColumn,
		columnGap, getIndex, getOffset, getRowWidth,
	} = useContext(ResizableTableContext);
	const [dropIndex, setDropIndex] = useState(getVisibleColumns().length);
	const tableOffsetRef = useRef<HTMLDivElement>(null);
	
	const columns = getVisibleColumns();
	const movingColumnIndex = getIndex(movingColumn);
	const offset = getOffset(columns[dropIndex]?.name) ?? getRowWidth();
	const isDropIndexValid = movingColumnIndex !== dropIndex && movingColumnIndex !== dropIndex - 1;

	const getTableOffsetX = () => {
		const elem = tableOffsetRef.current;
		if (!elem) return 0;
		
		const box = elem.getBoundingClientRect();
		const { body, documentElement } = document;
	
		const scrollLeft = documentElement.scrollLeft || body.scrollLeft;
		const clientLeft = documentElement.clientLeft || body.clientLeft || 0;
		const left = box.left + scrollLeft - clientLeft;
	
		return Math.round(left);
	};
	
	const getDropAreas = () => {
		let previousColHalfWidth = getTableOffsetX() - columnGap;
		return columns.map(({ width }) => {
			const colHalfWidth = width / 2;
			const areaWidth = previousColHalfWidth + colHalfWidth + columnGap;
			previousColHalfWidth = colHalfWidth;
			return areaWidth;
		});
	};

	const setDropColumnIndex = (e, index) => {
		e.stopPropagation();
		e.preventDefault();
		setDropIndex(index);
	};

	const dropColumn = () => {
		setMovingColumn(null);
		moveColumn(movingColumn, dropIndex);
	};

	return (
		<>
			<TableCorner ref={tableOffsetRef} />
			<Container onMouseUp={dropColumn}>
				<DropAreas onMouseLeave={(e) => setDropColumnIndex(e, columns.length)}>
					{getDropAreas().map((width, index) => (
						<Area key={index} $width={width} onMouseEnter={(e) => setDropColumnIndex(e, index)} />
					))}
				</DropAreas>
			</Container>
			{isDropIndexValid && <DropLine offset={offset} />}
		</>
	);
};