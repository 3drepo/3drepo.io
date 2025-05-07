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
import { overlayStyles, ResizerElement } from './resizer.styles';
import { ResizableTableContext } from '../../../../resizableTableContext';
import { DelimiterLine } from '@controls/resizableTableContext/delimiterLine/delimiterLine.styles';

type ResizerProps = { name: string };
export const Resizer = ({ name }: ResizerProps) => {
	const { setWidth, getWidth, setIsResizing, isResizing, setResizerName, resizerName, isHidden } = useContext(ResizableTableContext);
	const width = getWidth(name);
	const hidden = isHidden(name);
	const initialPosition = useRef(null);

	const preventEventPropagation = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const onResizeStart = (e) => {
		preventEventPropagation(e);
		setIsResizing(true);
		setResizerName(name);
		initialPosition.current = e.clientX;
	};

	const onResize = (e) => {
		const offsetFromInitialPosition = e.clientX - initialPosition.current;
		setWidth(name, width + offsetFromInitialPosition);
	};

	const onResizeEnd = (e) => {
		preventEventPropagation(e);
		setIsResizing(false);
		setResizerName('');
		initialPosition.current = null;
	};

	const handleMouseOver = () => setResizerName(name);
	const handleMouseOut = () => {
		if (!isResizing) setResizerName('');
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
	
	if (hidden) return null;

	const getStyle = () => {
		if (resizerName !== name) return 'none';
		if (isResizing) return 'solid';
		return 'dashed';
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