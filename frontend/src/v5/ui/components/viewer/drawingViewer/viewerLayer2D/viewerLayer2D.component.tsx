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
import { SvgArrow } from './svgArrow/svgArrow.component';
import { SvgCircle } from './svgCircle/svgCircle.component';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { Coord2D, Vector2D } from '@/v5/store/calibration/calibration.types';

export type ViewBoxType = ReturnType<PanZoomHandler['getOriginalSize']> & ReturnType<PanZoomHandler['getTransform']>;
type ViewerLayer2DProps = {
	viewBox: ViewBoxType,
	active: boolean,
	value?: Vector2D,
	onChange?: (arrow: Vector2D) => void;
};
export const ViewerLayer2D = ({ viewBox, active, value, onChange }: ViewerLayer2DProps) => {
	const [offsetStart, setOffsetStart] = useState<Coord2D>(value?.start || null);
	const [offsetEnd, setOffsetEnd] = useState<Coord2D>(value?.end || null);
	const previousViewBox = useRef<ViewBoxType>(null);
	const [mousePosition, setMousePosition] = useState<Coord2D>(null);
	const [drawingId] = useSearchParam('drawingId');

	const containerStyle: CSSProperties = {
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
		return [offsetX, offsetY].map((point) => point / viewBox.scale) as Coord2D;
	};

	const handleMouseDown = () => previousViewBox.current = viewBox;

	const handleMouseUp = () => {
		// check mouse up was fired after dragging or if it was an actual click
		if (!isEqual(viewBox, previousViewBox.current)) return;

		if (offsetEnd || (!offsetEnd && !offsetStart)) {
			setOffsetEnd(null);
			setOffsetStart(mousePosition);
		} else {
			setOffsetEnd(mousePosition);
			onChange?.({ start: offsetStart, end: mousePosition });
		}
	};

	const handleMouseMove = (e) => {
		setMousePosition(getCursorOffset(e));
	};

	const resetArrow = () => {
		setOffsetStart(null);
		setOffsetEnd(null);
	};

	useEffect(() => {
		if (!active && !offsetEnd) {
			resetArrow();
		}
	}, [active]);

	useEffect(() => { resetArrow(); }, [drawingId]);
	
	return (
		<Container style={containerStyle}>
			<LayerLevel>
				{mousePosition && active && <SvgCircle coords={mousePosition} scale={viewBox.scale} />}
				{offsetStart && <SvgArrow start={offsetStart} end={offsetEnd ?? mousePosition} scale={viewBox.scale} />}
			</LayerLevel>
			{active && (
				<LayerLevel
					onMouseUp={handleMouseUp}
					onMouseDown={handleMouseDown}
					onMouseMove={handleMouseMove}
				/>
			)}
		</Container>
	);
};
