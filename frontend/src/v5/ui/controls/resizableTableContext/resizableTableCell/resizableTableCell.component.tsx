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

import { HTMLAttributes, useContext } from 'react';
import { ResizableTableContext } from '../resizableTableContext';
import { ResizableEvent } from '../resizableTableContext.types';
import { Item } from './resizableTableCell.styles';
import { useResizableState } from '../resizableTableContext.hooks';

export type ResizableTableCellProps = HTMLAttributes<HTMLDivElement> & {
	name: string;
	className?: string;
	onClick?: () => void;
};
export const ResizableTableCell = ({ name, ...props }: ResizableTableCellProps) => {
	const { getMovingColumn, isVisible, getIndex } = useContext(ResizableTableContext);

	const movingColumn = useResizableState([ResizableEvent.MOVING_COLUMN_CHANGE], getMovingColumn);
	const isHidden = useResizableState([ResizableEvent.VISIBLE_COLUMNS_CHANGE], () => !isVisible(name));

	if (isHidden) return null;

	return (<Item $isMoving={movingColumn === name} $index={getIndex(name)} {...props} />);
};
