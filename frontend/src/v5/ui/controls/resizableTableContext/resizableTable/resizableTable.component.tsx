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
import { useContext, useEffect, useRef, useState } from 'react';
import { ResizableEvent } from '../resizableTableContext.types';
import { Row } from '../resizableTableRow/resizableTableRow.styles';

export const ResizableTable = ({ className = '', children }) => {
	const { getWidth, getVisibleSortedColumnsNames, subscribe } = useContext(ResizableTableContext);
	const ref = useRef<HTMLDivElement>();
	const [key] = useState(+new Date());
	const gridClassName = `ResizableTableTemplateColumns_${key}`;

	useEffect(() => {
		const styleTag = document.createElement('style');
		document.head.appendChild(styleTag);

		const setGridTemplateColumns = () => {
			if (!ref.current) return;

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

		const subscriptions = [
			subscribe(ResizableEvent.WIDTH_CHANGE, setGridTemplateColumns),
			subscribe(ResizableEvent.VISIBLE_COLUMNS_CHANGE, setGridTemplateColumns),
		];

		return () => {
			subscriptions.forEach((fn) => fn());
			if (ref.current) {
				ref.current.classList.remove(gridClassName);
				document.head.removeChild(styleTag);
			}
		};
	}, []);

	return (
		<Table className={className}>
			<GridTemplateColumns ref={ref} className={gridClassName}>
				{children}
			</GridTemplateColumns>
			<OverlayElements>
				<MovingColumnOverlay />
				<ResizersOverlay />
			</OverlayElements>
		</Table>
	);
};