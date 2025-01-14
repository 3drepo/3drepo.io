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

export const useResizable = (onResize: (offset: number) => void) => {
	const [isResizing, setIsResizing] = useState(false);
	const initialPosition = useRef(null);

	const resize = (e) => onResize(!initialPosition.current ? 0 : e.clientX - initialPosition.current);

	const preventEventPropagation = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const onMouseDown = (e) => {
		setIsResizing(true);
		preventEventPropagation(e);

		const overlay = document.createElement('div');
		overlay.style.cssText = 'height:100vh;width:100vw;cursor:col-resize;pointer-events:all;background-color:#44000000;position:absolute;z-index:100;top:0';
		document.body.appendChild(overlay);

		initialPosition.current = e.clientX;
		resize(e);

		const onMouseUp = (ev) => {
			preventEventPropagation(ev);
			setIsResizing(false);
			document.body.removeChild(overlay);
			initialPosition.current = null;
		};

		overlay.addEventListener('mouseup', onMouseUp);
		overlay.addEventListener('mousemove', resize);
	};

	return { isResizing, onMouseDown };
};