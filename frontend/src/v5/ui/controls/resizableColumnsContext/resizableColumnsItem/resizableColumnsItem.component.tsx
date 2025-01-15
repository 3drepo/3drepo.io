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

import { memo, useContext, useEffect, useRef } from 'react';
import { HIDDEN_RESIZER_OFFSET, ResizableColumnsContext } from '../resizableColumnsContext';
import { Container, Item, Resizer, ResizerContainer } from './resizableColumnsItem.styles';
import { useResizable } from '../useResizable';

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
	const { setWidth, getWidth, setIsResizing, setResizerOffset } = useContext(ResizableColumnsContext);
	const ref = useRef<HTMLDivElement>();
	const currentWidth = getWidth(name);

	const onResize = (offset) => {
		setResizerOffset(ref.current?.offsetLeft ?? 0);
		setWidth(name, currentWidth + offset);
	};
	const { isResizing, onMouseDown } = useResizable(onResize);

	const handleMouseOver = () => setResizerOffset(ref.current.offsetLeft);
	const handleMouseOut = () => {
		if (!isResizing) setResizerOffset(HIDDEN_RESIZER_OFFSET);
	};

	useEffect(() => {
		setIsResizing(isResizing);
		if (!isResizing) setResizerOffset(HIDDEN_RESIZER_OFFSET);
	}, [isResizing]);

	if (hidden) return null;

	return (
		<Container $width={currentWidth}>
			<MemoizedItem className={className}>{children}</MemoizedItem>
			<ResizerContainer ref={ref} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
				<Resizer onMouseDown={onMouseDown} />
			</ResizerContainer>
		</Container>
	);
};
