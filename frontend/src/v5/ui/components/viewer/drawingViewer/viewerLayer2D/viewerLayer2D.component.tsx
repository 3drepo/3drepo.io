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

import { CSSProperties, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Container, LayerLevel } from './viewerLayer2D.styles';
import { PanZoomHandler } from '../panzoom/centredPanZoom';
import { isEqual } from 'lodash';
import { SnapCursor } from './cursor/cursor.component';
import { Coord2D } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';
import { SVGSnapHelper } from '../snapping/svgSnapHelper';
import { Vector2 } from 'three';
import { SnapType } from '../snapping/types';
import { DrawingViewerService } from '../drawingViewer.service';
import { CalibrationArrow } from './calibrationArrow/calibrationArrow.component';

export type ViewBoxType = ReturnType<PanZoomHandler['getOriginalSize']> & ReturnType<PanZoomHandler['getTransform']>;
type ViewerLayer2DProps = {
	viewBox: ViewBoxType,
	active: boolean,
	snapHandler: SVGSnapHelper,
	snapping?: boolean,
};

export const ViewerLayer2D = ({ viewBox, snapHandler }: ViewerLayer2DProps) => {
	const { isCalibrating } = useContext(CalibrationContext);
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

	const handleMouseUp = useCallback(() => {
		// check if mouse up was fired after dragging or if it was an actual click
		if (!isEqual(viewBox, previousViewBox.current)) return;

		DrawingViewerService.emitPickPointEvent(mousePosition);
	}, [mousePosition]);

	const handleMouseMove = useCallback((e) => {
		let mousePos = getMousePosition(e);

		if (DrawingViewerService.getSnapping()) {
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
		}

		setMousePosition([mousePos.x, mousePos.y]);
	}, [snapHandler]);

	const handleMouseLeave = () => setMousePosition(undefined);

	useEffect(() => { DrawingViewerService.emitPointPositionEvent(mousePosition); }, [mousePosition]);

	return (
		<Container style={containerStyle} id="viewerLayer2d" >
			<LayerLevel>
				{DrawingViewerService.getSnapping() && mousePosition &&  <SnapCursor coord={mousePosition} scale={viewBox.scale} snapType={snapType} />}
				{isCalibrating && <CalibrationArrow scale={viewBox.scale} />}
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