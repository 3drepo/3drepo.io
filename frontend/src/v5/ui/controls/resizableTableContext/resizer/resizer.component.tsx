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

import { useContext, useRef } from 'react';
import { overlayStyles, ResizerElement, ResizerLine } from './resizer.styles';
import { ResizableTableContext } from '../resizableTableContext';

type ResizerProps = { name: string };
export const Resizer = ({ name }: ResizerProps) => {
	const { setWidth, getWidth, setIsResizing, isResizing, setResizerName, resizerName, isHidden } = useContext(ResizableTableContext);
	const width = getWidth(name);
	const hidden = isHidden(name);
	const initialPosition = useRef(null);

	const onResizeStart = () => {
		setIsResizing(true);
		setResizerName(name);
	};

	const onResize = (e) => {
		const offsetFromInitialPosition = e.clientX - initialPosition.current;
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

	const preventEventPropagation = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};
	
	const onMouseDown = (e) => {
		preventEventPropagation(e);
		onResizeStart();
		initialPosition.current = e.clientX;

		const overlay = document.createElement('div');
		overlay.style.cssText = overlayStyles;
		document.body.appendChild(overlay);

		const onMouseUp = (ev) => {
			preventEventPropagation(ev);
			onResizeEnd();
			initialPosition.current = null;

			document.body.removeChild(overlay);
		};

		overlay.addEventListener('mouseup', onMouseUp);
		overlay.addEventListener('mousemove', onResize);
	};
	
	if (hidden) return null;

	return (
		<ResizerLine
			$offset={width}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
			$isResizing={isResizing}
			$highlight={resizerName === name}
		>
			<ResizerElement onMouseDown={onMouseDown} />
		</ResizerLine>
	);
};