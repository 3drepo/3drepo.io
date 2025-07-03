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

import { useRef, useState } from 'react';
import { overlayStyles, ResizerElement } from './resizer.styles';
import { ResizableTableContext } from '../../../../resizableTableContext';
import { DelimiterLine } from '@controls/resizableTableContext/delimiterLine/delimiterLine.styles';
import { useContextWithCondition } from '@/v5/helpers/contextWithCondition/contextWithCondition.hooks';

type ResizerProps = { name: string };
export const Resizer = ({ name }: ResizerProps) => {
	const { setWidth, getWidth, resizingColumn, setResizingColumn } = useContextWithCondition(
		ResizableTableContext,
		['columnsWidths', 'resizingColumn'],
		(curr, prev) => prev.resizingColumn === name || curr.resizingColumn === name,
	);
	const [isHovering, setIsHovering] = useState(false);
	const width = getWidth(name);
	const initialPosition = useRef(null);

	const preventEventPropagation = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const onResizeStart = (e) => {
		preventEventPropagation(e);
		setResizingColumn(name);
		setIsHovering(true);
		initialPosition.current = e.clientX;
	};

	const onResize = (e) => {
		const offsetFromInitialPosition = e.clientX - initialPosition.current;
		setWidth(name, width + offsetFromInitialPosition);
	};

	const onResizeEnd = (e) => {
		preventEventPropagation(e);
		setResizingColumn('');
		setIsHovering(false);
		initialPosition.current = null;
	};

	const handleMouseOver = () => setIsHovering(true);
	const handleMouseOut = () => {
		if (!resizingColumn) setIsHovering(false);
	};
	
	const onMouseDown = (e) => {
		onResizeStart(e);

		const overlay = document.createElement('div');
		overlay.style.cssText = overlayStyles;
		document.body.appendChild(overlay);

		const onMouseUp = (ev) => {
			onResizeEnd(ev);
			document.body.removeChild(overlay);
		};

		overlay.addEventListener('mousemove', onResize);
		overlay.addEventListener('mouseup', onMouseUp);
	};

	const getStyle = () => {
		if (resizingColumn && isHovering) return 'solid';
		if (isHovering) return 'dashed';
		return 'none';
	};

	return (
		<DelimiterLine
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			$offset={getWidth(name)}
			$style={getStyle()}
		>
			<ResizerElement onMouseDown={onMouseDown} />
		</DelimiterLine>
	);
};