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
import { ResizerElement, ResizerLine } from './resizer.styles';
import { ResizableTableContext } from '../../../../resizableTableContext';

type ResizerProps = { name: string };
export const Resizer = ({ name }: ResizerProps) => {
	const { setWidth, getWidth, setIsResizing, isResizing, setResizerName, resizerName, isHidden, getOffset } = useContext(ResizableTableContext);
	const width = getWidth(name);
	const hidden = isHidden(name);

	const onResizeStart = () => {
		setIsResizing(true);
		setResizerName(name);
	};

	const onResize = (offsetFromInitialPosition) => {
		setWidth(name, width + offsetFromInitialPosition);
	};

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
			offset={getWidth(name) + getOffset(name)}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			$highlight={resizerName === name}
			$isResizing={isResizing}
		>
			<ResizerElement
				onDragStart={onResizeStart}
				onDrag={onResize}
				onDragEnd={onResizeEnd}
			/>
		</ResizerLine>
	);
};