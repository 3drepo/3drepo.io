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

import { memo, useContext, useRef } from 'react';
import { ResizableColumnsContext } from '../resizableColumnsContext';
import { Container, Item, ResizerMouseLandingArea, ResizerLine } from './resizableColumnsItem.styles';

const overlayStyles = `
	height: 100vh;
	width: 100vw;
	cursor: col-resize;
	pointer-events: all;
	position: absolute;
	z-index: 100;
	top: 0;
`;

const MemoizedItem = memo(
	({ children, className }: any) => <Item className={className}>{children}</Item>,
	(prevProps, nextProps) => (
		prevProps.children === nextProps.children
		&& prevProps.className === nextProps.className
	),
);

type ResizableColumnsItemProps = {
	children: any;
	name: string;
	hidden?: boolean;
	className?: string;
};
export const ResizableColumnsItem = ({ name, children, className, hidden = false }: ResizableColumnsItemProps) => {
	const { setWidth, getWidth, setIsResizing, isResizing, setResizerName, resizerName } = useContext(ResizableColumnsContext);
	const ref = useRef<HTMLDivElement>();
	const initialPosition = useRef(null);
	const currentWidth = getWidth(name);

	const onResize = (e) => {
		const offset = !initialPosition.current ? 0 : e.clientX - initialPosition.current;
		setWidth(name, currentWidth + offset);
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
		setIsResizing(true);
		setResizerName(name);
		initialPosition.current = e.clientX;

		const overlay = document.createElement('div');
		overlay.style.cssText = overlayStyles;
		document.body.appendChild(overlay);

		const onMouseUp = (ev) => {
			preventEventPropagation(ev);
			setIsResizing(false);
			setResizerName('');
			initialPosition.current = null;

			document.body.removeChild(overlay);
		};

		overlay.addEventListener('mouseup', onMouseUp);
		overlay.addEventListener('mousemove', onResize);
	};

	if (hidden) return null;

	return (
		<Container $width={currentWidth}>
			<MemoizedItem className={className}>{children}</MemoizedItem>
			<ResizerLine
				ref={ref}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				$isResizing={isResizing}
				$highlight={resizerName === name}
			>
				<ResizerMouseLandingArea onMouseDown={onMouseDown} />
			</ResizerLine>
		</Container>
	);
};
