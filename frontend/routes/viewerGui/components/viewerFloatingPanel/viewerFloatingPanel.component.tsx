/**
 *  Copyright (C) 2021 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.ś
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';
import { Rnd } from 'react-rnd';
import { getWindowHeight } from '../../../../helpers/rendering';

const minPanelHeight = () => {
	const height = getWindowHeight() * 0.3;
	return height < 300 ? 300 : height;
};

const cachePositions = {};

const PANEL_MIN_WIDTH = 380;
const PANEL_DEFAULT_OFFSET = 40;

export const FloatingPanel = ({index , children,  panel}) => {
	let defaultPositionSize: { x: number, y: number, width: number, height: number } ;

	if ( cachePositions[panel]) {
		defaultPositionSize = cachePositions[panel];
	} else {
		const offset = index * PANEL_DEFAULT_OFFSET;
		const width = PANEL_MIN_WIDTH;
		const height = getWindowHeight() - offset - 120;
		const x = offset;
		const y = offset;
		defaultPositionSize = {width, height, x, y};
		cachePositions[panel] = defaultPositionSize;
	}

	const updateCache =  (from, x, y, dw, dh) => {
		const cachedPositionSize = cachePositions[panel];
		switch (from) {
			case 'top':
			case 'topRight':
				cachedPositionSize.y -= dh;
				break;
			case 'left':
			case 'bottomLeft':
				cachedPositionSize.x -= dw;
				break;
			case 'topLeft':
				cachedPositionSize.x -= dw;
				cachedPositionSize.y -= dh;
			default:
				cachedPositionSize.x = x;
				cachedPositionSize.y = y;
				break;
		}

		cachedPositionSize.width += dw;
		cachedPositionSize.height += dh;
	};

	return (
		<Rnd
			dragHandleClassName="panelTitle"
			default={defaultPositionSize}
			minWidth={PANEL_MIN_WIDTH}
			minHeight={minPanelHeight()}
			bounds="#gui-container"
			onResizeStop={(...args) => updateCache(args[2], 0, 0, args[3].width, args[3].height)}
			onDragStop={(...args) => updateCache('abs', args[1].x, args[1].y, 0, 0)}
			>
				{children}
		</Rnd>
		);
};
