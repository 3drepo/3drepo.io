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

import { useContext, useState } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { DropAreas, Area, Container, DropLine } from './movingColumnDropAreas.styles';

export const MovingColumnDropAreas = () => {
	const [dropIndex, setDropIndex] = useState(-1);
	const {
		getVisibleColumns, setMovingColumn, movingColumn, moveColumn,
		columnGap, getIndex, getOffset, getRowWidth,
	} = useContext(ResizableTableContext);
	
	const columns = getVisibleColumns();
	const movingColumnIndex = getIndex(movingColumn);
	const newIndexIsValid = movingColumnIndex !== dropIndex && movingColumnIndex !== dropIndex - 1;
	const offset = getOffset(columns[dropIndex]?.name) ?? getRowWidth();
	
	// TODO - find this value
	const getTableOffsetLeft = () => 75;

	const getDropAreas = () => {
		// start this with the table offset from the first column
		let previousColHalfWidth = getTableOffsetLeft();
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
		setDropIndex(-1);
		setMovingColumn(null);
		moveColumn(movingColumn, dropIndex);
	};

	return (
		<>
			<Container onMouseUp={dropColumn}>
				<DropAreas onMouseLeave={(e) => setDropColumnIndex(e, columns.length)}>
					{getDropAreas().map((width, index) => (
						<Area key={index} $width={width} onMouseEnter={(e) => setDropColumnIndex(e, index)} />
					))}
				</DropAreas>
			</Container>
			{newIndexIsValid && <DropLine offset={offset} />}
		</>
	);
};