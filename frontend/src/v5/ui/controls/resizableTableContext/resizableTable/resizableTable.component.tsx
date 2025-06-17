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

import { GridTemplateColumns, OverlayElements, Table } from './resizableTable.styles';
import { ResizersOverlay } from './overlayElements/resizers/resizersOverlay.component';
import { MovingColumnOverlay } from './overlayElements/movingColumn/movingColumnOverlay.component';
import { ResizableTableContext } from '../resizableTableContext';
import { useEffect, useState, useRef } from 'react';
import { Row } from '../resizableTableRow/resizableTableRow.styles';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';

export const ResizableTable = ({ className = '', children }) => {
	const { getWidth, getVisibleSortedColumnsNames, subscribe } = useContextWithCondition(ResizableTableContext, []);
	const key = useRef(+new Date());
	const [tableNode, setTableNode] = useState(null);
	const gridClassName = `ResizableTableTemplateColumns_${key.current}`;

	useEffect(() => {
		if (!tableNode) return;

		const styleTag = document.createElement('style');
		document.head.appendChild(styleTag);

		const setGridTemplateColumns = () => {
			const gridTemplateColumns = getVisibleSortedColumnsNames()
				.map((column) => `${getWidth(column)}px`)
				.join(' ');

			styleTag.innerHTML = `
				.${gridClassName} ${Row} {
					display: grid;
					grid-template-columns: ${gridTemplateColumns};
				}
			`;
		};
		
		setGridTemplateColumns();

		const unsubscribe = subscribe(['columnsWidths', 'visibleSortedColumnsNames'], setGridTemplateColumns);

		return () => {
			unsubscribe();
			document.head.removeChild(styleTag);
		};
	}, [tableNode]);

	return (
		<Table className={className}>
			<GridTemplateColumns ref={(node) => setTableNode(node)} className={gridClassName}>
				{children}
			</GridTemplateColumns>
			<OverlayElements>
				<MovingColumnOverlay />
				<ResizersOverlay />
			</OverlayElements>
		</Table>
	);
};