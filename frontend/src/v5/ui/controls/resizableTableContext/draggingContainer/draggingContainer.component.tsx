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

import { CSSProperties, useRef } from 'react';

// This is not to interfere with other components and to keep the cursor as
// defined while resizing even when moving the mouse outside the table
export const overlayStyles = (cursor) => `
	height: 100vh;
	width: 100vw;
	pointer-events: all;
	position: absolute;
	z-index: 100;
	top: 0;
	cursor: ${cursor};
`;

type DraggingContainerProps = {
	onDragStart?: (e) => void,
	onDrag?: (offsetFromInitialPosition: number) => void,
	onDragEnd?: (e) => void,
	children?: any,
	className?: string,
	cursor?: CSSProperties['cursor'],
};
export const DraggingContainer = ({ onDragStart, onDrag, onDragEnd, children, className, cursor }: DraggingContainerProps) => {
	const initialPosition = useRef(null);

	const preventEventPropagation = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragStart = (e) => {
		preventEventPropagation(e);
		onDragStart?.(e);
		initialPosition.current = e.clientX;
	};

	const handleDrag = (e) => {
		const offsetFromInitialPosition = e.clientX - initialPosition.current;
		onDrag?.(offsetFromInitialPosition);
	};

	const handleDragEnd = (e) => {
		preventEventPropagation(e);
		onDragEnd?.(e);
		initialPosition.current = null;
	};

	const startDragging = (e) => {
		handleDragStart(e);

		const overlay = document.createElement('div');
		overlay.style.cssText = overlayStyles(cursor || 'grabbing');
		document.body.appendChild(overlay);

		const onMouseUp = (ev) => {
			handleDragEnd(ev);
			document.body.removeChild(overlay);
		};

		overlay.addEventListener('mousemove', handleDrag);
		overlay.addEventListener('mouseup', onMouseUp);
	};

	return (
		<div className={className} draggable onDragStart={startDragging}>
			{children}
		</div>
	);
};