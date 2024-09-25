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

import { CSSProperties, useContext, useEffect, useRef, useState } from 'react';
import { Container, LayerLevel } from './viewerLayer2D.styles';
import { PanZoomHandler } from '../panzoom/centredPanZoom';
import { isEqual } from 'lodash';
import { SvgArrow } from './svgArrow/svgArrow.component';
import { Cursor } from './cursor/cursor.component';
import { Coord2D, Vector2D } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { EMPTY_VECTOR } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';
import { SVGSnapHelper } from '../snapping/svgSnapHelper';
import { Vector2 } from 'three';
import { SnapType } from '../snapping/types';

export type ViewBoxType = ReturnType<PanZoomHandler['getOriginalSize']> & ReturnType<PanZoomHandler['getTransform']>;
type ViewerLayer2DProps = {
	viewBox: ViewBoxType,
	active: boolean,
	value?: Vector2D,
	snapHandler: SVGSnapHelper,
	snapping?: boolean,
	onChange?: (arrow: Vector2D) => void;
};

export const ViewerLayer2D = ({ viewBox, active, snapHandler, value, onChange, snapping }: ViewerLayer2DProps) => {
	const { isCalibrating } = useContext(CalibrationContext);
	const [offsetStart, setOffsetStart] = useState<Coord2D>(value[0]);
	const [offsetEnd, setOffsetEnd] = useState<Coord2D>(value[1]);
	const previousViewBox = useRef<ViewBoxType>(null);
	const [mousePosition, setMousePosition] = useState<Coord2D>(null);
	const [snapType, setSnapType] = useState<SnapType>(SnapType.NONE);
	// const [snapping, setSnapping] = useState(false);

	const containerStyle: CSSProperties = {
		transformOrigin: '0 0',
		transform: `matrix(${viewBox.scale}, 0, 0, ${viewBox.scale}, ${viewBox.x}, ${viewBox.y})`,
		width: `${viewBox.width}px`,
		height: `${viewBox.height}px`,
	};

	// This returns the offset of the cursor from the top-left corner
	const getMousePosition = (e) => {
		return new Vector2(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
	};

	const handleMouseDown = () => previousViewBox.current = viewBox;

	const handleMouseUp = () => {
		// check if mouse up was fired after dragging or if it was an actual click
		if (!isEqual(viewBox, previousViewBox.current)) return;

		if (offsetEnd || (!offsetEnd && !offsetStart)) {
			setOffsetEnd(null);
			setOffsetStart(mousePosition);
			onChange(EMPTY_VECTOR);
		} else if (!isEqual(offsetStart, mousePosition)) {
			setOffsetEnd(mousePosition);
			onChange?.([offsetStart, mousePosition]);
		}
	};

	const handleMouseMove = (e) => {
		let mousePos = getMousePosition(e);

		const radius = 10 / viewBox.scale;

		const results = snapHandler?.snap(mousePos, radius) || { closestNode: undefined, closestIntersection: undefined, closestEdge: undefined };

		if (results.closestNode != null) {
			setSnapType(SnapType.NODE);
			mousePos = results.closestNode;
		} else if (results.closestIntersection != null) {
			setSnapType(SnapType.INTERSECTION);
			mousePos = results.closestIntersection;
		} else if (results.closestEdge != null) {
			setSnapType(SnapType.EDGE);
			mousePos = results.closestEdge;
		} else {
			setSnapType(SnapType.NONE);
		}

		setMousePosition([mousePos.x, mousePos.y]);
	};

	const handleMouseLeave = () => setMousePosition(undefined);

	const resetArrow = () => {
		setOffsetStart(null);
		setOffsetEnd(null);
	};

	useEffect(() => {
		// setSnapping(active);
		if (!active && !offsetEnd) {
			resetArrow();
		}
	}, [active]);

	return (
		<Container style={containerStyle} id="viewerLayer2d" >
			<LayerLevel>
				{snapping && mousePosition &&  <Cursor coord={mousePosition} scale={viewBox.scale} snapType={snapType} />}
				{isCalibrating && offsetStart && <SvgArrow start={offsetStart} end={offsetEnd ?? mousePosition} scale={viewBox.scale} />}
			</LayerLevel>
			<LayerLevel
				onMouseUp={handleMouseUp}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			/>
		</Container>
	);
};
