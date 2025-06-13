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

import { useCallback, useEffect, useRef, useState } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { TableCorner, DropAreas, Area, Container, DropLine } from './movingColumnDropAreas.styles';
import { blockEvent } from '@/v5/helpers/events.helpers';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';

export const MovingColumnDropAreas = () => {
	const [tableOffset, setTableOffset] = useState(0);
	const ref = useRef(null);
	const {
		setMovingColumn, moveColumn, getWidth, setMovingColumnDropIndex, columnGap,
		getIndex, getColumnOffsetLeft, getRowWidth, visibleSortedColumnsNames,
		movingColumn, movingColumnDropIndex,
	} = useContextWithCondition(ResizableTableContext, ['movingColumn', 'movingColumnDropIndex', 'columnsWidths', 'visibleSortedColumnsNames']);

	const movingColumnIndex = getIndex(movingColumn);
	const dropLineOffset = getColumnOffsetLeft(visibleSortedColumnsNames[movingColumnDropIndex]) ?? getRowWidth();
	const isDropIndexValid = (
		movingColumnDropIndex >= 0
		&& movingColumnIndex !== movingColumnDropIndex
		&& movingColumnIndex !== movingColumnDropIndex - 1
	);

	const getTableOffset = () => {
		if (!ref.current) return 0;

		const box = ref.current.getBoundingClientRect();
		const { body, documentElement } = document;
	
		const scrollLeft = documentElement.scrollLeft || body.scrollLeft;
		const clientLeft = documentElement.clientLeft || body.clientLeft || 0;
		const left = box.left + scrollLeft - clientLeft;
	
		return Math.round(left);
	};
	
	const getDropAreasWidths = useCallback(() => {
		let previousColHalfWidth = 0;
		return visibleSortedColumnsNames.map((name) => {
			const width = getWidth(name);
			const colHalfWidth = width / 2;
			const areaWidth = previousColHalfWidth + colHalfWidth + columnGap;
			previousColHalfWidth = colHalfWidth;
			return areaWidth;
		});
	}, []);

	const setDropColumnIndex = (e, index) => {
		blockEvent(e);
		setMovingColumnDropIndex(index);
	};

	const onMouseLeaveDropArea = (e) => {
		const dropAreas = e.currentTarget.getBoundingClientRect();  
		const leftEdge = dropAreas.left;
		const rightEdge = dropAreas.right;

		const mouseX = e.clientX;
		const leftEdgeDistance = Math.abs(leftEdge - mouseX);
		const rightEdgeDistance = Math.abs(rightEdge - mouseX);
	  
		const index = (leftEdgeDistance < rightEdgeDistance) ? 0 : visibleSortedColumnsNames.length;
		setDropColumnIndex(e, index);
	};

	const dropColumn = () => {
		setMovingColumn(null);
		setMovingColumnDropIndex(null);
		moveColumn(movingColumn, movingColumnDropIndex);
	};

	useEffect(() => {
		const repaint = () => {
			if (!ref.current) return;
			setTableOffset(getTableOffset());
			requestAnimationFrame(repaint);
		};

		repaint();
	}, []);

	return (
		<>
			<TableCorner ref={ref} />
			<Container onMouseUp={dropColumn}>
				<DropAreas $offset={tableOffset} onMouseLeave={onMouseLeaveDropArea}>
					{getDropAreasWidths().map((width, index) => (
						<Area key={index} $width={width} onMouseEnter={(e) => setDropColumnIndex(e, index)} />
					))}
				</DropAreas>
			</Container>
			{isDropIndexValid && <DropLine $offset={dropLineOffset} $style="solid" />}
		</>
	);
};