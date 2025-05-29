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

import { useContext } from 'react';
import { ResizableTableContext } from '../resizableTableContext';
import { ResizableTableCell } from '../resizableTableCell/resizableTableCell.component';
import { blockEvent } from '@/v5/helpers/events.helpers';

export const ResizableTableHeader = ({ name, children, ...props }) => {
	const { setMovingColumn } = useContext(ResizableTableContext);

	const onDragStart = (e) => {
		// The blockEvent is to fix a bug in firefox where the dragging the
		// dragged column is not dropped on mouseUp, but requires a further click
		blockEvent(e);
		setMovingColumn(name);
	};

	return (
		<ResizableTableCell draggable onDragStart={onDragStart} name={name} {...props}>
			{children}
		</ResizableTableCell>
	);
};