/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { CSSProperties, useEffect, useRef, useState } from 'react';
import { Container, LayerLevel } from './viewerLayer2D.styles';
import { PanZoomHandler } from '../panzoom/centredPanZoom';
import { isEqual } from 'lodash';
import { Offset, SvgArrow } from './svgArrow/svgArrow.component';

export type ViewBoxType = ReturnType<PanZoomHandler['getOriginalSize']> & ReturnType<PanZoomHandler['getTransform']>;
type ViewerLayer2DProps = {
	viewBox: ViewBoxType,
	active: boolean,
};
export const ViewerLayer2D = ({ viewBox, active }: ViewerLayer2DProps) => {
	const [offsetStart, setOffsetStart] = useState<Offset | null>(null);
	const [offsetEnd, setOffsetEnd] = useState<Offset | null>(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const previousOffset = useRef<Offset>([0, 0]);
	const previousViewBox = useRef(null);

	const layerStyle: CSSProperties = {
		transformOrigin: '0 0',
		transform: `matrix(${viewBox.scale}, 0, 0, ${viewBox.scale}, ${viewBox.x}, ${viewBox.y})`,
		width: `${viewBox.width}px`,
		height: `${viewBox.height}px`,
	};

	// This returns the offset of the cursor from the top-left corner
	const getCursorOffset = (e) => {
		const rect = e.target.getBoundingClientRect();
		const offsetX = e.clientX - rect.left;
		const offsetY = e.clientY - rect.top;
		return [offsetX, offsetY].map((point) => point / viewBox.scale) as Offset;
	};

	const handleMouseDown = () => previousViewBox.current = viewBox;

	const handleMouseUp = (e) => {
		// check mouse up was fired after dragging or if it was an actual click
		if (!isEqual(viewBox, previousViewBox.current)) return;
		const offset = getCursorOffset(e);

		if (isDrawing) {
			setOffsetEnd(offset);
		} else {
			setOffsetEnd(offset);
			setOffsetStart(offset);
			previousOffset.current = offset;
		}
		setIsDrawing(!isDrawing);
	};

	const handleMouseMove = (e) => {
		if (isDrawing) {
			setOffsetEnd(getCursorOffset(e));
		}
	};

	useEffect(() => {
		if (isDrawing) {
			setOffsetStart(null);
			setOffsetEnd(null);
		}
	}, [active]);
	
	return (
		<Container>
			<LayerLevel style={layerStyle}>
				{offsetEnd && <SvgArrow start={offsetStart} end={offsetEnd} />}
			</LayerLevel>
			{active && (
				<LayerLevel
					onMouseUp={handleMouseUp}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
					style={layerStyle}
				/>
			)}
		</Container>
	);
};
