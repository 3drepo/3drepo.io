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

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ResizableTableContext } from '@controls/resizableTableContext/resizableTableContext';
import { TableCorner, DropAreas, Area, Container, DropLine } from './movingColumnDropAreas.styles';
import { blockEvent } from '@/v5/helpers/events.helpers';
import { throttle } from 'lodash';


const THROTTLE_TIME = 20;
export const MovingColumnDropAreas = () => {
	const {
		setMovingColumn, movingColumn, moveColumn,
		movingColumnDropIndex, setMovingColumnDropIndex,
		columnGap, getIndex, getColumnOffsetLeft, getRowWidth, getVisibleColumns,
	} = useContext(ResizableTableContext);
	const [tableOffset, setTableOffset] = useState(0);
	const ref = useRef(null);
	
	const columns = getVisibleColumns();
	const movingColumnIndex = getIndex(movingColumn);
	const offset = getColumnOffsetLeft(columns[movingColumnDropIndex]?.name) ?? getRowWidth();
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
		return columns.map(({ width }) => {
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
	  
		const index = (leftEdgeDistance < rightEdgeDistance) ? 0 : columns.length;
		setDropColumnIndex(e, index);
	};

	const dropColumn = () => {
		setMovingColumn(null);
		setMovingColumnDropIndex(-1);
		moveColumn(movingColumn, movingColumnDropIndex);
	};

	useEffect(() => {
		const updateTableOffset = () => {
			if (!ref.current) return;
			setTableOffset(getTableOffset());
		};
		const throttledRepaint = throttle(
			updateTableOffset,
			THROTTLE_TIME,
			{ leading: true, trailing: true },
		);
	
		const repaint = () => {
			if (!ref.current) return;
			throttledRepaint();
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
			{isDropIndexValid && <DropLine $offset={offset} $style="solid" />}
		</>
	);
};